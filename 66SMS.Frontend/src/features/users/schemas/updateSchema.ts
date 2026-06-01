import { z } from "zod";

export const updateSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  status: z.number().optional(),
});

export type UpdateFormData = z.infer<typeof updateSchema>;
