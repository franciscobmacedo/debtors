import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  pt: {
    translation: {
      "Welcome to React": "Bem vindo ao reactivo",
      "Colective Debtors": "Devedores Colectivos",
      "Singular Debtors": "Devedores Singulares",
        "Export": "Exportar",
        "Debtors": "Devedores",
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

      },
  },
};
const storedLang = localStorage.getItem('i18nextLng');

i18n.use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: storedLang || "en",
    fallbackLng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },

  });

export default i18n;
