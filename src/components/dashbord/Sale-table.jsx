"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import ExcelExportButton from "./ExcelExportButton"
import SearchLoader from "./Search-loader"
import { DeleteSale, DetailsSale, UpdateSale } from "./button-sale"
import Pagination from "./Pagination"
import { SaleStatusBadge } from "./Sale-status-badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter } from "lucide-react"
import toast from "react-hot-toast"

const dateOptions = {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

const STATUS_OPTIONS = [
  { value: "paid", label: "Payé" },
  { value: "pending", label: "En attente" },
  { value: "partial", label: "Partiel" },
  { value: "cancelled", label: "Annulé" }
]

const SaleTable = ({ initialSales, initialTotalPages, currentPage, search, initialStatus = [] }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const shopId = params?.shopId // ✅ Récupérer shopId
    
    const [sales, setSales] = useState(initialSales)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [page, setPage] = useState(currentPage)

    const [searchTerm, setSearchTerm] = useState(search)
    const [debouncedSearch, setDebouncedSearch] = useState(search)
    const [selectedStatus, setSelectedStatus] = useState(initialStatus)
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const isFirstRun = useRef(false)

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (!isFirstRun.current) {
            isFirstRun.current = true;
            return;
        }

        if(debouncedSearch.length > 0 && debouncedSearch.length < 3) return;

        if (!shopId) return; // ✅ Vérifier shopId

        setIsLoading(true)
        
        const statusParam = selectedStatus.length > 0 ? `&status=${selectedStatus.join(",")}` : ""
        
        // ✅ Ajouter businessId à la requête
        fetch(`/api/sale?page=${page}&limit=10&search=${debouncedSearch}${statusParam}&businessId=${shopId}`)
            .then(res => res.json())
            .then(({ data, totalPages: tp, currentPage: cp }) => {
                setSales(data)
                setTotalPages(tp)
                setPage(cp)
            })
            .catch(error => {
                console.error(error)
                toast.error("Une erreur s'est produite! Veuillez réessayer.")
            }).finally(() => setIsLoading(false))
    }, [debouncedSearch, page, selectedStatus, shopId])

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        if (page !== 1) {
            setPage(1)
        }
    }

    const toggleStatus = (status) => {
        setSelectedStatus(prev => {
            const newSelected = prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
            
            // Mettre à jour l'URL
            const params = new URLSearchParams(searchParams)
            if (newSelected.length > 0) {
                params.set('status', newSelected.join(','))
            } else {
                params.delete('status')
            }
            params.set('page', '1')
            router.push(`?${params.toString()}`, { scroll: false })
            
            if (page !== 1) {
                setPage(1)
            }
            
            return newSelected
        })
    }

    const clearFilters = () => {
        setSelectedStatus([])
        const params = new URLSearchParams(searchParams)
        params.delete('status')
        params.set('page', '1')
        router.push(`?${params.toString()}`, { scroll: false })
        if (page !== 1) {
            setPage(1)
        }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        minimumFractionDigits: 0,
      }).format(amount);
    }

    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Recherche (ref, date, client, vendeur)"
              className="w-full md:w-96 px-4 py-2 border rounded-md"
            />
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full md:w-48 justify-between"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedStatus.length > 0
                    ? `${selectedStatus.length} statut${selectedStatus.length > 1 ? 's' : ''}`
                    : "Tous les statuts"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full sm:w-56 p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un statut..." />
                  <CommandEmpty>Aucun statut trouvé.</CommandEmpty>
                  <CommandGroup>
                    {STATUS_OPTIONS.map((status) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => toggleStatus(status.value)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedStatus.includes(status.value)}
                          onCheckedChange={() => toggleStatus(status.value)}
                        />
                        <SaleStatusBadge status={status.value} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedStatus.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="hidden md:block">
            <ExcelExportButton initUrl={`/api/sale/export-excel?businessId=${shopId}`} />
          </div>
        </div>

        {isLoading && <SearchLoader />}

        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {sales?.map((sale) => (
                  <div
                    key={sale._id}
                    className="rounded-md bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start border-b pb-2">
                      <p className="font-semibold">{sale.reference}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.dateExacte).toLocaleDateString('fr-FR', dateOptions)}
                      </p>
                    </div>
                    <div className="pt-2 space-y-1">
                      <p className="text-sm">
                        Client: {sale.client?.nomComplet || "Client anonyme"}
                      </p>
                      <p className="text-sm">Total: {formatCurrency(sale.total)}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Statut:</span>
                        <SaleStatusBadge status={sale.status} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <DetailsSale id={sale._id} />
                      <DeleteSale id={sale._id} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="text-left text-sm font-normal">
                  <tr>
                    <th className="px-3 py-5 font-medium">Référence</th>
                    <th className="px-3 py-5 font-medium">Date de vente</th>
                    <th className="px-3 py-5 font-medium">Client</th>
                    <th className="px-3 py-5 font-medium">Vendeur</th>
                    <th className="px-3 py-5 font-medium text-end">Montant</th>
                    <th className="px-3 py-5 font-medium">Statut</th>
                    <th className="py-5 pl-6 pr-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sales?.map((sale) => (
                    <tr
                      key={sale._id}
                      className="border-b last:border-none text-sm"
                    >
                      <td className="py-4 px-3">{sale.reference}</td>
                      <td className="py-4 px-3">
                        {new Date(sale.dateExacte).toLocaleDateString('fr-FR', dateOptions)}
                      </td>
                      <td className="py-4 px-3">
                        {sale.client ? (
                            <div>
                              <div className="font-medium">{sale.client.nomComplet}</div>
                              <div className="text-xs text-muted-foreground">{sale.client.tel}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Client anonyme</span>
                          )}
                      </td>
                      <td className="py-4 px-3">{sale.vendeur.nom} {sale.vendeur.prenom}</td>
                      <td className="py-4 px-3 text-end">
                        {formatCurrency(sale.total)}
                          {sale.amountDue && sale.amountDue > 0 && (
                            <div className="text-xs text-[#E19209]">
                              Reste: {formatCurrency(sale.amountDue)}
                            </div>
                          )}
                      </td>
                      <td className="py-4 px-3">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="py-4 pl-6 pr-3 text-right">
                        <div className="flex justify-end gap-2">
                          <DetailsSale id={sale._id} />
                          <UpdateSale id={sale._id} />
                          <DeleteSale id={sale._id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
}

export default SaleTable;