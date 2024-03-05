import { z } from "zod";
import { mkConfig, generateCsv, download } from "export-to-csv";

import {
  colectiveDebtorColumns,
  singularDebtorColumns,
} from "./components/columns";
import { DataTable } from "./components/data-table";
import {
  DebtorResponse,
  colectiveDebtorSchema,
  singularDebtorSchema,
  Option,
} from "./schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

const colectiveCsvConfig = mkConfig({
  useKeysAsHeaders: true,
  filename: "devedores-colectivos",
});
const singluarCsvConfig = mkConfig({
  useKeysAsHeaders: true,
  filename: "devedores-singulares",
});

export default function DebtorsTable() {
  const { t } = useTranslation();

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const url =
    "https://raw.githubusercontent.com/franciscobmacedo/devedores-scraper/main/data/debtors.json";
  const { data, error } = useSWR<DebtorResponse>(url, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  const colectiveDebtorsData = z
    .array(colectiveDebtorSchema)
    .parse(data.colective_debtors)
    .sort((a, b) => a.step.start - b.step.start);
  const colectiveDebtIntervals = [
    ...new Set(colectiveDebtorsData.map((item) => item.step_text)),
  ].map((item) => {
    return {
      label: item,
      value: item,
    } as Option;
  });

  const singularDebtorsData = z
    .array(singularDebtorSchema)
    .parse(data.singular_debtors)
    .sort((a, b) => a.step.start - b.step.start);
  const singularDebtIntervals = [
    ...new Set(singularDebtorsData.map((item) => item.step_text)),
  ].map((item) => {
    return {
      label: item,
      value: item,
    } as Option;
  });

  const exportData = (type: "colective" | "singular") => async () => {
    if (type === "colective") {
      const csv = generateCsv(colectiveCsvConfig)(colectiveDebtorsData);
      download(colectiveCsvConfig)(csv);
    } else if (type === "singular") {
      const csv = generateCsv(singluarCsvConfig)(singularDebtorsData);
      download(singluarCsvConfig)(csv);
    }
    return;
  };

  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-8 p-8">
        <Tabs defaultValue="colective">
          <TabsList>
              <TabsTrigger
                value="colective"
                className="text-zinc-600 dark:text-zinc-200"
              >
                {t("Colective Debtors")}
              </TabsTrigger>
              <TabsTrigger
                value="singular"
                className="text-zinc-600 dark:text-zinc-200"
              >
                {t("Singular Debtors")}
              </TabsTrigger>
          </TabsList>

          <TabsContent value="colective" className="m-0">
            <DataTable
              data={colectiveDebtorsData}
              columns={colectiveDebtorColumns}
              debtIntervals={colectiveDebtIntervals}
              downloadData={exportData("colective")}
            />
          </TabsContent>
          <TabsContent value="singular" className="m-0">
            <DataTable
              data={singularDebtorsData}
              columns={singularDebtorColumns}
              debtIntervals={singularDebtIntervals}
              downloadData={exportData("singular")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
