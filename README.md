# LedgerCraft — Professional Accounting Invoice Studio

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Native_Node_25-003B57?logo=sqlite)](https://nodejs.org/api/sqlite.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Built for the **Full-Stack Web Developer with Strong Design Skills (Accounting Software)** technical evaluation.
>
> Candidate: **Praveen**  
> Spec verification check: **`2 × $50 - $10 discount + 10% tax = $99.00`** &check;

---

## 📸 Overview & Live Demo

LedgerCraft is a modern, responsive, full-stack invoice generation studio designed with accounting-first rigor and SaaS aesthetics. It couples a live real-time editor with a pixel-perfect, print-ready document preview, SQLite persistence, and multi-provider email delivery.

### Key Capabilities
- **Strict Accounting Math**: Cents-accurate monetary calculations preventing negative amounts and clamping discounts to subtotal.
- **Custom Metadata Fields**: Add custom business attributes (PO numbers, internal cost centers, payment routing). Toggle field visibility with instant document updates without affecting calculations.
- **Persistent Backend**: Native server-side SQLite database (`data/invoices.db`) using Node's built-in `node:sqlite` for saving and retrieving invoices.
- **Dual Mode Emailing**: Supports production providers (Resend, SMTP) plus a zero-configuration ephemeral test inbox (Ethereal) that provides instant in-browser preview links.
- **Print / PDF Ready**: Dedicated `@media print` stylesheet that removes UI chrome and prints only clean invoice sheets.
- **Design Customization**: Accent color palette (Indigo, Emerald, Slate, Blue, Rose) and template layouts (Modern, Classic Formal, Minimalist).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+ (Node 22 or 25 recommended for native `node:sqlite`)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/invoice-generator.git
cd invoice-generator

# Install dependencies (using pnpm or npm)
pnpm install
# or
npm install --ignore-scripts
```

### Environment Configuration

Copy the example environment configuration:
```bash
cp .env.example .env.local
```

> **Zero-Config Out-of-the-Box:**  
> If you leave `.env.local` blank, LedgerCraft automatically activates Nodemailer's **Ethereal Sandbox**. When you click "Send Invoice", it delivers the email to a test sandbox and returns a direct, clickable URL in the UI notification so you can inspect the rendered HTML email in your browser without creating any third-party accounts.

To connect real delivery providers:
```ini
# Option A: Resend API
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=invoicing@yourdomain.com

# Option B: Custom SMTP (Mailgun, Postmark, AWS SES, Gmail)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your_secret_password
EMAIL_FROM=billing@yourdomain.com
```

### Running the Application

```bash
# Start development server
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To run the production build:
```bash
pnpm build
pnpm start
```

---

## 🧮 Calculation Precision & Edge Case Handling

In accounting software, mathematical precision is non-negotiable. Floating-point arithmetic errors (such as `0.1 + 0.2 = 0.30000000000000004`) lead to balance sheet discrepancies.

LedgerCraft implements the exact calculation order specified in the requirements:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Line Total: round(max(0, quantity) × max(0, unitPrice)) to cents    │
│ 2. Subtotal: sum of all rounded Line Totals                             │
│ 3. Discount: clamped to [0, Subtotal]                                   │
│ 4. Discounted Subtotal: Subtotal - Discount                             │
│ 5. Tax Amount: round(Discounted Subtotal × (max(0, taxRate) / 100))     │
│ 6. Grand Total: Discounted Subtotal + Tax Amount                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Specification Check Case Verification:
- **Item**: 2 units × $50.00 = **$100.00**
- **Subtotal**: **$100.00**
- **Discount**: **$10.00**
- **Discounted Subtotal (Taxable Base)**: $100.00 - $10.00 = **$90.00**
- **Tax (10%)**: 10% of $90.00 = **$9.00**
- **Grand Total**: $90.00 + $9.00 = **$99.00** &check;

### Edge Cases Handled:
1. **Negative Quantities & Prices**: Filtered using `Math.max(0, val)`. Negative values cannot produce negative line totals.
2. **Discount Exceeding Subtotal**: Discount is constrained by `Math.min(discount, subtotal)`. The UI also shows an immediate visual warning badge (`Discount capped at subtotal`).
3. **Floating Point Safety**: Every intermediate and final rounding operation uses `Math.round((value + Number.EPSILON) * 100) / 100`.
4. **Fractional Quantities**: Decimal quantities (e.g. `37.5 hours` at `$120/hr`) are fully supported and rounded to cents.
5. **Custom Fields Isolation**: Custom fields have zero effect on totals calculation; they are strictly metadata attributes.

You can run the verification script at any time:
```bash
node scripts/verify-calculations.mjs
```

---

## 📐 Architecture & Notable Design Choices

### 1. Embedded SQLite with Zero Compilation Hassles (`node:sqlite`)
- **Choice**: Leveraging Node.js 22/25's built-in `node:sqlite` module via `DatabaseSync`.
- **Why**: Traditional SQLite drivers (`sqlite3`, `better-sqlite3`) require native C++ builds via `node-gyp`, which frequently fail on Windows or in CI/CD without Visual Studio Build Tools installed. Node's native SQLite provides persistent database functionality with zero external dependencies and zero build step.
- **Fallback**: Includes an in-memory and JSON storage fallback in case file system access is constrained.

### 2. Print-First Document Architecture (`@media print`)
- **Choice**: Clean CSS print media queries rather than client-heavy canvas/DOM-to-PDF libraries (like `jspdf` or `html2pdf`).
- **Why**: Native browser print engines render high-resolution vector fonts, support selectable text, preserve crisp table rules, produce smaller file sizes, and work out of the box on every device via "Save as PDF".

### 3. Interactive Custom Fields with Visibility Toggle
- **Choice**: Dedicated `CustomField` model with `id`, `label`, `value`, and `isVisible`.
- **Why**: Accounting workflows often require internal notes (e.g., Internal Cost Center, Auditor Reference) that should remain in the editor but MUST NOT be printed on the invoice sent to the client. The eye toggle enables immediate inclusion or exclusion.

### 4. Zero-Config Email Sandbox
- **Choice**: Integrated Nodemailer Ethereal sandbox fallback when no API credentials are provided.
- **Why**: When evaluators test an application, requiring them to sign up for a Resend or SendGrid API key introduces friction. The Ethereal integration automatically generates a test mailbox, delivers the email, and returns a direct link to inspect the rendered HTML in a web browser.

---

## 🤖 AI Tools Used & Human-in-the-Loop Process

- **Tools Used**: Antigravity with Gemini 2.5 Pro / Flash models.
- **Directing the AI**:
  1. **Architecture & Scope Framing**: Directed the model to scaffold a clean Next.js App Router application with Tailwind CSS v4 and TypeScript.
  2. **Accounting Math Verification**: Directed the AI to enforce mathematical invariants (cents rounding, subtotal clamping) and write a standalone validation script to test the exact scenario `2 × $50 - $10 discount + 10% tax = $99.00`.
  3. **Windows & OneDrive File Lock Handling**: Diagnosed and resolved Windows file system sync locks during dependency installation by leveraging `pnpm`'s content-addressable store.
  4. **Collaborative Browser Verification**: Used collaborative browser automation tools (`preview_*`) to verify the rendered DOM, test email delivery, inspect the SQLite drawer, and capture high-resolution screenshots.

---

## 🔮 What I'd Improve or Add With More Time

1. **Multi-Currency Support**: Add live currency conversion with exchange rate feeds (EUR, GBP, CAD, JPY) and regional VAT formats.
2. **Client Portal / Direct Payment**: Integration with Stripe Elements for direct ACH and credit card invoice settlement.
3. **Recurring Invoices & Cron Jobs**: Scheduled automated invoice generation and email dispatch for retainer clients.
4. **Audit Trail & Activity Log**: Timestamped record of when invoices are created, modified, sent, viewed, and paid.
5. **Export to Accounting Software**: 1-click export to QuickBooks Online (QBO) and Xero via CSV or OAuth REST APIs.

---

## 🎬 Walkthrough Video Script

See [`WALKTHROUGH_SCRIPT.md`](./WALKTHROUGH_SCRIPT.md) for the 3-minute video presentation guide covering the live demo, technical highlights, and accounting architecture.
