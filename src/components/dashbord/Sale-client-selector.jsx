"use client"

import { useEffect, useState } from "react";
import AddClientPopup from "./Add-client-popup";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";

const SaleClientSelector = ({selectClientOpen, setSelectClientOpen, client, setClient, newClient, setNewClient, newClientDrawerOpen, setNewClientDrawerOpen}) => {
    
    const [clientsData, setClientsData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/client");
                const body = await res.json();
        
                if (!res.ok) {
                  console.error("Impossible de récupérer les clients :", body.message);
                  return;
                }
        
                setClientsData(body.data);
            } catch (err) {
                console.error("Erreur pendant la récupération des données :", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [])

    if (loading) {
        return (
          <div
            className="w-[150px] h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
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
                className="justify-between"
            >
                {client?.nomComplet ?? 'Choisir client'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
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
                        <Check className={cn("ml-auto h-4 w-4", !client ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                        {clientsData?.map(clt => (
                        <CommandItem
                            key={clt._id}
                            value={clt.nomComplet.toLowerCase()}
                            onSelect={() => {
                            setClient(clt);
                            setSelectClientOpen(false);
                            }}
                        >
                            {clt.nomComplet}
                            <Check
                            className={cn(
                                "ml-auto h-4 w-4",
                                client?._id === clt._id ? "opacity-100" : "opacity-0"
                            )}
                            />
                        </CommandItem>
                        ))}
                    </CommandGroup>
                    </CommandList>
                </Command>
                <AddClientPopup
                 newClient={newClient}
                 setNewClient={setNewClient}
                 setClient={setClient}
                 newClientDrawerOpen={newClientDrawerOpen}
                 setNewClientDrawerOpen={setNewClientDrawerOpen}
                 setSelectClientOpen={setSelectClientOpen}
                 />
            </PopoverContent>
        </Popover>
    );
}

export default SaleClientSelector;
