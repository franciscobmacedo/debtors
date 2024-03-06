import DebtorsTable from "@/debtors";
import { useTranslation } from "react-i18next";
import { Button } from "./components/ui/button";

function App() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    localStorage.setItem("i18nextLng", lng);
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div className="container  mx-auto flex flex-col justify-start h-screen flex-1">
        <div className="flex flex-col justify-center items-center my-10">
          <h2 className="text-2xl font-bold tracking-tight">{t("Debtors")}</h2>
          <div className="my-2">
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
          </div>
        </div>
        <div className="flex flex-col flex-1 justify-center ">
          <DebtorsTable />
        </div>
      </div>
    </>
  );
}

export default App;
