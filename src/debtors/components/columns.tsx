"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ColectiveDebtor, SingularDebtor } from "../schema";
import { DataTableColumnHeader } from "./data-table-column-header";

import { RowData, SortingFn } from "@tanstack/react-table";
import i18next from 'i18next';

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    title: string;
  }
  interface SortingFns {
    sortByStep: SortingFn<unknown>;
  }
}

export const colectiveDebtorColumns: ColumnDef<ColectiveDebtor>[] = [
  {
    accessorKey: "nipc",
    meta: {
      title: i18next.t("NIPC"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title || i18next.t("NIPC");
      return <DataTableColumnHeader column={column} title={title} />;
    },
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("nipc")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    meta: {
      title: i18next.t("Name"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title || i18next.t("Name");
      return <DataTableColumnHeader column={column} title={title} />
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
    accessorKey: "step_text",
    meta: {
      title: i18next.t("Debt Interval"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title || i18next.t("Debt Interval");
      return <DataTableColumnHeader column={column} title={title} />
    },
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("step_text")}
          </span>
        </div>
      );
    },
    sortingFn: "sortByStep",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "step",
    enableSorting: false,
    enableHiding: false,
  },
];

export const singularDebtorColumns: ColumnDef<SingularDebtor>[] = [
  {
    accessorKey: "nif",
    meta: {
      title: i18next.t("NIF"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title || i18next.t("NIF");
      return <DataTableColumnHeader column={column} title={title} />;
    },
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("nif")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    meta: {
      title: i18next.t("Name"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title || i18next.t("Name");
      return <DataTableColumnHeader column={column} title={title} />
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
    accessorKey: "step_text",
    meta: {
      title: i18next.t("Debt Interval"),
    },
    header: ({ column }) => {
      const title = column.columnDef.meta?.title || i18next.t("Debt Interval");
      return <DataTableColumnHeader column={column} title={title} />
    },
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("step_text")}
          </span>
        </div>
      );
    },
    sortingFn: "sortByStep",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "step",
    enableSorting: false,
    enableHiding: false,
  },
];
