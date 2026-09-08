import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: { type: String, trim: true },
    category: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        view: {
          type: String,
          enum: ['FRONT', 'BACK', 'SIDE', 'OTHER'],
          default: 'OTHER',
        },
        annotatedImage: { type: String }, // Base64 annotated image with green bounding boxes & font tags
        extractedText: { type: String },
      },
    ],
    analysis: {
      type: mongoose.Schema.Types.Mixed, // Complete Legal Metrology 2011 AI Audit JSON
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'ANALYSIS_PENDING', 'ANALYZED', 'COMPLIANT', 'NON_COMPLIANT', 'FAILED'],
      default: 'ANALYSIS_PENDING',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Inspection', inspectionSchema);