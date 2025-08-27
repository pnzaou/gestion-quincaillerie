"use client";

import { useEffect } from "react";
import AddClientPopup from "./Add-client-popup";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { useSaleStore } from "@/stores/useSaleStore";

const SaleClientSelector = () => {
  const loading = useSaleStore((state) => state.loading);
  const clientsData = useSaleStore((state) => state.clientsData);
  const selectClientOpen = useSaleStore((state) => state.selectClientOpen);
  const setSelectClientOpen = useSaleStore(
    (state) => state.setSelectClientOpen
  );
  const client = useSaleStore((state) => state.client);
  const setClient = useSaleStore((state) => state.setClient);
  const getClientsData = useSaleStore((state) => state.getClientsData);

  useEffect(() => {
    getClientsData();
  }, []);

  if (loading) {
    return (
      <div
        className="w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
        role="status"
        aria-label="Chargement des clients"
      />
    );
  }

  return (
    <Popover open={selectClientOpen} onOpenChange={setSelectClientOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={selectClientOpen}
          className="justify-between min-w-[140px]"
        >
          <span className="truncate max-w-[160px]">
            {client?.nomComplet ?? "Choisir client"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un client..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucun client trouvé</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="reset"
                onSelect={() => {
                  setClient(null);
                  setSelectClientOpen(false);
                }}
              >
                Aucun client
                <Check className={cn('ml-auto h-4 w-4', !client ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
              {clientsData?.map((clt) => (
                <CommandItem
                  key={clt._id}
                  value={clt.nomComplet.toLowerCase()}
                  onSelect={() => {
                    setClient(clt);
                    setSelectClientOpen(false);
                  }}
                >
                  {clt.nomComplet}
                  <Check className={cn('ml-auto h-4 w-4', client?._id === clt._id ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <AddClientPopup />
      </PopoverContent>
    </Popover>
  );
};

export default SaleClientSelector;
