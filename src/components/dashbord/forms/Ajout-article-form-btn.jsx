import { Button } from "@/components/ui/button";

const AjoutArticleFormBtn = ({ step, prevStep, isLoading, isEdit }) => {
    return (
        <div className="flex justify-between mt-6">
            {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="hover:cursor-pointer">
                    Précédent
                </Button>
            )}
            <Button type="submit" disabled={isLoading} className="bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer">
            {isLoading 
            ? (
                <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span> { isEdit ? "Modification..." : "Enregistrement..." }
                </>
            ) 
            : (
                step === 3 
                ? isEdit ? "Modifier" : "Enregistrer" 
                : "Continuer"
            )}
            </Button>
        </div>
    );
}

export default AjoutArticleFormBtn;
