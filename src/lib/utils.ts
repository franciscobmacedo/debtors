import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Step } from "@/debtors/schema";
import i18next from "i18next";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const stepAsCurrency = (step: Step) => {
  const formattedStart = step.start.toLocaleString("pt-PT");
  const formattedEnd = step.end ? step.end.toLocaleString("pt-PT") : null;
  if (formattedEnd) {
    return `${formattedStart} - ${formattedEnd} €`;
  } else {
    return `${i18next.t("more than")} ${formattedStart} €`;
  }
};
