# Video Walkthrough Script — LedgerCraft Invoice Generator
**Target Length**: 3 to 4.5 minutes  
**Format**: Loom or YouTube (Camera ON, Screen Shared)  
**Presenter**: Praveen

---

## 🎯 Step-by-Step Recording Guide

### 0:00 – 0:30 | Introduction & Project Goals
- **On Camera**: Smile, introduce yourself:
  > *"Hi everyone, I'm Praveen. Today I'm excited to present LedgerCraft, a full-stack, design-forward invoice generator built for modern accounting workflows. My goal was to combine financial mathematical rigor with a clean, responsive SaaS user experience."*
- **Screen Share**: Show the running application at `http://localhost:3000`.

---

### 0:30 – 1:45 | Live Feature Demo

1. **Verification Check Case**:
   - Point to the top banner:
     > *"First, let's look at the mathematical specification check: 2 units at $50.00 each, minus a $10.00 discount, with 10% tax. Notice how the subtotal is $100.00, the discount brings the taxable base to $90.00, tax is calculated as 10% of $90.00 ($9.00), resulting in an exact grand total of $99.00 with cents-accurate rounding."*
2. **Interactive Recalculation & Constraints**:
   - Change a line item quantity or unit price and watch the live preview update instantly.
   - Enter a discount greater than the subtotal:
     > *"Notice that if someone tries to enter a discount higher than the subtotal, the engine automatically clamps it to the subtotal and displays a helpful warning badge, preventing invalid negative balances."*
3. **Custom Fields & Visibility Toggle**:
   - Show the Custom Fields section in the editor:
     > *"Here we have custom fields like PO number, Project code, and internal audit notes. Notice this 'Internal Audit Ref' has visibility toggled to 'Hidden'. When we look at the live invoice on the right, only visible fields appear. The hidden field is completely omitted, and custom fields never impact the monetary calculations."*
4. **Backend Save & Retrieve (SQLite)**:
   - Click **Save** in the navbar:
     > *"Clicking Save persists the invoice to our Node 25 native SQLite database. If we open the 'Invoices' drawer, we can see all saved invoices with their real-time status and totals. We can switch between invoices with a single click, and all data reloads seamlessly."*
5. **Email Sending with Zero-Config Ethereal Preview**:
   - Click **Email**, show the pre-filled recipient and custom message, and click **Send Invoice**:
     > *"For email delivery, LedgerCraft supports Resend and custom SMTP, but it also includes a zero-config test sandbox powered by Nodemailer's Ethereal service. When sent in test mode, it delivers the email and gives us a direct clickable link to inspect the actual rendered HTML invoice email in the browser."*
   - (Optional) Click the preview link to show the delivered email in Ethereal.
6. **Print / PDF**:
   - Click **Print / PDF** (or press Ctrl+P) to show the browser print dialog:
     > *"Our print stylesheet strips away the editor, navbar, and background, rendering only the clean invoice sheet in high-resolution vector print format."*

---

### 1:45 – 3:00 | Code Architecture & What I'm Most Proud Of

- **Switch to Code Editor**:
1. **Strict Accounting Calculations (`src/lib/calculations.ts`)**:
   > *"What I'm most proud of is the calculation engine in `src/lib/calculations.ts`. In financial applications, floating point drift is a common pitfall. Here, every line item is rounded to cents first, summed to subtotal, discount is clamped to `[0, subtotal]`, and tax is computed on the discounted subtotal using `Number.EPSILON` precision rounding. We even have an automated test script (`scripts/verify-calculations.mjs`) that verifies all edge cases."*
2. **Zero-Dependency Native SQLite (`src/lib/db.ts`)**:
   > *"On the backend, instead of relying on heavy ORMs or native C++ modules like `better-sqlite3` which frequently fail to compile across operating systems, I leveraged Node.js 25's built-in `node:sqlite` (`DatabaseSync`). It's fast, zero-dependency, and provides reliable persistence out of the box."*
3. **Clean Modular Component Architecture**:
   > *"The frontend is built with Next.js App Router, TypeScript, and Tailwind CSS v4, keeping the editor, live preview, and modal drawers modular and accessible with visible focus rings and responsive layouts."*

---

### 3:00 – 3:45 | Reflections: What Went Well, Challenges & Future Work

- **What Went Well**:
  > *"The live preview synchronization, the print stylesheet, and the email sandbox all work together seamlessly."*
- **What Was Challenging**:
  > *"Ensuring absolute mathematical correctness while maintaining snappy real-time UI updates, and building a clean multi-provider email architecture with graceful fallbacks."*
- **What I'd Do With More Time**:
  > *"With more time, I would add multi-currency conversion with live FX rates, Stripe Elements integration for direct invoice payments, and export capabilities to QuickBooks Online and Xero."*

---

### 3:45 – 4:00 | Wrap Up
- **Back on Camera**:
  > *"Thank you for your time and for reviewing my submission. I look forward to your feedback and discussing how I can contribute to the team!"*
