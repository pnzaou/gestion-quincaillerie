"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/stores/useOrderStore";

const OrderSupplierSelector = () => {
  const params = useParams();
  const shopId = params?.shopId;

  const selectSupplierOpen = useOrderStore((state) => state.selectSupplierOpen);
  const setSelectSupplierOpen = useOrderStore((state) => state.setSelectSupplierOpen);
  const suppliersData = useOrderStore((state) => state.suppliersData);
  const getSuppliersData = useOrderStore((state) => state.getSuppliersData);
  const supplier = useOrderStore((state) => state.supplier);
  const setSupplier = useOrderStore((state) => state.setSupplier);
  const setShopId = useOrderStore((state) => state.setShopId);
  const loading = useOrderStore((state) => state.loading);

  // ✅ Initialiser shopId puis charger les fournisseurs
  useEffect(() => {
    if (shopId) {
      setShopId(shopId);
      getSuppliersData();
    }
  }, [shopId, setShopId, getSuppliersData]);

  if (loading) {
    return (
      <div
        className="w-[200px] h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
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
          className="w-full sm:w-[250px] justify-between"
        >
          {supplier ? supplier.nom : "Choisir le fournisseur"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un fournisseur..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucun fournisseur trouvé</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="reset"
                onSelect={() => {
                  setSupplier(null);
                  setSelectSupplierOpen(false);
                }}
              >
                Aucun fournisseur
                <Check className={cn("ml-auto h-4 w-4", !supplier ? "opacity-100" : "opacity-0")} />
              </CommandItem>
              {suppliersData?.map((sup) => (
                <CommandItem
                  key={sup._id}
                  value={sup.nom.toLowerCase()}
                  onSelect={() => {
                    setSupplier(sup);
                    setSelectSupplierOpen(false);
                  }}
                >
                  {sup.nom}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
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