import { z } from "zod"

export const stepSchema = z.object({
  start: z.number(),
  end: z.nullable(z.number()),
})
export const debtorSchema = z.object({
  name: z.string(),
  step: stepSchema,
  step_text: z.string(),
})
export const singularDebtorSchema = debtorSchema.extend({
  nif: z.number(),
})
export const colectiveDebtorSchema = debtorSchema.extend({
  nipc: z.number(),
})

export const DebtorResponseSchema = z.object({
  singular_debtors: z.array(singularDebtorSchema),
  colective_debtors: z.array(colectiveDebtorSchema),
})

export type Step = z.infer<typeof stepSchema>
export type Debtor = z.infer<typeof debtorSchema>
export type ColectiveDebtor = z.infer<typeof colectiveDebtorSchema>
export type SingularDebtor = z.infer<typeof singularDebtorSchema>
export type DebtorResponse = z.infer<typeof DebtorResponseSchema>

export interface Option {
  label: string
  value: string
}
