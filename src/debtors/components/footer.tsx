import { useTranslation, Trans } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center text-xs text-neutral-600 mt-20 sm:mt-5 mb-5">
        <p>{t("Debtors list to the Portuguese Tax Authority")}</p>
        <p className="prose prose-neutral-600 prose-sm">
          <Trans t={t}>
            All information presented on this page is sourced from publicly
            disclosed data updated daily by the
            <a
              href="https://static.portaldasfinancas.gov.pt/app/devedores_static/de-devedores.html"
              target="_blank"
              className="ml-1 font-semibold hover:underline underline-offset-2"
            >
              Tax Authority (AT)
            </a>{" "}
            and undergoes no alteration or manipulation on our part. Therefore,
            the presented data is the sole responsibility of the AT. Any
            inconsistency or inaccuracy in the data is a problem beyond our
            disclosure, and we are limited to transmitting the information as
            provided by the AT.
          </Trans>
        </p>
        <div>
          <p>
            {t("scraper and table made by")}{" "}
            <a
              className="underline"
              target="_blank"
              href="https://fmacedo.com/"
            >
              fmacedo
            </a>
          </p>
          <p>
            {t("charts made by")}{" "}
            <a
              className="underline"
              target="_blank"
              href="https://www.instagram.com/oinvestigador.pt/"
            >
              O INVESTIGADOR
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
