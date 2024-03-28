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
import { stepAsCurrency } from "@/lib/utils";
import Footer from "./components/footer";

export default function DebtorsTable({ withCharts }: { withCharts: boolean }) {
  const { t } = useTranslation();
  const { data, error } = getData();
  if (error) return <div>Failed to load</div>;
  if (!data)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AutoProgress interval={2} />
      </div>
    );

  const { colectiveDebtorsData, colectiveDebtIntervals } =
    parseColectiveDebtors(data.colective_debtors);
  const { singularDebtorsData, singularDebtIntervals } = parseSingularDebtors(
    data.singular_debtors
  );

  return (
    <>
      <p className="text-xs text-neutral-600">
        {t("last updated at")} {data.last_updated}
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
            {withCharts && (
              <iframe
                height={800}
                className="w-full"
                title="Dívidas à AT - Empresas"
                src="https://app.powerbi.com/view?r=eyJrIjoiMzliZjU4ZTItMmJkYy00MTUzLTg2OGMtOWQzYjRjNDJlMmEzIiwidCI6IjkyNzQyZWFlLWExMTktNDNmYi1hOTU2LWQ3ZGVmNzQ0ODgxYSIsImMiOjh9"
                allowFullScreen={true}
              ></iframe>
            )}
          </TabsContent>
          <TabsContent value="singular" className="m-0">
            <DataTable
              data={singularDebtorsData}
              columns={singularDebtorColumns}
              debtIntervals={singularDebtIntervals}
              exportName={t("Singular Debtors")}
            />
            {withCharts && (
              <iframe
                title="Dívidas à AT - Pessoas"
                height={800}
                className="w-full"
                src="https://app.powerbi.com/view?r=eyJrIjoiYjQ5NWU1ZGUtNTNjMS00ZGI4LWExNzItMTcyOGZkOGViODI4IiwidCI6IjkyNzQyZWFlLWExMTktNDNmYi1hOTU2LWQ3ZGVmNzQ0ODgxYSIsImMiOjh9"
                allowFullScreen={true}
              ></iframe>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}

const getData = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const url =
    "https://raw.githubusercontent.com/franciscobmacedo/debtors-scraper/main/data/debtors.json";
  const { data, error } = useSWR<DebtorResponse>(url, fetcher);
  return { data, error };
};

const parseColectiveDebtors = (data: ColectiveDebtor[]) => {
  const colectiveDebtorsData = z
    .array(colectiveDebtorSchema)
    .parse(data)
    .sort((a, b) => a.step.start - b.step.start);
  const colectiveDebtIntervals = [
    ...new Set(colectiveDebtorsData.map((item) => stepAsCurrency(item.step))),
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
    ...new Set(singularDebtorsData.map((item) => stepAsCurrency(item.step))),
  ].map((item) => {
    return {
      label: item,
      value: item,
    } as Option;
  });
  return { singularDebtorsData, singularDebtIntervals };
};
