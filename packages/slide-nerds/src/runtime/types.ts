import { z } from 'zod'

const TailwindExtendSchema = z.object({
  colors: z.record(z.string()).optional(),
  fontFamily: z.record(z.array(z.string())).optional(),
  spacing: z.record(z.string()).optional(),
})

export const BrandConfigSchema = z.object({
  colors: z.object({
    primary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
  spacing: z.object({
    slide: z.string(),
    section: z.string(),
    element: z.string(),
  }),
  tailwind: z
    .object({
      extend: TailwindExtendSchema.optional(),
    })
    .optional(),
})

export type BrandConfig = z.infer<typeof BrandConfigSchema>
