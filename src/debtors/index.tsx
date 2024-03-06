import { z } from "zod";
import {
  colectiveDebtorColumns,
  singularDebtorColumns,
} from "./components/columns";
import { DataTable } from "./components/data-table";
import {
  ColectiveDebtor,
  DebtorResponse,
  colectiveDebtorSchema,
  singularDebtorSchema,
  Option,
  SingularDebtor,
} from "./schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import AutoProgress from "./auto-progress";

export default function DebtorsTable() {
  const { t } = useTranslation();
  const { data, error } = getData();
  if (error) return <div>Failed to load</div>;
  if (!data) return <AutoProgress interval={2} />;

  const { colectiveDebtorsData, colectiveDebtIntervals } =
    parseColectiveDebtors(data.colective_debtors);
  const { singularDebtorsData, singularDebtIntervals } = parseSingularDebtors(
    data.singular_debtors
  );

  return (
    <>
    <p className="font-light text-sm ">
            {t("Debtors list to the Tax Authority. Data gathered from the")}
              <a
                href="https://static.portaldasfinancas.gov.pt/app/devedores_static/de-devedores.html"
                target="_blank"
                className="ml-1 font-semibold hover:underline underline-offset-2"
              >
                 {t("tax authority portal")}
              </a>.
          </p>
      <div className="flex h-full flex-1 flex-col space-y-8 md:px-8 py-8">
        <Tabs defaultValue="colective" className="text-center">
          <TabsList className="mb-12">
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
              exportName={t("Colective Debtors")}
            />
          </TabsContent>
          <TabsContent value="singular" className="m-0">
            <DataTable
              data={singularDebtorsData}
              columns={singularDebtorColumns}
              debtIntervals={singularDebtIntervals}
              exportName={t("Singular Debtors")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

const getData = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const url =
    "https://raw.githubusercontent.com/franciscobmacedo/devedores-scraper/main/data/debtors.json";
  const { data, error } = useSWR<DebtorResponse>(url, fetcher);
  return { data, error };
};

const parseColectiveDebtors = (data: ColectiveDebtor[]) => {
  const colectiveDebtorsData = z
    .array(colectiveDebtorSchema)
    .parse(data)
    .sort((a, b) => a.step.start - b.step.start);
  const colectiveDebtIntervals = [
    ...new Set(colectiveDebtorsData.map((item) => item.step_text)),
  ].map((item) => {
    return {
      label: item,
      value: item,
    } as Option;
  });
  return { colectiveDebtorsData, colectiveDebtIntervals };
};

const parseSingularDebtors = (data: SingularDebtor[]) => {
  const singularDebtorsData = z
    .array(singularDebtorSchema)
    .parse(data)
    .sort((a, b) => a.step.start - b.step.start);
  const singularDebtIntervals = [
    ...new Set(singularDebtorsData.map((item) => item.step_text)),
  ].map((item) => {
    return {
      label: item,
      value: item,
    } as Option;
  });
  return { singularDebtorsData, singularDebtIntervals };
};
