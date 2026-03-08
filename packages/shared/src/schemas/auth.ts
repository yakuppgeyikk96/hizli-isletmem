import { z } from "zod/v4";

export const registerInputSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
  businessName: z.string().min(2).max(200),
  businessType: z.enum(["restaurant", "cafe", "bar", "patisserie", "other"]),
});

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
