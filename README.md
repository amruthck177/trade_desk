# ⚡ TradeDesk Pro 2.0 — Voice AI Invoicing & Field Operations OS

> **"आपका काम हमारी पहचान"** — Built specifically for Indian contractors, technicians, and field service professionals (Electricians, Plumbers, HVAC, Carpenters, and Appliance Technicians).

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Tailwind-orange.svg)](#-tech-stack)
[![GST](https://img.shields.io/badge/GST-Compliant%20Invoicing-emerald.svg)](#-features)
[![UPI](https://img.shields.io/badge/UPI-Dynamic%20QR%20Code-blue.svg)](#-features)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📖 Overview

**TradeDesk** is an AI-powered field service management and billing application tailored for Indian trade businesses. It allows technicians to speak naturally in **Hindi, English, or Hinglish** to generate GST-compliant A4 Tax Invoices and Estimates on-site in under 30 seconds, attach Before/After work photos, embed dynamic scannable UPI QR codes, collect digital signatures, and dispatch payment reminders over WhatsApp.

---

## ✨ Key Features & Capabilities

### 🎙️ 1. Multilingual Real-Time Voice Invoicing
* **Live Speech-to-Text**: Real-time waveform and transcript streaming directly in the browser via the Web Speech API.
* **Intelligent Entity Extraction**: Automatically parses client name, phone, labor hours, hourly rates, replacement materials, and GST rates from voice notes in Hindi, English, and Hinglish.
* **1-Click Trade Simulators**: Instant presets for AC Repair, Electrician & MCB, Plumbing Leaks, and Washing Machine repair.

### 📝 2. Quotation / Estimate Mode & 1-Click Conversion
* **Dual Document Types**: Toggle between creating an official **Tax Invoice (पक्का बिल)** or an **Estimate / Quotation (कच्चा बिल / कोटेशन)**.
* **1-Click Formalization**: Convert any Estimate into an official Tax Invoice with an `INV-` number and recalculated tax fields in one click.

### 📸 3. Before & After Job Proof Photos
* Attach "Before Repair" and "After Work (Finished)" job photos.
* Proof photos are saved to the cloud/filesystem and rendered directly on the live invoice preview.

### 💳 4. Dynamic UPI "SCAN & PAY" Stand & A4 PDF Engine
* **Scannable Dynamic QR**: Embeds a zero-friction dynamic UPI QR code containing the exact bill amount, payee VPA, and invoice reference.
* **1-Click Mobile Intent**: Mobile clients can tap "Open in UPI App" to pay instantly via Google Pay, PhonePe, or Paytm.
* **Professional A4 PDFs**: Generates styled PDF invoices with watermark seals (`PAID IN FULL` / `ESTIMATE`), digital signatures, and itemized labor/materials tables.

### 💸 5. Discount Engine & Tax Splits (CGST + SGST vs IGST)
* **Flexible Discounts**: Apply percentage (%) or flat Rupee (₹) discounts with real-time tax recalculation.
* **Intra-State vs Inter-State**:
  - **Intra-State**: Splits tax evenly into CGST (9%) + SGST (9%).
  - **Inter-State**: Automatically computes integrated IGST (18%).

### 📢 6. 3-Tier WhatsApp Reminders & Bulk Payment Recovery
* **Bulk Payment Recovery**: Broadcast payment alerts to all overdue clients in one click from the Dashboard.
* **3-Tier Notification Templates**:
  - **Tier 1 (Polite)**: Gentle greeting and friendly invoice notice.
  - **Tier 2 (Due Today)**: Payment due date reminder.
  - **Tier 3 (Urgent Overdue)**: Overdue notice with direct UPI settlement links.

### 📊 7. GSTR-1 Tax Report Export (Excel/CSV)
* Export one-click GSTR-1 CSV tables complete with Place of Supply, B2B/B2C classification, Gross Subtotal, Discounts, Taxable Subtotal, CGST, SGST, IGST, and Due Dates.

### 📇 8. Customer Mini-CRM & Rate Card Catalog
* Auto-syncs customers from every invoice with transaction history, outstanding balances, and quick contact actions.
* Standardized Rate Card catalog for fast 1-click addition of common services and spare parts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark theme with glassmorphism and neon accents)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Audio & Speech**: HTML5 Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Digital Signatures**: HTML5 Canvas Signature Pad

### Backend
- **Runtime**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **PDF Generation**: PDFKit
- **QR Code Engine**: QRCode
- **Messaging**: Twilio WhatsApp API (with fallback deep-links)
- **AI / NLP**: OpenAI GPT-4o-mini & Local Rule-Based Regex Parser Fallback

---

## 📁 Project Structure

```
trade_desk/
├── client/                     # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Layout, QR Stands, Audio Waveforms
│   │   ├── pages/              # Landing, Dashboard, NewJob, InvoicePreview, JobList, Customers, Catalog, Login, Register, Settings
│   │   ├── store/              # Zustand Auth & State Stores
│   │   ├── index.css           # Custom Glassmorphism & High-Contrast Styles
│   │   └── App.jsx             # Router & Protected Routes
│   ├── package.json
│   ├── tailwind.config.js      # Color Tokens & Theme Configuration
│   └── vite.config.js
│
├── server/                     # Backend Express Application
│   ├── config/                 # MongoDB Database Connection
│   ├── controllers/            # Auth, Job, Invoice, Customer, RateCard, Dashboard Controllers
│   ├── models/                 # User, Job, Invoice, Customer, RateCard Mongoose Schemas
│   ├── routes/                 # Express API Route Handlers
│   ├── services/               # OpenAI NLP Parser, PDFKit Generator, Twilio WhatsApp Service
│   ├── uploads/                # Stored PDF Invoices and Media
│   ├── server.js               # Server Entry Point (Port 5000)
│   ├── test-flow.js            # Automated E2E Test Suite
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/trade_desk.git
cd trade_desk

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/trade_desk
JWT_SECRET=your_super_secret_jwt_key
BASE_URL=http://localhost:5000

# Optional: AI Voice Parsing (Falls back to local parser if omitted)
OPENAI_API_KEY=your_openai_api_key

# Optional: Twilio WhatsApp (Falls back to WhatsApp Web deep-links if omitted)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 3. Run the Application

In separate terminal windows:

```bash
# Terminal 1: Start Backend Server
cd server
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend Client
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🧪 Running the Automated Test Suite

The repository includes an end-to-end integration test validating user registration, Hinglish voice parsing, estimate creation, 1-click invoice conversion, PDF compilation, dynamic QR codes, tiered reminders, bulk broadcasts, and GSTR-1 CSV exports.

```bash
cd server
node test-flow.js
```

### Test Output:
```
======================================================
🚀 STARTING TRADEDESK PRO 2.0 ENTERPRISE SUITE
======================================================
1. Testing User Registration with Pro Settings...       ✓
2. Testing Multilingual Voice Note Parsing...           ✓
3. Testing Estimate Creation with 10% Discount...       ✓
4. Testing 1-Click Estimate-to-Invoice Conversion...    ✓
5. Testing A4 PDF Compilation with UPI QR Code...       ✓
6. Testing Tier 3 Urgent WhatsApp Payment Reminder...   ✓
7. Testing Bulk WhatsApp Reminder Broadcast...          ✓
8. Testing Enhanced GSTR-1 CSV Report Export...         ✓
9. Cleaning up test database entries...                 ✓
======================================================
🎉 ALL PRO 2.0 ENTERPRISE TESTS PASSED (100%) 🎉
======================================================
```

---

## 📡 Key API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user with trade, UPI ID, and business details |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token |
| `POST` | `/api/jobs/parse-voice` | Parse voice note transcript into structured invoice data |
| `POST` | `/api/jobs` | Create a new Job (Invoice or Estimate) |
| `POST` | `/api/jobs/:id/convert` | 1-Click conversion of Estimate to Tax Invoice |
| `POST` | `/api/invoices/generate/:jobId` | Compile A4 PDF with dynamic UPI QR code |
| `POST` | `/api/invoices/remind/:id` | Dispatch tiered WhatsApp payment reminder |
| `POST` | `/api/invoices/bulk-remind` | Broadcast WhatsApp payment reminders to all pending clients |
| `GET` | `/api/invoices/export/gst` | Download GSTR-1 compliant CSV report |
| `GET` | `/api/customers` | Retrieve customer CRM records |
| `GET` | `/api/rate-cards` | Retrieve standardized service rate cards |
| `GET` | `/api/dashboard/stats` | Retrieve revenue analytics, KPI totals, and chart data |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
