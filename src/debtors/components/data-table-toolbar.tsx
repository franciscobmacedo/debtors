import * as React from "react";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Option } from "../schema";
import { useTranslation } from "react-i18next";
import { Download } from "./download";

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 250,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  exportName: string;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  debtIntervals: Option[];
}

export function DataTableToolbar<TData>({
  table,
  exportName,
  globalFilter,
  setGlobalFilter,
  debtIntervals,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="h-8 w-[150px] lg:w-[250px]"
          placeholder={t("Search all columns") + "..."}
        />

        {table.getColumn("step_text") && (
          <DataTableFacetedFilter
            column={table.getColumn("step_text")}
            title={t("Debt Intervals")}
            options={debtIntervals}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-1 items-center space-x-2">
        <DataTableViewOptions table={table} />
        <Download exportName={exportName} table={table} /> 
      </div>
    </div>
  );
}
