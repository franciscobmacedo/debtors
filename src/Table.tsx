import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSWR, { Fetcher } from "swr";

export interface Step {
  start: number;
  end: number | null;
}

export interface Debtor {
  name: string;
  step: Step;

}
export interface ColectiveDebtor extends Debtor{
  nipc: number;
}
export interface SingularDebtor extends Debtor{
  nif: number;
}

export interface DebtorResponse {
  singular_debtors: SingularDebtor[];
  colective_debtors: ColectiveDebtor[];

}
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DebtorTable() {
  const url = "https://raw.githubusercontent.com/franciscobmacedo/devedores/main/data/debtors.json?token=GHSAT0AAAAAACK25P2AVB6S5MVOS36CXAVMZOKJKFQ"

  const { data, error } = useSWR<DebtorResponse>(
    url,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">NIPC</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead className="text-right">Intervalo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.colective_debtors.map((debtor) => (
          <TableRow key={debtor.name}>
            <TableCell className="font-medium">{debtor.nipc}</TableCell>
            <TableCell>{debtor.name}</TableCell>
            <TableCell>{debtor.step.start}</TableCell>
            <TableCell className="text-right">{debtor.step.end ? debtor.step.end : 'aa'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

