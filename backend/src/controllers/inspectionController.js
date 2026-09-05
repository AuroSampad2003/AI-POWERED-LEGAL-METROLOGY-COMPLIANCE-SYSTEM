import Inspection from '../models/Inspection.js';

export const createInspection = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const { productName, category, imageViews } = req.body;

    const views = Array.isArray(imageViews)
      ? imageViews
      : imageViews
        ? [imageViews]
        : [];

    const images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      view: views[index] || 'OTHER',
    }));

    const inspection = await Inspection.create({
      user: req.user.id,
      productName,
      category,
      images,
      status: 'ANALYSIS_PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Uploaded successfully. Analysis pending.',
      inspection,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, inspections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    if (inspection.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, inspection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalInspections = await Inspection.countDocuments({ user: userId });
    const pending = await Inspection.countDocuments({ user: userId, status: 'ANALYSIS_PENDING' });
    const compliant = await Inspection.countDocuments({ user: userId, status: 'COMPLIANT' });
    const nonCompliant = await Inspection.countDocuments({ user: userId, status: 'NON_COMPLIANT' });
    const recentInspections = await Inspection.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: { totalInspections, pending, compliant, nonCompliant },
      recentInspections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};