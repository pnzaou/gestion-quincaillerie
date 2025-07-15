"use client"

import { useSaleStore } from "@/stores/useSaleStore";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { SelectGroup } from "@radix-ui/react-select";

const statusOption = [
    {value: "paid", label: "Réglé"},
    {value: "partial", label: "Acompte versé"},
    {value: "pending", label: "À crédit"}
]

const SaleStatus = () => {

    const saleStatus = useSaleStore((state) => state.saleStatus);
    const setSaleStatus = useSaleStore((state) => state.setSaleStatus);

    return (
        <Select
          value={saleStatus}
          onValueChange={(val) => {
            setSaleStatus(val);
          }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez le mode de paiement"/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Statut</SelectLabel>
                    {statusOption.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SaleStatus;
