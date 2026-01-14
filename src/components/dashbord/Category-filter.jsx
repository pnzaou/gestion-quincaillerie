"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Checkbox } from "../ui/checkbox";
import { useParams } from "next/navigation";

export default function CategoryFilter({ selected, toggleCategory }) {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const shopId = params?.shopId;

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await fetch(`/api/category?businessId=${shopId}`);
        const body = await res.json();

        if (!res.ok) {
          console.error(
            "Impossible de récupérer les catégories :",
            body.message
          );
          return;
        }

        setCategories(body.data);
      } catch (err) {
        console.error("Erreur pendant la récupération :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [shopId]);

  if (loading) {
    return (
      <div
        className="w-full sm:w-[180px] h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
        role="status"
        aria-label="Chargement des catégories"
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full sm:w-[180px] justify-between"
        >
          <span className="truncate">
            {selected.length > 0
              ? `${selected.length} catégorie${selected.length > 1 ? 's' : ''}`
              : "Toutes les catégories"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[280px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Rechercher..." />
          <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {categories.map((cat) => (
              <CommandItem
                key={cat._id}
                onSelect={() => toggleCategory(cat._id)}
                className="flex items-center gap-2"
              >
                <Checkbox
                  checked={selected.includes(cat._id)}
                  onChange={() => toggleCategory(cat._id)}
                />
                <span className="truncate">{cat.nom}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}