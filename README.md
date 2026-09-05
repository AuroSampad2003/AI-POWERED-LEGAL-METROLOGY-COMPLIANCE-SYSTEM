
# INNOVATRIX — SIH26034

## AI-Powered Legal Metrology Compliance System

An AI-powered web/mobile-based solution that automatically analyzes packaged-product labels, extracts mandatory declarations, validates them against applicable Legal Metrology requirements, detects violations, and generates explainable compliance reports.

---

## 🎯 Problem Statement

**SIH26034**

> Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.

**Organization:** Ministry of Consumer Affairs, Food & Public Distribution  
**Department:** Department of Consumer Affairs  
**Category:** Software  
**Team:** INNOVATRIX

---

## 💡 Proposed Solution

Our solution is an **AI-powered web/mobile application** that combines **Computer Vision, OCR, AI-based information extraction, and a dynamic Legal Metrology Rule Engine** to automatically analyze packaged-product labels.

It extracts and validates mandatory declarations, performs **rule-based compliance checks**, detects violations, and generates **explainable, evidence-backed digital compliance reports**, with human review for uncertain cases.

The system also provides a **dashboard and search facility** for managing inspections, products, violations, and previously generated reports.

---

## 🔄 System Workflow

```text
Product Image
      ↓
Image Preprocessing
      ↓
OCR + AI Extraction
      ↓
Mandatory Declaration Identification
      ↓
Legal Metrology Rule Engine
      ↓
Violation Detection
      ↓
Compliance Result
      ↓
Digital Report
      ↓
Dashboard & Search

```
---

## ✨ Key Features
### 📷 Product Scanning
- Capture product images using camera
- Upload product/package images
- Support multiple package views

### 🔍 OCR & AI Extraction
- Text detection and recognition
- Automatic declaration extraction
- Bounding-box based evidence
- Confidence scoring
- Structured product information
  
### ⚖️ Compliance Checking
The system can check configured declarations such as:
- Manufacturer / Packer / Importer
- Common / Generic Product Name
- Net Quantity
- MRP
- Manufacturing / Packing Date
- Best Before / Use By, where applicable
- Consumer Care Details
- Country of Origin, where applicable
- Other applicable declarations
  
### 🚨 Violation Detection
```text
✅ COMPLIANT
❌ NON-COMPLIANT
⚠️ REVIEW REQUIRED
```
Each finding can contain:
- Detected field
- Missing/incorrect information
- Applicable rule
- Evidence region
- Confidence score
- Review status
  
### 📄 Digital Compliance Reports
Generate reports containing:
- Product information
- Extracted declarations
- Compliance status
- Violations
- Evidence
- Rule references
- Review information
  
### 📊 Compliance Dashboard
Monitor:
- Total inspections
- Compliant products
- Non-compliant products
- Review-required cases
- Violation categories
- Product history
- Compliance trends
  
### 🔎 Search & Retrieval
Search previously scanned:
- Products
- Inspections
- Compliance results
- Reports

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────┐
│          Web / Mobile UI             │
│        React + Tailwind CSS          │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│          Backend / REST API          │
│          Node.js + Express           │
└──────────────────┬───────────────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐
│   Python AI      │  │ Legal Metrology      │
│     Service      │  │    Rule Engine       │
│                  │  │                      │
│ OpenCV           │  │ Versioned Rules      │
│ PaddleOCR        │  │ Validation Logic     │
│ AI Extraction    │  │ Compliance Rules     │
└────────┬─────────┘  └──────────┬───────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
          ┌────────────────────────┐
          │   Compliance Result    │
          │ + Evidence + Report    │
          └────────────┬───────────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
       ┌─────────────┐    ┌─────────────┐
       │   MongoDB   │    │ Cloudinary  │
       │   Records   │    │    Images   │
       └─────────────┘    └─────────────┘
```

---

## 🛠️ Technology Stack
Layer	Technology
Frontend	React, Tailwind CSS
Backend	Node.js, Express.js
AI/ML	Python
OCR/CV	PaddleOCR, OpenCV
Database	MongoDB
Authentication	JWT
Storage	Cloudinary
Analytics	Recharts
API	REST API
Version Control	Git, GitHub
