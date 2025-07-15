"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";

const OrderSupplierSelector = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectSupplierOpen, setSelectSupplierOpen] = useState(false)
  const [supplier, setSupplier] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/supplier");
        const body = await res.json();

        if (!res.ok) {
          console.error(
            "Impossible de récupérer les fournisseurs :",
            body.message
          );
          return;
        }

        setSuppliers(body.data);
      } catch (error) {
        console.error("Erreur pendant la récupération des données :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(suppliers)

  if (loading) {
    return (
      <div
        className="w-[150px] h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
        role="status"
        aria-label="Chargement des fournisseurs"
      />
    );
  }
  return (
    <Popover open={selectSupplierOpen} onOpenChange={setSelectSupplierOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={selectSupplierOpen}
                className="justify-between"
            >
                {supplier?.nom ?? 'Choisir le fournisseur'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un fournisseur..." className="h-9"/>
            <CommandList>
              <CommandEmpty>Aucun fournisseur trouvé</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="reset"
                  onSelect={() => {
                    setSupplier(null);
                    setSelectSupplierOpen(false)
                  }}
                >
                  Aucun fournisseur
                  <Check className={cn("ml-auto h-4 w-4", !supplier ? "opacity-100" : "opacity-0")} />
                </CommandItem>
                {suppliers?.map(sup => (
                  <CommandItem
                    key={sup._id}
                    value={sup.nom.toLowerCase()}
                    onSelect={() => {
                      setSupplier(sup)
                      setSelectSupplierOpen(false)
                    }}
                  >
                    {sup.nom}
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        supplier?._id === sup._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
    </Popover>
  );
};

export default OrderSupplierSelector;
