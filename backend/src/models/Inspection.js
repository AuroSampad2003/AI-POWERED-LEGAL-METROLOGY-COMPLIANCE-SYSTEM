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
      },
    ],
    status: {
      type: String,
      enum: ['UPLOADED', 'ANALYSIS_PENDING', 'ANALYZED', 'COMPLIANT', 'NON_COMPLIANT'],
      default: 'ANALYSIS_PENDING',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Inspection', inspectionSchema);