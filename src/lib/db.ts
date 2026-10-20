import fs from 'node:fs';
import path from 'node:path';
import { Invoice, InvoiceSummary } from '@/types/invoice';
import { CHECK_CASE_INVOICE, DEFAULT_INVOICE } from './sample-data';

// Determine data directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'invoices.db');
const JSON_BACKUP_FILE = path.join(DATA_DIR, 'invoices_fallback.json');

// Interface for database operations
interface IDatabaseHandler {
  save(invoice: Invoice): Invoice;
  get(id: string): Invoice | null;
  list(): InvoiceSummary[];
  delete(id: string): boolean;
}

// Memory fallback store
const memoryStore = new Map<string, Invoice>();

// Initialize fallback with sample data
function initMemoryStore() {
  if (memoryStore.size === 0) {
    memoryStore.set(CHECK_CASE_INVOICE.id, CHECK_CASE_INVOICE);
    memoryStore.set(DEFAULT_INVOICE.id, DEFAULT_INVOICE);
  }
}

// SQLite Database Implementation using node:sqlite (built into Node 22+)
class SqliteDatabaseHandler implements IDatabaseHandler {
  private db: any = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Dynamic import / require of node:sqlite
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(DB_FILE);

      // Create table
      this.db.exec(`
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

      // Seed if empty
      const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM invoices');
      const row = countStmt.get();
      if (!row || row.count === 0) {
        this.save(CHECK_CASE_INVOICE);
        this.save(DEFAULT_INVOICE);
      }
    } catch (err) {
      console.warn('[DB] SQLite initialization failed, falling back to JSON storage:', err);
      this.db = null;
      initMemoryStore();
    }
  }

  save(invoice: Invoice): Invoice {
    const now = new Date().toISOString();
    const updatedInvoice: Invoice = {
      ...invoice,
      updatedAt: now,
      createdAt: invoice.createdAt || now,
    };

    if (!this.db) {
      memoryStore.set(updatedInvoice.id, updatedInvoice);
      this.saveToJsonFallback();
      return updatedInvoice;
    }

    try {
      const stmt = this.db.prepare(`
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
        updatedInvoice.id,
        updatedInvoice.metadata.invoiceNumber,
        updatedInvoice.client.name || updatedInvoice.client.company || 'Unnamed Client',
        updatedInvoice.metadata.issueDate,
        updatedInvoice.metadata.dueDate,
        updatedInvoice.totals.grandTotal,
        updatedInvoice.metadata.status,
        JSON.stringify(updatedInvoice),
        updatedInvoice.createdAt,
        updatedInvoice.updatedAt
      );

      return updatedInvoice;
    } catch (err) {
      console.error('[DB] SQLite save error, saving to memory fallback:', err);
      memoryStore.set(updatedInvoice.id, updatedInvoice);
      return updatedInvoice;
    }
  }

  get(id: string): Invoice | null {
    if (!this.db) {
      return memoryStore.get(id) || null;
    }

    try {
      const stmt = this.db.prepare('SELECT data_json FROM invoices WHERE id = ?');
      const row = stmt.get(id);
      if (row && row.data_json) {
        return JSON.parse(row.data_json) as Invoice;
      }
      return memoryStore.get(id) || null;
    } catch (err) {
      console.error('[DB] SQLite get error:', err);
      return memoryStore.get(id) || null;
    }
  }

  list(): InvoiceSummary[] {
    if (!this.db) {
      return Array.from(memoryStore.values()).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.metadata.invoiceNumber,
        clientName: inv.client.company || inv.client.name || 'Unnamed Client',
        issueDate: inv.metadata.issueDate,
        dueDate: inv.metadata.dueDate,
        grandTotal: inv.totals.grandTotal,
        status: inv.metadata.status,
        updatedAt: inv.updatedAt,
      })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    try {
      const stmt = this.db.prepare(`
        SELECT id, invoice_number as invoiceNumber, client_name as clientName,
               issue_date as issueDate, due_date as dueDate, grand_total as grandTotal,
               status, updated_at as updatedAt
        FROM invoices
        ORDER BY updated_at DESC
      `);
      return stmt.all() as InvoiceSummary[];
    } catch (err) {
      console.error('[DB] SQLite list error:', err);
      return [];
    }
  }

  delete(id: string): boolean {
    memoryStore.delete(id);
    if (!this.db) return true;

    try {
      const stmt = this.db.prepare('DELETE FROM invoices WHERE id = ?');
      stmt.run(id);
      return true;
    } catch (err) {
      console.error('[DB] SQLite delete error:', err);
      return false;
    }
  }

  private saveToJsonFallback() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = Object.fromEntries(memoryStore);
      fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Fallback JSON write warning:', err);
    }
  }
}

// Global singleton instance
let dbInstance: IDatabaseHandler | null = null;

export function getDatabase(): IDatabaseHandler {
  if (!dbInstance) {
    dbInstance = new SqliteDatabaseHandler();
  }
  return dbInstance;
}
