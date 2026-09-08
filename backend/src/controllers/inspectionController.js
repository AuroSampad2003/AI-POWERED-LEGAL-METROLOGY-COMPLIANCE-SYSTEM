import Inspection from '../models/Inspection.js';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';

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
      publicId: file.filename || `img_${Date.now()}_${index}`,
      view: views[index] || 'OTHER',
    }));

    // Create initial inspection record
    const inspection = await Inspection.create({
      user: req.user.id,
      productName,
      category,
      images,
      status: 'ANALYSIS_PENDING',
    });

    // Call Python OCR & AI Audit Microservice
    const imageUrls = images.map((img) => img.url);
    try {
      console.log(`[OCR Integration] Sending ${imageUrls.length} images to Python OCR server at ${OCR_SERVICE_URL}/ocr/batch...`);
      
      const ocrResponse = await fetch(`${OCR_SERVICE_URL}/ocr/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_urls: imageUrls }),
      });

      if (ocrResponse.ok) {
        const ocrData = await ocrResponse.json();
        console.log('[OCR Integration] OCR batch analysis completed successfully!');

        const combinedAudit = ocrData.combined_audit || {};
        const imagesDetail = ocrData.images_detail || [];

        // Attach annotated Base64 images and extracted text to corresponding image views
        inspection.images.forEach((img, idx) => {
          const detail = imagesDetail[idx] || {};
          if (detail.annotated_image) {
            img.annotatedImage = `data:image/jpeg;base64,${detail.annotated_image}`;
          }
          if (detail.text) {
            img.extractedText = detail.text;
          }
        });

        // Attach AI Analysis JSON
        inspection.analysis = combinedAudit;

        // Set status based on Legal Metrology 2011 compliance result
        const isCompliant = combinedAudit?.legal_metrology_2011_compliance?.is_fully_compliant;
        if (isCompliant === true) {
          inspection.status = 'COMPLIANT';
        } else if (isCompliant === false) {
          inspection.status = 'NON_COMPLIANT';
        } else {
          inspection.status = 'ANALYZED';
        }

        await inspection.save();
      } else {
        console.error(`[OCR Integration] OCR service error (HTTP ${ocrResponse.status})`);
        inspection.status = 'FAILED';
        await inspection.save();
      }
    } catch (ocrErr) {
      console.error('[OCR Integration] Failed to connect to Python OCR server:', ocrErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Inspection processed and analyzed successfully.',
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