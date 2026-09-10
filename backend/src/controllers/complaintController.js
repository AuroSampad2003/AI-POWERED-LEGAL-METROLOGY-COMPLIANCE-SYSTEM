import Complaint from '../models/Complaint.js';
import Inspection from '../models/Inspection.js';
import cloudinary from '../config/cloudinary.js';
import { generateComplaintReportPdf } from '../services/pdfReportService.js';

const DECLARATION_META = [
  { key: 'manufacturer_details', title: 'Manufacturer / Packer Details', rule: 'Rule 6(1)(a)' },
  { key: 'country_of_origin', title: 'Country of Origin', rule: 'Rule 6(1)(aa)' },
  { key: 'net_quantity', title: 'Net Quantity', rule: 'Rule 6(1)(c)' },
  { key: 'mrp', title: 'Maximum Retail Price (MRP)', rule: 'Rule 6(1)(e)' },
  { key: 'date_of_manufacture_or_pack', title: 'Date of Mfg / Packing', rule: 'Rule 6(1)(d)' },
  { key: 'consumer_care_details', title: 'Consumer Care Details', rule: 'Rule 6(1)(f)' },
  { key: 'unit_sale_price', title: 'Unit Sale Price (USP)', rule: 'Rule 6(1)(g)' },
];

const isDeclarationPresent = (item = {}) => {
  const statusVal = item.missing || (item.present ? 'present' : 'missing');
  return statusVal === 'present';
};

const extractViolations = (analysis = {}) => {
  const declarations = analysis.declarations || {};
  return DECLARATION_META.filter((meta) => !isDeclarationPresent(declarations[meta.key])).map((meta) => {
    const item = declarations[meta.key] || {};
    return {
      key: meta.key,
      title: meta.title,
      rule: meta.rule,
      reason:
        item.why_missing ||
        item.missing_summary ||
        `Mandatory declaration under ${meta.rule} is missing or incomplete.`,
    };
  });
};

export const createComplaint = async (req, res) => {
  try {
    const { inspectionId, description } = req.body;

    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    if (inspection.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (inspection.status !== 'NON_COMPLIANT') {
      return res.status(400).json({
        success: false,
        message: 'Only non-compliant inspections can be reported',
      });
    }

    const existing = await Complaint.findOne({ inspection: inspection._id, user: req.user.id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A complaint has already been submitted for this inspection',
        complaint: existing,
      });
    }

    const violations = extractViolations(inspection.analysis);

    const complaint = await Complaint.create({
      user: req.user.id,
      inspection: inspection._id,
      productName: inspection.productName,
      category: inspection.category,
      images: inspection.images.map((img) => ({
        url: img.url,
        annotatedImage: img.annotatedImage,
        view: img.view,
      })),
      analysisSnapshot: inspection.analysis,
      violations,
      complianceScore: inspection.analysis?.legal_metrology_2011_compliance?.confidence_score,
      description,
      status: 'SUBMITTED',
    });

    res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (complaint.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


export const getComplaintReport = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('inspection');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const ownerId = complaint.user?._id ? complaint.user._id.toString() : complaint.user.toString();
    if (ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!complaint.enforcementCaseId) {
      return res.status(400).json({
        success: false,
        message: 'The report is available once this complaint has been verified.',
      });
    }

    const pdfBuffer = await generateComplaintReportPdf(complaint);

    complaint.reportGeneratedAt = new Date();
    await complaint.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${complaint.complaintId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Generate complaint report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
};