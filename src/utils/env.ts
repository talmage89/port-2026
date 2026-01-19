import { z } from "zod";

export const envSchema = z.object({
  PORT: z.preprocess((val) => parseInt(String(val), 10), z.number()),
  //   DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;
