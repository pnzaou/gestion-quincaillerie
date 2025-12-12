"use client"

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";
import { useSaleStore } from "@/stores/useSaleStore";
import AddClientPopup from "./Add-client-popup";

const SaleClientSelector = () => {
  const params = useParams();
  const shopId = params?.shopId;

  const selectClientOpen = useSaleStore((state) => state.selectClientOpen);
  const setSelectClientOpen = useSaleStore((state) => state.setSelectClientOpen);
  const clientsData = useSaleStore((state) => state.clientsData);
  const getClientsData = useSaleStore((state) => state.getClientsData);
  const client = useSaleStore((state) => state.client);
  const setClient = useSaleStore((state) => state.setClient);
  const handleDeleteSelectedClient = useSaleStore((state) => state.handleDeleteSelectedClient);
  const handleUpdateNewClient = useSaleStore((state) => state.handleUpdateNewClient);
  const setShopId = useSaleStore((state) => state.setShopId);

  // ✅ Initialiser shopId puis charger les clients
  useEffect(() => {
    if (shopId) {
      setShopId(shopId);
      getClientsData();
    }
  }, [shopId, setShopId, getClientsData]);

  const handleSelectClient = (selectedClient) => {
    setClient(selectedClient);
    setSelectClientOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={selectClientOpen} onOpenChange={setSelectClientOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={selectClientOpen}
            className={cn(
              "w-full sm:w-[300px] justify-between",
              !client && "text-muted-foreground"
            )}
          >
            {client ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{client.nomComplet}</span>
              </div>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Sélectionner un client
              </>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full sm:w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher un client..." />
            <CommandEmpty>Aucun client trouvé.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {clientsData?.map((c) => (
                <CommandItem
                  key={c._id}
                  value={c.nomComplet}
                  onSelect={() => handleSelectClient(c)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      client?._id === c._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{c.nomComplet}</div>
                    <div className="text-xs text-muted-foreground">{c.tel}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
          <AddClientPopup />
        </PopoverContent>
      </Popover>

      {client && (
        <div className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-md">
          <span className="text-sm font-medium">{client.nomComplet}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2"
            onClick={handleUpdateNewClient}
          >
            <UserPlus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDeleteSelectedClient}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SaleClientSelector;