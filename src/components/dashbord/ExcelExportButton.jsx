"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import toast from "react-hot-toast"
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline"

const ExcelExportButton = ({ initUrl }) => {

    const [isLoading, setIsLoading] = useState(false)

    const handleExport = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(initUrl)

            if (!res.ok) {
                const data = await res.json()
                toast.error(data.message || "Erreur lors de l'exportation.")
                return
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = url
            link.download = "exportation.xlsx"
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error("Erreur export:", error)
            toast.error("Erreur lors de l'exportation.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                type="button"
                onClick={handleExport}
                className="hidden bg-[#0084D1] text-white font-semibold px-4 py-2 rounded hover:bg-[#0042d1] md:inline-flex hover:cursor-pointer"
            >
                {isLoading ? (
                    <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                        Exportation...
                    </>
                ) : (
                    "Exporter en Excel"
                )}
            </Button>
            <Button
             type="button"
             onClick={handleExport}
             className="md:hidden rounded-md border p-2 flex items-center justify-center gap-1 bg-[#0084D1] text-white hover:bg-[#0042d1] hover:cursor-pointer">
                <ArrowUpOnSquareIcon className="w-5" />
            </Button>
        </>
    )
}

export default ExcelExportButton;
