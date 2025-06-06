"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const AddClientPopup = ({ client, setClient }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    return (
        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DialogTrigger asChild>
                <Button className="mt-4 w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer text-white font-bold rounded-t-none rounded-b-sm">
                    + Nouveau client
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <p className="text-lg font-bold mb-4">
                            Nouveau client
                        </p>
                    </DialogTitle>
                </DialogHeader>
                <div>
                    <div className="flex gap-4 mb-4">
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="nom">Nom complet</Label>
                            <Input 
                             id="nom"
                             type="text"
                             value={client.nomComplet}
                             onChange={(e) => setClient((prev) => ({...prev, nomComplet: e.target.value}))}
                            />
                        </div>
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="tel">Téléphone</Label>
                            <Input 
                             id="tel"
                             type="tel"
                             value={client.tel}
                             onChange={(e) => setClient((prev) => ({...prev, tel: e.target.value}))}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mb-10">
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                             id="email"
                             type="email"
                             value={client.email}
                             onChange={(e) => setClient((prev) => ({...prev, email: e.target.value}))}
                            />
                        </div>
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="adresse">Adresse</Label>
                            <Input 
                             id="adresse"
                             type="text"
                             value={client.adresse}
                             onChange={(e) => setClient((prev) => ({...prev, adresse: e.target.value}))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer text-white font-bold rounded">
                            Enregistrer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AddClientPopup;
