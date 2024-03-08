"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ColectiveDebtor, SingularDebtor, Step } from "../schema";
import { DataTableColumnHeader } from "./data-table-column-header";

import { RowData } from "@tanstack/react-table";
import i18next from "i18next";
import {stepAsCurrency} from "@/lib/utils";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    title: () => string;
  }
}

export const colectiveDebtorColumns: ColumnDef<ColectiveDebtor>[] = [
  {
    accessorKey: "nipc",
    meta: {
      title: () => i18next.t("NIPC"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title() || i18next.t("NIPC");
      return <DataTableColumnHeader column={column} title={title} />;
    },
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("nipc")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    meta: {
      title: () => i18next.t("Name"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title() || i18next.t("Name");
      return <DataTableColumnHeader column={column} title={title} />;
    },

    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "step",
    meta: {
      title: () => i18next.t("Debt Interval"),
    },
    header: ({ column }) => {
      const title =
        column.columnDef.meta?.title() || i18next.t("Debt Interval");
      return <DataTableColumnHeader column={column} title={title} />;
    },
    cell: ({ row }) => {
      const step = row.getValue("step") as Step;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {stepAsCurrency(step)}
          </span>
        </div>
      );
    },
    sortingFn: (rowA: any, rowB: any, columnId: any): number =>
      rowA.getValue(columnId).start < rowB.getValue(columnId).start ? 1 : -1,

    filterFn: (row, id, value) => {
      const step = row.getValue(id) as Step;
      return value.includes(stepAsCurrency(step));
    },
  },
];

export const singularDebtorColumns: ColumnDef<SingularDebtor>[] = [
  {
    accessorKey: "nif",
    meta: {
      title: () => i18next.t("NIF"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title() || i18next.t("NIF");
      return <DataTableColumnHeader column={column} title={title} />;
    },
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("nif")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    meta: {
      title: () => i18next.t("Name"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title() || i18next.t("Name");
      return <DataTableColumnHeader column={column} title={title} />;
    },

    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "step",
    meta: {
      title: () => i18next.t("Debt Interval"),
    },
    header: ({ column }) => {
      const title =
        column.columnDef.meta?.title() || i18next.t("Debt Interval");
      return <DataTableColumnHeader column={column} title={title} />;
    },
    cell: ({ row }) => {
      const step = row.getValue("step") as Step;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {stepAsCurrency(step)}
          </span>
        </div>
      );
    },
    sortingFn: (rowA: any, rowB: any, columnId: any): number =>
      rowA.getValue(columnId).start < rowB.getValue(columnId).start ? 1 : -1,

    filterFn: (row, id, value) => {
      const step = row.getValue(id) as Step;
      return value.includes(stepAsCurrency(step));
    },
  },
];
