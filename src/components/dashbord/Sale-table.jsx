"use client"

import { useEffect, useRef, useState } from "react"
import ExcelExportButton from "./ExcelExportButton"
import SearchLoader from "./Search-loader"
import { DeleteSale, DetailsSale, UpdateSale } from "./button-sale"
import Pagination from "./Pagination"

const SaleTable = ({ initialSales, initialTotalPages, currentPage, search }) => {
    const [sales, setSales] = useState(initialSales)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [page, setPage] = useState(currentPage)

    const [searchTerm, setSearchTerm] = useState(search)
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [isLoading, setIsLoading] = useState(false)

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

        setIsLoading(true)
        fetch(`/api/sale?page=${page}&limit=10&search=${debouncedSearch}`)
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
    }, [debouncedSearch, page])

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        if (page !== 1) {
            setPage(1)
        }
    }
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Recherche (ref, date, client, vendeur)"
            className="w-full md:w-1/2 px-4 py-2 border rounded-md"
          />
          <div className="hidden mb-4 mr-4 md:block">
            <ExcelExportButton initUrl={""} />
          </div>
        </div>

        {isLoading && <SearchLoader />}

        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {sales.map((sale) => (
                  <div
                    key={sale._id}
                    className="rounded-md bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start border-b pb-2">
                      <p className="font-semibold">{sale.reference}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.dateExacte).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="pt-2 space-y-1">
                      <p className="text-sm">
                        Client: {sale.client.nomComplet}
                      </p>
                      <p className="text-sm">Total: {sale.total} TTC</p>
                      <p className="text-sm">Paiement: {sale.paymentMethod}</p>
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
                    <th className="px-3 py-5 font-medium">Montant (TTC)</th>
                    <th className="px-3 py-5 font-medium">Mode de paiement</th>
                    <th className="py-5 pl-6 pr-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sales.map((sale) => (
                    <tr
                      key={sale._id}
                      className="border-b last:border-none text-sm"
                    >
                      <td className="py-4 px-3">{sale.reference}</td>
                      <td className="py-4 px-3">
                        {new Date(sale.dateExacte).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-3">{sale.client.nomComplet}</td>
                      <td className="py-4 px-3">{sale.total} TTC</td>
                      <td className="py-4 px-3">{sale.paymentMethod}</td>
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
