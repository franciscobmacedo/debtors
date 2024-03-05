import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})
export type Task = z.infer<typeof taskSchema>

export const stepSchema = z.object({
  start: z.number(),
  end: z.nullable(z.number()),
})

export const singularDebtorSchema = z.object({
  nif: z.number(),
  name: z.string(),
  step: stepSchema,
  step_text: z.string(),
})
export const colectiveDebtorSchema = z.object({
  nipc: z.number(),
  name: z.string(),
  step: stepSchema,
  step_text: z.string(),
})

export const DebtorResponseSchema = z.object({
  singular_debtors: z.array(singularDebtorSchema),
  colective_debtors: z.array(colectiveDebtorSchema),
})
export type Step = z.infer<typeof stepSchema>
export type ColectiveDebtor = z.infer<typeof colectiveDebtorSchema>
export type SingularDebtor = z.infer<typeof singularDebtorSchema>
export type DebtorResponse = z.infer<typeof DebtorResponseSchema>

export interface Option {
  label: string
  value: string
}

// export interface Step {
//   start: number;
//   end: number | null;
// }

// export interface Debtor {
//   name: string;
//   step: Step;

// }
// export interface ColectiveDebtor extends Debtor{
//   nipc: number;
// }
// export interface SingularDebtor extends Debtor{
//   nif: number;
// }

// export interface DebtorResponse {
//   singular_debtors: SingularDebtor[];
//   colective_debtors: ColectiveDebtor[];

// }