import { z } from "zod";

const envSchema = z.object({
  PORT: z.preprocess((val) => parseInt(String(val), 10), z.number()),
  DB_URL: z.string(),
});

export const env = (): Env => envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
