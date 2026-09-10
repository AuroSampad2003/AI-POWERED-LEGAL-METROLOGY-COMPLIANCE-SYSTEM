import { z } from 'zod';

export const createComplaintSchema = z.object({
  inspectionId: z.string().min(1, 'inspectionId is required'),
  description: z.string().trim().max(2000).optional(),
});

// NEW: for admin updating status / remarks
export const updateComplaintStatusSchema = z
  .object({
    status: z
      .enum([
        'SUBMITTED',
        'PENDING_REVIEW',
        'UNDER_REVIEW',
        'MORE_INFO_REQUIRED',
        'VERIFIED',
        'REJECTED',
        'ESCALATED',
        'RESOLVED',
      ])
      .optional(),
    adminRemarks: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.status !== undefined || data.adminRemarks !== undefined, {
    message: 'Provide at least one of status or adminRemarks',
  });