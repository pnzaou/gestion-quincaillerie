import { Button } from "@/components/ui/button";

const BoutonImp = ({ handleChange, isLoading }) => {
    return (
        <div className="relative inline-block">
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button
                type="button"
                className="bg-[#0084D1] text-white font-semibold px-4 py-2 rounded hover:bg-[#0042d1]"
            >
                {isLoading ? (
                    <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                        Importation...
                    </>
                ) : (
                    "Importer depuis Excel"
                )}
            </Button>
        </div>
    );
}

export default BoutonImp;
