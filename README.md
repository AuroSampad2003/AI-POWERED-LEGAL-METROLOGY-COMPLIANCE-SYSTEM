INNOVATRIX — SIH26034
AI-Powered Legal Metrology Compliance System

An AI-powered web/mobile-based solution that automatically analyzes packaged-product labels, extracts mandatory declarations, validates them against applicable Legal Metrology requirements, detects violations, and generates explainable compliance reports.

🚀 Overview

Manual verification of packaged commodity labels can be time-consuming and difficult to perform consistently across different products, label designs, languages, and package conditions.

INNOVATRIX addresses this challenge by combining:

👁️ Computer Vision
🔎 OCR
🤖 AI-based Information Extraction
⚖️ Dynamic Legal Metrology Rule Engine
📊 Compliance Dashboard
📄 Digital Compliance Reports
🔍 Search & Retrieval
👤 Human-in-the-Loop Review
Core Workflow
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
Digital Report + Dashboard
🎯 Problem Statement

SIH26034

Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.

Organization: Ministry of Consumer Affairs, Food & Public Distribution
Department: Department of Consumer Affairs
Category: Software
Team: INNOVATRIX

💡 Proposed Solution

Our solution is an AI-powered web/mobile application that combines Computer Vision, OCR, AI-based information extraction, and a dynamic Legal Metrology Rule Engine to automatically analyze packaged-product labels.

It extracts and validates mandatory declarations, performs rule-based compliance checks, detects violations, and generates explainable, evidence-backed digital compliance reports, with human review for uncertain cases.

The system also provides a dashboard and search facility for managing inspections, products, violations, and previously generated reports.

✨ Key Features
📷 Product Scanning
Capture product images using a camera
Upload existing product images
Support multiple package views
🔍 OCR & AI Extraction
Text detection and recognition
Label information extraction
Bounding-box based evidence
Confidence scoring
Structured product information
⚖️ Compliance Checking

Checks configured mandatory declarations such as:

Manufacturer / Packer / Importer
Common / Generic Product Name
Net Quantity
MRP
Manufacturing / Packing Date
Best Before / Use By, where applicable
Consumer Care Details
Country of Origin, where applicable
Other applicable declarations
🚨 Violation Detection

The system identifies:

✅ Compliant
❌ Non-Compliant
⚠️ Review Required

Each finding can include:

Detected field
Missing/incorrect information
Applicable rule
Evidence region
Confidence score
Review status
📄 Digital Reports

Generate compliance reports containing:

Product information
Extracted declarations
Compliance status
Violations
Evidence
Rule references
Review information
📊 Dashboard

Monitor:

Total inspections
Compliant products
Non-compliant products
Review-required cases
Violation categories
Product history
Compliance trends
🔎 Search & Retrieval

Search previously scanned:

Products
Inspections
Compliance results
Reports
🏗️ System Architecture
┌───────────────────────────────┐
│       Web / Mobile UI         │
│     React + Tailwind CSS      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Backend / REST API      │
│       Node.js + Express       │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐  ┌──────────────────┐
│ Python AI     │  │ Legal Metrology  │
│ Service       │  │ Rule Engine      │
│               │  │                  │
│ OpenCV        │  │ Versioned Rules  │
│ PaddleOCR     │  │ Validation       │
│ AI Extraction │  │ Compliance Logic │
└───────┬───────┘  └────────┬─────────┘
        │                    │
        └──────────┬─────────┘
                   ▼
        ┌─────────────────────┐
        │   Compliance Result │
        │ + Evidence + Report │
        └──────────┬──────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
   ┌─────────────┐    ┌─────────────┐
   │  MongoDB    │    │ Cloudinary  │
   │   Records   │    │   Images    │
   └─────────────┘    └─────────────┘
🛠️ Technology Stack
Frontend        → React, Tailwind CSS
Backend         → Node.js, Express.js
AI/ML           → Python
OCR/CV          → PaddleOCR, OpenCV
Database        → MongoDB
Authentication  → JWT
Storage         → Cloudinary
Analytics       → Recharts
API             → REST API
Version Control → Git, GitHub
📂 Project Structure
INNOVATRIX-SIH26034/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── package.json
│
├── ai-service/
│   ├── app/
│   ├── models/
│   ├── preprocessing/
│   ├── ocr/
│   ├── extraction/
│   └── requirements.txt
│
├── rule-engine/
│   ├── rules/
│   ├── validators/
│   └── rule-config.json
│
├── docs/
│   ├── architecture/
│   ├── reports/
│   └── screenshots/
│
├── .gitignore
├── README.md
└── LICENSE
🔄 Compliance Processing Pipeline
1. Scan / Upload

User captures or uploads a product/package image.

2. Image Preprocessing

OpenCV performs operations such as:

Noise reduction
Contrast enhancement
Rotation correction
Perspective correction
Image quality assessment
3. OCR

PaddleOCR extracts:

Text
+
Bounding Boxes
+
Confidence Scores
4. Information Extraction

The extracted text is converted into structured fields.

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

The structured information is evaluated against the applicable rule set.

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

The system generates an evidence-backed digital report.

⭐ Innovation
1. Explainable AI

Instead of only displaying a final result, the system can show:

What was detected → Which rule was checked → Why it was flagged → Where the evidence appears

2. Dynamic Legal Rule Engine

Legal requirements are maintained separately from the application logic, allowing rules to be:

Updated
Versioned
Categorized
Applied according to effective dates
3. Multimodal Analysis

Combines:

OCR Text
   +
Image/Layout Information
   +
AI Extraction
   +
Rule Validation
4. Human-in-the-Loop

Low-confidence or ambiguous cases are sent for manual verification instead of forcing an unreliable automated decision.

🔐 Security

The system is designed with:

JWT authentication
Role-based access control
API validation
HTTPS in deployment
Secure image storage
Audit logs
Controlled access to reports
Data retention policies
👥 User Roles
Role	Responsibilities
Inspector / Regulator	Scan products, review violations and generate reports
Manufacturer / Compliance User	Perform self-compliance checks
Administrator	Manage users, rules and configurations
Analyst / Supervisor	Monitor compliance trends and analytics
📊 Expected Benefits
Consumers
Better transparency
Easier access to package information
Improved consumer protection
Inspectors
Faster inspection workflow
Standardized digital reports
Evidence-backed findings
Manufacturers
Early detection of labeling issues
Self-compliance support
Reduced avoidable violations
Government
Structured compliance data
Better monitoring
Data-driven enforcement insights
🚀 Future Scope
🌐 Multilingual Indian-language support
📱 Dedicated mobile inspection application
📦 Barcode / QR-based product identification
🛒 E-commerce product-listing compliance
☁️ Government/enterprise API integrations
📈 Advanced compliance analytics
🔄 Centralized rule-update mechanism
🤖 Improved AI models for difficult package layouts
📸 Advanced curved-surface and low-quality image analysis
⚠️ Responsible Use

The system is intended as an AI-assisted compliance and inspection tool.

AI/OCR results may be affected by:

Poor image quality
Glare
Small text
Unusual fonts
Curved packaging
Multilingual labels

Therefore, uncertain cases should be routed for human review.

The system also cannot establish physical quantity inside a package solely from an image; authorized measurement may still be required.

📚 References
Department of Consumer Affairs — Legal Metrology
https://consumeraffairs.gov.in/
Bureau of Indian Standards
https://www.bis.gov.in/
BIS Standards Portal
https://standards.bis.gov.in/
Food Safety and Standards Authority of India
https://www.fssai.gov.in/
👨‍💻 Team
INNOVATRIX

Smart India Hackathon 2026

Problem Statement: SIH26034

AI-powered compliance verification for packaged commodities.

📌 Project Status

Prototype / MVP under development

The initial MVP focuses on:

✅ Product Image Upload
✅ Image Preprocessing
✅ OCR
✅ Declaration Extraction
✅ Rule-Based Validation
✅ Compliance Result
✅ Evidence / Explanation
✅ Digital Report
