import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  pt: {
    translation: {
      "Colective Debtors": "Devedores Colectivos",
      "Singular Debtors": "Devedores Singulares",
      "Export": "Exportar",
      "Debtors": "Devedores",
      "Debtors to the Portuguese Tax Authority":
        "Devedores à Autoridade Tributária",
      "NIPC": "NIPC",
      "Name": "Nome",
      "Debt Interval": "Intervalo de dívida",
      "Debt Intervals": "Intervalos de dívida",
      "Search all columns": "Pesquisar todas as colunas",
      "View": "Ver",
      "Toggle columns": "Seleccionar colunas",
      "Rows per page": "Linhas por página",
      "Page": "Página",
      "Go to previous page": "Ir para a página anterior",
      "Go to next page": "Ir para a próxima página",
      "Go to last page": "Ir para a última página",
      "Go to first page": "Ir para a primeira página",
      "selected": "seleccionados",
      "Debtors list to the Portuguese Tax Authority":
        "Lista de devedores à Autoridade Tributária",
      "tax authority portal": "portal das finanças",
      "of": "de",
      "No results": "Sem resultados",
      "last updated at": "atualizado em",
      "Showing": "A mostrar",
      "results": "resultados",
      "more than": "mais de",
      "All information presented on this page is sourced from publicly disclosed data updated daily by the<1>Tax Authority (AT)</1> and undergoes no alteration or manipulation on our part. Therefore, the presented data is the sole responsibility of the AT. Any inconsistency or inaccuracy in the data is a problem beyond our disclosure, and we are limited to transmitting the information as provided by the AT.":
        "Todas as informações apresentadas nesta página são provenientes de dados públicos divulgados e atualizados diariamente pela <1>Autoridade Tributária (AT)</1> e não sofrem qualquer alteração ou manipulação da nossa parte. Como tal, os dados apresentados são de responsabilidade exclusiva da AT. Qualquer inconsistência ou imprecisão nos dados é um problema alheio à nossa divulgação, e estamos limitados a transmitir as informações conforme disponibilizadas pela AT.",
      "scraper and table made by": "scraper e tabela feitos por",
    },
  },
};

let storedLang = localStorage.getItem("i18nextLng");

if (storedLang === null) {
  const url = window.location.href;
  storedLang = url.includes("devedores") ? "pt" : "en";
  localStorage.setItem("i18nextLng", storedLang);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: storedLang,
    fallbackLng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
