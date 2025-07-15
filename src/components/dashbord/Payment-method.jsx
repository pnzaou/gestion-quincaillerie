"use client"

import { useSaleStore } from "@/stores/useSaleStore";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { SelectGroup } from "@radix-ui/react-select";

const PaymentMethod = () => {
    const payementMethod = useSaleStore((state) => state.payementMethod);
    const setPayementMethod = useSaleStore((state) => state.setPayementMethod);

    return (
        <Select
          value={payementMethod}
          onValueChange={(val) => {
            setPayementMethod(val);
          }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez le mode de paiement"/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Modes de paiement</SelectLabel>
                    {["espèce", "carte de crédit", "Wave", "Orange Money", "Free Money"].map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default PaymentMethod;
