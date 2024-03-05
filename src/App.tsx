import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
// import DebtorTable  from "@/debtors";
import DebtorsTable from "@/debtors";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

function App() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    localStorage.setItem('i18nextLng', lng);
    i18n.changeLanguage(lng);
  };
  

  return (
    <>
      <h1>{t("Welcome to React")}</h1>

      <Button
        variant={i18n.language === "pt" ? "secondary" : "ghost"}
        onClick={() => changeLanguage("pt")}
        className="h-8 px-2 lg:px-3"
      >
        PT
      </Button>

      <Button
        variant={i18n.language === "en" ? "secondary" : "ghost"}
        onClick={() => changeLanguage("en")}
        className="h-8 px-2 lg:px-3"
      >
        EN
      </Button>

      <DebtorsTable />
    </>
  );
}

export default App;
