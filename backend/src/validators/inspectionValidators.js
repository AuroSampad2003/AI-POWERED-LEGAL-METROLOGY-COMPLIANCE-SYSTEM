import { z } from 'zod';

export const createInspectionSchema = z.object({
  productName: z.string().trim().optional(),
  category: z.string().trim().optional(),
  imageViews: z
    .union([z.string(), z.array(z.string())])
    .optional(),
});