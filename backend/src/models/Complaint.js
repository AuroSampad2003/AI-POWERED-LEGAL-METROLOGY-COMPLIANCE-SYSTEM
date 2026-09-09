import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema(
  {
    key: String,
    title: String,
    rule: String,
    reason: String,
  },
  { _id: false }
);

const imageSnapshotSchema = new mongoose.Schema(
  {
    url: String,
    annotatedImage: String,
    view: String,
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: true },

    productName: { type: String, trim: true },
    category: { type: String, trim: true },
    images: [imageSnapshotSchema],

    analysisSnapshot: { type: mongoose.Schema.Types.Mixed },
    violations: [violationSchema],
    complianceScore: { type: Number },

    description: { type: String, trim: true, maxlength: 2000 },

    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'PENDING_REVIEW',
        'UNDER_REVIEW',
        'MORE_INFO_REQUIRED',
        'VERIFIED',
        'REJECTED',
        'ESCALATED',
        'RESOLVED',
      ],
      default: 'SUBMITTED',
    },

    // NEW: admin remarks, shown on the detail page
    adminRemarks: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true }
);

complaintSchema.pre('validate', function () {
  if (!this.complaintId) {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.complaintId = `CMP-${time}-${rand}`;
  }
});

export default mongoose.model('Complaint', complaintSchema);