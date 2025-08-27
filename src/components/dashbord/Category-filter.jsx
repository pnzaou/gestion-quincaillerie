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

export default function CategoryFilter({ selected, toggleCategory }) {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await fetch("/api/category");
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
  }, []);

  if (loading) {
    return (
      <div
        className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
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
          className="w-40 justify-between"
        >
          {selected.length > 0
            ? `${selected.length} catégories`
            : "Toutes les catégories"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full sm:w-56 p-0">
        <Command>
          <CommandInput placeholder="Rechercher..." />
          <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
          <CommandGroup>
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
                {cat.nom}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
