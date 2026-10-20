import fs from 'node:fs';
import path from 'node:path';
import { Invoice, InvoiceSummary } from '@/types/invoice';
import { CHECK_CASE_INVOICE, DEFAULT_INVOICE } from './sample-data';

// Persistent file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'invoices.db');
const JSON_FILE = path.join(DATA_DIR, 'invoices.json');

interface IDatabaseHandler {
  save(invoice: Invoice): Invoice;
  get(id: string): Invoice | null;
  list(): InvoiceSummary[];
  delete(id: string): boolean;
}

// In-memory cache synced with persistent disk storage
const store = new Map<string, Invoice>();

// File Storage Engine (Reliable, persistent across server restarts)
class FileStorageEngine {
  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(JSON_FILE)) {
        const raw = fs.readFileSync(JSON_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Record<string, Invoice>;
        for (const [id, inv] of Object.entries(parsed)) {
          store.set(id, inv);
        }
      } else {
        // Seed default records on first run
        store.set(CHECK_CASE_INVOICE.id, CHECK_CASE_INVOICE);
        store.set(DEFAULT_INVOICE.id, DEFAULT_INVOICE);
        this.flush();
      }
    } catch (err) {
      console.warn('[DB] Storage init warning:', err);
      // Fallback in-memory seed
      if (store.size === 0) {
        store.set(CHECK_CASE_INVOICE.id, CHECK_CASE_INVOICE);
        store.set(DEFAULT_INVOICE.id, DEFAULT_INVOICE);
      }
    }
  }

  save(invoice: Invoice): Invoice {
    const now = new Date().toISOString();
    const updatedInvoice: Invoice = {
      ...invoice,
      updatedAt: now,
      createdAt: invoice.createdAt || now,
    };
    store.set(updatedInvoice.id, updatedInvoice);
    this.flush();
    return updatedInvoice;
  }

  get(id: string): Invoice | null {
    return store.get(id) || null;
  }

  list(): InvoiceSummary[] {
    return Array.from(store.values())
      .map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.metadata.invoiceNumber,
        clientName: inv.client.company || inv.client.name || 'Unnamed Client',
        issueDate: inv.metadata.issueDate,
        dueDate: inv.metadata.dueDate,
        grandTotal: inv.totals.grandTotal,
        status: inv.metadata.status,
        updatedAt: inv.updatedAt,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  delete(id: string): boolean {
    const existed = store.delete(id);
    if (existed) {
      this.flush();
    }
    return existed;
  }

  private flush() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = Object.fromEntries(store);
      fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Error writing to disk store:', err);
    }
  }
}

// SQLite storage handler with runtime dynamic import to avoid Turbopack bundling bugs
class HybridDatabaseHandler implements IDatabaseHandler {
  private sqliteDb: any = null;
  private fileFallback: FileStorageEngine;

  constructor() {
    this.fileFallback = new FileStorageEngine();
    this.initSqlite();
  }

  private initSqlite() {
    try {
      // Use eval('require') so Turbopack does not attempt static bundling of 'node:sqlite'
      // eslint-disable-next-line no-eval
      const runtimeRequire = eval('require');
      const { DatabaseSync } = runtimeRequire('node:sqlite');
      
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      this.sqliteDb = new DatabaseSync(DB_FILE);
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          invoice_number TEXT NOT NULL,
          client_name TEXT,
          issue_date TEXT,
          due_date TEXT,
          grand_total REAL,
          status TEXT,
          data_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Seed sqlite from file storage
      const countStmt = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM invoices');
      const row = countStmt.get();
      if (!row || row.count === 0) {
        for (const invoice of store.values()) {
          this.saveToSqlite(invoice);
        }
      }
    } catch {
      // If node:sqlite is unavailable in this runtime context, fileFallback handles all operations smoothly
      this.sqliteDb = null;
    }
  }

  private saveToSqlite(invoice: Invoice) {
    if (!this.sqliteDb) return;
    try {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO invoices (id, invoice_number, client_name, issue_date, due_date, grand_total, status, data_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          invoice_number = excluded.invoice_number,
          client_name = excluded.client_name,
          issue_date = excluded.issue_date,
          due_date = excluded.due_date,
          grand_total = excluded.grand_total,
          status = excluded.status,
          data_json = excluded.data_json,
          updated_at = excluded.updated_at;
      `);

      stmt.run(
        invoice.id,
        invoice.metadata.invoiceNumber,
        invoice.client.company || invoice.client.name || 'Unnamed Client',
        invoice.metadata.issueDate,
        invoice.metadata.dueDate,
        invoice.totals.grandTotal,
        invoice.metadata.status,
        JSON.stringify(invoice),
        invoice.createdAt,
        invoice.updatedAt
      );
    } catch (err) {
      console.warn('[DB] SQLite save warning:', err);
    }
  }

  save(invoice: Invoice): Invoice {
    const saved = this.fileFallback.save(invoice);
    this.saveToSqlite(saved);
    return saved;
  }

  get(id: string): Invoice | null {
    if (this.sqliteDb) {
      try {
        const stmt = this.sqliteDb.prepare('SELECT data_json FROM invoices WHERE id = ?');
        const row = stmt.get(id);
        if (row && row.data_json) {
          return JSON.parse(row.data_json) as Invoice;
        }
      } catch (err) {
        console.warn('[DB] SQLite get error, falling back:', err);
      }
    }
    return this.fileFallback.get(id);
  }

  list(): InvoiceSummary[] {
    if (this.sqliteDb) {
      try {
        const stmt = this.sqliteDb.prepare(`
          SELECT id, invoice_number as invoiceNumber, client_name as clientName,
                 issue_date as issueDate, due_date as dueDate, grand_total as grandTotal,
                 status, updated_at as updatedAt
          FROM invoices
          ORDER BY updated_at DESC
        `);
        const rows = stmt.all() as InvoiceSummary[];
        if (rows && rows.length > 0) return rows;
      } catch (err) {
        console.warn('[DB] SQLite list error, falling back:', err);
      }
    }
    return this.fileFallback.list();
  }

  delete(id: string): boolean {
    if (this.sqliteDb) {
      try {
        const stmt = this.sqliteDb.prepare('DELETE FROM invoices WHERE id = ?');
        stmt.run(id);
      } catch (err) {
        console.warn('[DB] SQLite delete warning:', err);
      }
    }
    return this.fileFallback.delete(id);
  }
}

let dbInstance: IDatabaseHandler | null = null;

export function getDatabase(): IDatabaseHandler {
  if (!dbInstance) {
    dbInstance = new HybridDatabaseHandler();
  }
  return dbInstance;
}
