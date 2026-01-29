import { z } from "zod";

const envSchema = z.object({
  PORT: z.preprocess((val) => parseInt(String(val), 10), z.number()),
  DB_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const env = (): Env => {
  return envSchema.parse(process.env);
};
