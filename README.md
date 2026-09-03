# ⚡ TradeDesk Pro 3.0 — Voice AI Invoicing & Field Operations OS

> **"आपका काम हमारी पहचान"** — Built specifically for Indian contractors, technicians, and field service professionals (Electricians, Plumbers, HVAC, Carpenters, and Appliance Technicians).

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Tailwind-orange.svg)](#-tech-stack)
[![GST](https://img.shields.io/badge/GST-Compliant%20Invoicing-emerald.svg)](#-key-features--capabilities)
[![UPI](https://img.shields.io/badge/UPI-Dynamic%20QR%20Code-blue.svg)](#-key-features--capabilities)
[![Soundbox](https://img.shields.io/badge/Soundbox-Voice%20Chime-teal.svg)](#-key-features--capabilities)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📖 Overview

**TradeDesk** is an all-in-one AI operating system and billing suite engineered for Indian trade businesses. It enables technicians to speak naturally in **Hindi, English, or Hinglish** to generate GST-compliant A4 Tax Invoices and Estimates on-site in under 30 seconds, attach Before/After work photos, embed dynamic scannable UPI QR codes, collect advance token deposits, dispatch Karigars, announce payments via an **In-App Audio Soundbox**, manage credit in a **Digital Khata Ledger**, and schedule **AMC recurring service contracts**.

---

## ✨ Key Features & Capabilities

### 🎙️ 1. Multilingual Real-Time Voice Invoicing
* **Live Speech-to-Text**: Real-time waveform and transcript streaming directly in the browser via the Web Speech API.
* **Intelligent Entity Extraction**: Automatically parses client name, phone, labor hours, hourly rates, replacement materials, and GST rates from voice notes in Hindi, English, and Hinglish.
* **1-Click Trade Simulators**: Instant presets for AC Repair, Electrician & MCB, Plumbing Leaks, and Washing Machine repair.

### 🔊 2. In-App Audio "Soundbox" & Payment Simulation
* **Voice Payment Announcements**: Native browser Web Speech & Web Audio synthesis announces: *"TradeDesk par [Amount] Rupaye Prapt Hue"*.
* **Instant UPI Webhook Simulator**: 1-tap simulation of real-time customer QR payments on site.

### 🌐 3. Interactive Customer Payment & Warranty Portal (`/pay/:invoiceNumber`)
* **Public Customer Link**: Clients open a verified mobile-friendly link on WhatsApp.
* **Interactive Before & After Split Slider**: Smooth drag-slider comparing damaged parts vs finished repair work.
* **30-Day Digital Warranty Certificate**: Verified badge protecting client investments.
* **1-Click UPI Intent**: Seamlessly trigger Google Pay, PhonePe, or Paytm with the exact payable balance.
* **Google 5-Star Review Booster**: Direct 1-tap link for happy customers to leave 5-star Google Reviews.

### 🪙 4. Advance Token Deposit & Split Billing
* Collect 20–50% advance for purchasing spare parts before starting work.
* Automatically deducts advance deposits and computes the remaining **Balance Due** on PDFs and payment links.

### 📖 5. Digital Khata & Supplier Ledger (`/khata`)
* **Customer Credit (ग्राहक उधार)**: Track uncollected balances with 1-click WhatsApp collection reminders.
* **Supplier Debt (दुकानदार उधार)**: Track money owed to local hardware and electrical distributor stores.

### 👥 6. Multi-Technician Karigar Dispatch & Commissions (`/team`)
* Add crew members (Master/Ustaad, Karigars, and Helpers).
* Automatically compute technician labor commissions on completed jobs and record weekly cash payouts.

### 🔁 7. AMC Recurring Maintenance Contracts (`/amc`)
* Schedule 3-month, 6-month, or 12-month recurring service visits for AC servicing, RO filter changes, and generators.
* Automated WhatsApp service due notices.

### 🖨️ 8. 58mm / 80mm ESC/POS Thermal Pocket Slip Printer
* Monochromatic thermal receipt format for handheld Bluetooth POS printers.

### 📝 9. Quotation / Estimate Mode & 1-Click Conversion
* **Dual Document Types**: Toggle between official **Tax Invoices (पक्का बिल)** or **Estimates / Quotations (कच्चा बिल / कोटेशन)**.
* **1-Click Formalization**: Convert any Estimate into an official Tax Invoice with an `INV-` number in one tap.

### 💸 10. Discount Engine & Tax Splits (CGST + SGST vs IGST)
* **Intra-State**: CGST (9%) + SGST (9%).
* **Inter-State**: Integrated IGST (18%).
* **Discounts**: Flat (₹) or Percentage (%).

### 📊 11. GSTR-1 Tax Report Export (Excel/CSV)
* Export one-click GSTR-1 CSV tables complete with Place of Supply, B2B/B2C classification, Gross Subtotal, Discounts, Taxable Subtotal, CGST, SGST, IGST, Advance Paid, Balance Due, and Due Dates.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark theme with glassmorphism and high-contrast text)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Audio & Soundbox**: HTML5 Web Speech API & Web Audio API synthesis
- **Digital Signatures**: HTML5 Canvas Signature Pad

### Backend
- **Runtime**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **PDF Generation**: PDFKit
- **QR Code Engine**: QRCode
- **Messaging**: Twilio WhatsApp API & Universal `wa.me` Deep-Links
- **AI / NLP**: OpenAI GPT-4o-mini & Local Rule-Based NLP Parser Fallback

---

## 📁 Project Structure

```
trade_desk/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Layout, SoundboxAudio, ThermalReceipt, Navbar
│   │   ├── pages/              # Landing, Dashboard, NewJob, InvoicePreview, JobList,
│   │   │                       # Customers, RateCards, KhataLedger, StaffManager, AmcTracker,
│   │   │                       # CustomerPortal, Login, Register, Settings
│   │   ├── store/              # Zustand Auth & State Stores
│   │   ├── index.css           # Glassmorphism & High-Contrast Typography
│   │   └── App.jsx             # Router & Public/Protected Routes
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express Application
│   ├── controllers/            # Auth, Job, Invoice, Customer, RateCard, Khata, Staff Controllers
│   ├── models/                 # User, Job, Invoice, Customer, RateCard, Khata, Staff Mongoose Schemas
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
- **MongoDB**: Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/amruthck177/trade_desk.git
cd trade_desk

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configuration (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/trade_desk
JWT_SECRET=your_super_secret_jwt_key
BASE_URL=http://localhost:5000

# Optional: Cloud AI & Twilio Keys (Built-in offline fallbacks work 100% without keys)
# OPENAI_API_KEY=your_openai_api_key
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 3. Start the Servers

```bash
# Terminal 1: Backend API
cd server
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Frontend App
cd client
npm run dev
# App runs on http://localhost:5173
```

---

## 🧪 Running the Automated Test Suite

```bash
cd server
node test-flow.js
```

### Test Output:
```
======================================================
🚀 STARTING TRADEDESK PRO 3.0 ENTERPRISE SUITE
======================================================
1. Testing User Registration & Profile...               ✓
2. Testing Staff / Karigar Management (/api/staff)...   ✓
3. Testing Job Creation with Advance, Staff & AMC...    ✓
4. Testing A4 PDF Compilation with Advance Split...     ✓
5. Testing Public Customer Portal Endpoint...           ✓
6. Testing Instant Payment Simulation Webhook...        ✓
7. Testing Digital Khata Ledger (/api/khata)...         ✓
8. Cleaning up test database entries...                 ✓
======================================================
🎉 ALL PRO 3.0 ENTERPRISE SUITE TESTS PASSED (100%) 🎉
======================================================
```

---

## 📡 Key API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user with trade, UPI ID, and business details |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token |
| `POST` | `/api/jobs` | Create a new Job (Invoice, Estimate, Advance, Staff, AMC) |
| `POST` | `/api/jobs/:id/convert` | 1-Click conversion of Estimate to Tax Invoice |
| `POST` | `/api/invoices/generate/:jobId` | Compile A4 PDF with dynamic UPI QR code & advance split |
| `GET` | `/api/invoices/public/:invoiceNumber` | Public endpoint for Customer Payment & Warranty Portal |
| `POST` | `/api/invoices/simulate-payment/:id` | Simulate instant UPI payment webhook |
| `GET` | `/api/khata` | Fetch Customer Credit & Supplier Debt records |
| `POST` | `/api/khata` | Record new Udhaar entry |
| `GET` | `/api/staff` | Fetch crew members and commission balances |
| `POST` | `/api/staff/:id/payout` | Record weekly commission payout |
| `GET` | `/api/invoices/export/gst` | Download GSTR-1 compliant CSV report |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
