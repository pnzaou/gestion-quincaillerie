"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";
import SearchLoader from "./Search-loader";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import OrderStatusBadge from "./Order-status-badge";
import { DetailsOrder, CancelOrder } from "./button-order";

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyée" },
  { value: "confirmed", label: "Confirmée" },
  { value: "partially_received", label: "Réception partielle" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];

const OrderTable = ({
  initialOrders,
  initialTotalPages,
  currentPage,
  search,
  initialStatus = [],
  initialStartDate = "",
  initialEndDate = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const shopId = params?.shopId;

  const [orders, setOrders] = useState(initialOrders);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(currentPage);

  const [searchTerm, setSearchTerm] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [startDate, setStartDate] = useState(initialStartDate ? new Date(initialStartDate) : null);
  const [endDate, setEndDate] = useState(initialEndDate ? new Date(initialEndDate) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const isFirstRun = useRef(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!isFirstRun.current) {
      isFirstRun.current = true;
      return;
    }

    if (debouncedSearch.length > 0 && debouncedSearch.length < 3) return;
    if (!shopId) return;

    setIsLoading(true);

    const statusParam = selectedStatus.length > 0 ? `&status=${selectedStatus.join(",")}` : "";
    const dateParams = `${startDate ? `&startDate=${startDate.toISOString()}` : ""}${
      endDate ? `&endDate=${endDate.toISOString()}` : ""
    }`;

    fetch(
      `/api/order?page=${page}&limit=10&search=${debouncedSearch}${statusParam}${dateParams}&businessId=${shopId}`
    )
      .then((res) => res.json())
      .then(({ data, totalPages: tp, currentPage: cp }) => {
        setOrders(data);
        setTotalPages(tp);
        setPage(cp);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Une erreur s'est produite! Veuillez réessayer.");
      })
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, page, selectedStatus, startDate, endDate, shopId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const toggleStatus = (status) => {
    setSelectedStatus((prev) => {
      const newSelected = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];

      const params = new URLSearchParams(searchParams);
      if (newSelected.length > 0) {
        params.set("status", newSelected.join(","));
      } else {
        params.delete("status");
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });

      if (page !== 1) {
        setPage(1);
      }

      return newSelected;
    });
  };

  const handleDateChange = (type, date) => {
    const params = new URLSearchParams(searchParams);
    
    if (type === "start") {
      setStartDate(date);
      if (date) {
        params.set("startDate", date.toISOString());
      } else {
        params.delete("startDate");
      }
    } else {
      setEndDate(date);
      if (date) {
        params.set("endDate", date.toISOString());
      } else {
        params.delete("endDate");
      }
    }
    
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
    
    if (page !== 1) {
      setPage(1);
    }
  };

  const clearFilters = () => {
    setSelectedStatus([]);
    setStartDate(null);
    setEndDate(null);
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
    if (page !== 1) {
      setPage(1);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Recherche (référence)"
            className="w-full md:w-96 px-4 py-2 border rounded-md"
          />

          {/* Filtre par statut */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full md:w-48 justify-between"
              >
                <Filter className="w-4 h-4 mr-2" />
                {selectedStatus.length > 0
                  ? `${selectedStatus.length} statut${selectedStatus.length > 1 ? "s" : ""}`
                  : "Filtrer par statut"}
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
                      <OrderStatusBadge status={status.value} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Filtre par date */}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-64 justify-start text-left font-normal",
                  !startDate && !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && endDate
                  ? `${format(startDate, "dd/MM/yy", { locale: fr })} - ${format(endDate, "dd/MM/yy", { locale: fr })}`
                  : startDate
                  ? `Du ${format(startDate, "dd/MM/yy", { locale: fr })}`
                  : endDate
                  ? `Au ${format(endDate, "dd/MM/yy", { locale: fr })}`
                  : "Filtrer par date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-sm font-medium mb-2">Date de début</p>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateChange("start", date)}
                    locale={fr}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Date de fin</p>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateChange("end", date)}
                    locale={fr}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {(selectedStatus.length > 0 || startDate || endDate) && (
            <Button variant="ghost" onClick={clearFilters} className="w-full md:w-auto">
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {isLoading && <SearchLoader />}

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {/* Mobile */}
            <div className="md:hidden space-y-2">
              {orders?.map((order) => (
                <div key={order._id} className="rounded-md bg-white p-4 shadow-sm">
                  <div className="flex justify-between items-start border-b pb-2">
                    <p className="font-semibold">{order.reference}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="pt-2 space-y-1">
                    <p className="text-sm">Date: {formatDate(order.orderDate)}</p>
                    <p className="text-sm">
                      Fournisseur: {order.supplier?.nom || "Non spécifié"}
                    </p>
                    <p className="text-sm font-medium">Total: {formatCurrency(order.total)}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <DetailsOrder id={order._id} />
                    {order.status !== "cancelled" && order.status !== "completed" && (
                      <CancelOrder id={order._id} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="text-left text-sm font-normal">
                <tr>
                  <th className="px-3 py-5 font-medium">Référence</th>
                  <th className="px-3 py-5 font-medium">Date</th>
                  <th className="px-3 py-5 font-medium">Fournisseur</th>
                  <th className="px-3 py-5 font-medium text-right">Montant</th>
                  <th className="px-3 py-5 font-medium">Statut</th>
                  <th className="py-5 pl-6 pr-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {orders?.map((order) => (
                  <tr key={order._id} className="border-b last:border-none text-sm">
                    <td className="py-4 px-3 font-medium">{order.reference}</td>
                    <td className="py-4 px-3">{formatDate(order.orderDate)}</td>
                    <td className="py-4 px-3">
                      {order.supplier ? (
                        <div>
                          <div className="font-medium">{order.supplier.nom}</div>
                          {order.supplier.tel && (
                            <div className="text-xs text-muted-foreground">
                              {order.supplier.tel}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non spécifié</span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4 px-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-4 pl-6 pr-3 text-right">
                      <div className="flex justify-end gap-2">
                        <DetailsOrder id={order._id} />
                        {order.status !== "cancelled" && order.status !== "completed" && (
                          <CancelOrder id={order._id} />
                        )}
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
};

export default OrderTable;