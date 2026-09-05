
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

## 🏗️ Technology Architecture

```text
                         👤 USER
                           │
                           ▼
              ┌─────────────────────────┐
              │      FRONTEND           │
              │  React + Tailwind CSS   │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │       BACKEND           │
              │   Node.js + Express     │
              │        REST API         │
              └────────────┬────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    ┌──────────────────┐       ┌──────────────────┐
    │   AI / OCR       │       │  RULE ENGINE     │
    │                  │       │                  │
    │ Python           │       │ Legal Metrology  │
    │ OpenCV           │       │ Validation       │
    │ PaddleOCR        │       │ Compliance Logic │
    └────────┬─────────┘       └────────┬─────────┘
             │                          │
             └────────────┬─────────────┘
                          ▼
                ┌────────────────────┐
                │ COMPLIANCE RESULT  │
                │                    │
                │ ✅ Compliant       │
                │ ❌ Non-Compliant   │
                │ ⚠️ Review Required │
                └─────────┬──────────┘
                          │
                ┌─────────┴──────────┐
                ▼                    ▼
        ┌──────────────┐      ┌──────────────┐
        │   MongoDB    │      │  Cloudinary  │
        │   Database   │      │    Images    │
        └──────────────┘      └──────────────┘
```

---

## 🛠️ Tech Stack

**Frontend**  
<p>
  <img src="https://skillicons.dev/icons?i=react,tailwind" />
</p>

**Backend**  
<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express" />
</p>

**AI / OCR / Computer Vision**  
<p>
  <img src="https://skillicons.dev/icons?i=python,opencv" />
  <img src="https://img.shields.io/badge/PaddleOCR-OCR-00A98F?style=flat-square" />
</p>

**Database & Storage**  
<p>
  <img src="https://skillicons.dev/icons?i=mongodb,cloudinary" />
</p>

**Authentication & Analytics**  
<p>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-FF6384?style=flat-square" />
</p>

**Compliance**  
<p>
  <img src="https://img.shields.io/badge/Legal_Metrology-Rule_Engine-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/Explainable_AI-Evidence_Based-00A98F?style=flat-square" />
</p>

**Tools**  
<p>
  <img src="https://skillicons.dev/icons?i=git,github,vscode" />
</p>

---

## 📂 Project Structure





---

## 🔄 Compliance Processing Pipeline

### 1. Scan / Upload
The user captures or uploads an image of the packaged product.

### 2. Image Preprocessing
OpenCV performs operations such as:
- Noise reduction
- Contrast enhancement
- Rotation correction
- Perspective correction
- Image quality assessment
  
### 3. OCR
PaddleOCR extracts:
```text
Text
+
Bounding Boxes
+
Confidence Scores
```

4. Information Extraction

The extracted text is converted into structured product information.

Example:

{
  "productName": "Example Product",
  "manufacturer": "Example Foods Pvt. Ltd.",
  "netQuantity": "100 g",
  "mrp": "₹50",
  "manufacturingDate": "08/2026",
  "bestBefore": "6 months",
  "consumerCare": "1800-XXXXXXX"
}
5. Rule Validation

The structured information is evaluated against the applicable Legal Metrology rule set.

6. Compliance Result
┌──────────────────────────────┐
│      COMPLIANCE RESULT       │
├──────────────────────────────┤
│ Manufacturer          ✓      │
│ Net Quantity          ✓      │
│ MRP                   ✓      │
│ Date Information      ✓      │
│ Consumer Care         ✗      │
├──────────────────────────────┤
│       NON-COMPLIANT          │
└──────────────────────────────┘
7. Report Generation

The system generates an evidence-backed digital compliance report.
