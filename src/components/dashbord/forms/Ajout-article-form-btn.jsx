import { Button } from "@/components/ui/button";

const AjoutArticleFormBtn = ({ step, prevStep, isLoading, isEdit, handleNext }) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
      {step > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="hover:cursor-pointer w-full sm:w-auto"
        >
          Précédent
        </Button>
      )}
      <Button
        type={step === 3 ? "submit" : "button"}
        onClick={step < 3 ? handleNext : undefined}
        disabled={isLoading}
        className="bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer w-full sm:w-auto ml-auto"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>{" "}
            <span className="ml-2">
              {isEdit ? "Modification..." : "Enregistrement..."}
            </span>
          </>
        ) : step === 3 ? (
          isEdit ? (
            "Modifier"
          ) : (
            "Enregistrer"
          )
        ) : (
          "Continuer"
        )}
      </Button>
    </div>
  );
};

export default AjoutArticleFormBtn;