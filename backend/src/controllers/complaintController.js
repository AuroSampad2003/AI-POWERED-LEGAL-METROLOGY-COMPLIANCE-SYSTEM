import Complaint from '../models/Complaint.js';
import Inspection from '../models/Inspection.js';

const DECLARATION_META = [
  { key: 'manufacturer_details', title: 'Manufacturer / Packer Details', rule: 'Rule 6(1)(a)' },
  { key: 'country_of_origin', title: 'Country of Origin', rule: 'Rule 6(1)(aa)' },
  { key: 'net_quantity', title: 'Net Quantity', rule: 'Rule 6(1)(c)' },
  { key: 'mrp', title: 'Maximum Retail Price (MRP)', rule: 'Rule 6(1)(e)' },
  { key: 'date_of_manufacture_or_pack', title: 'Date of Mfg / Packing', rule: 'Rule 6(1)(d)' },
  { key: 'consumer_care_details', title: 'Consumer Care Details', rule: 'Rule 6(1)(f)' },
  { key: 'unit_sale_price', title: 'Unit Sale Price (USP)', rule: 'Rule 6(1)(g)' },
];

const extractViolations = (analysis = {}) => {
  const declarations = analysis.declarations || {};
  return DECLARATION_META.filter((meta) => declarations[meta.key]?.missing === 'missing').map((meta) => {
    const item = declarations[meta.key] || {};
    return {
      key: meta.key,
      title: meta.title,
      rule: meta.rule,
      reason:
        item.why_missing ||
        item.likely_reason ||
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

// NEW: admin-only — update status and/or remarks
export const updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status, adminRemarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status !== undefined) complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

    await complaint.save();

    res.status(200).json({ success: true, message: 'Complaint updated', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// NEW: admin — list all complaints so they can review and decide
export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status } = req.query;
    const filter = status ? { status } : {};

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};