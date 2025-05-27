import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Checkbox } from "../ui/checkbox";

const categories = [
    'Tous',
    'Cuisine',
    'Décoration',
    'Electronique',
    'Fitness',
    'Jardin',
    'Loisirs',
    'Maison',
]

const CategoryFilter = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState([]);

    const toggleCategory = (category) => {
        setSelected((prev) => 
            prev.includes(category)
            ? prev.filter((item) => item !== category)
            : [...prev, category]
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                 variant="outline"
                 role="combobox"
                 className="w-[200px] justify-between"
                >
                    {selected.length > 0
                     ? `${selected.length} catégories sélectionnées`
                     : 'Toutes les catégories'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher..."/>
                    <CommandEmpty>Aucune catégories trouvée.</CommandEmpty>
                    <CommandGroup>
                        {categories.map((category) => (
                            <CommandItem
                             key={category}
                             onSelect={() => toggleCategory(category)}
                             className="flex items-centergap-2"
                            >
                              <Checkbox
                               checked={selected.includes(category)}
                               onChange={() => toggleCategory(category)}
                              />
                              {category}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default CategoryFilter;
