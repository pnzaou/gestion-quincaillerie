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
    <div className="w-full">
      {!client ? (
        // Pas de client sélectionné - Bouton pleine largeur
        <Popover open={selectClientOpen} onOpenChange={setSelectClientOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={selectClientOpen}
              className="w-full justify-between h-10"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="truncate">Sélectionner un client</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un client..." />
              <CommandEmpty>Aucun client trouvé.</CommandEmpty>
              <CommandGroup className="max-h-[250px] overflow-y-auto">
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
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.nomComplet}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.tel}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
            <AddClientPopup />
          </PopoverContent>
        </Popover>
      ) : (
        // Client sélectionné - Affichage compact
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-secondary rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{client.nomComplet}</p>
                <p className="text-xs text-muted-foreground truncate">{client.tel}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-100"
              onClick={handleUpdateNewClient}
              title="Modifier"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-100"
              onClick={handleDeleteSelectedClient}
              title="Supprimer"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleClientSelector;