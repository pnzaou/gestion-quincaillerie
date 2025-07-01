"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Required from "../Required";
import toast from "react-hot-toast";
import { useSaleStore } from "@/stores/useSaleStore";

const AddClientPopup = () => {

    const newClientDrawerOpen = useSaleStore((state) => state.newClientDrawerOpen)
    const setNewClientDrawerOpen = useSaleStore((state) => state.setNewClientDrawerOpen)
    const newClient = useSaleStore((state) => state.newClient)
    const setNewClient = useSaleStore((state) => state.setNewClient)
    const setClient = useSaleStore((state) => state.setClient)
    const setSelectClientOpen = useSaleStore((state) => state.setSelectClientOpen)

    const handleAddClient = () => {
        if (newClient.nomComplet.trim() === "" || newClient.tel.trim() === "") {
            toast.error("Le nom et numéro du client sont obligatoires");  
            return;
        }
        setClient(newClient);
        setNewClientDrawerOpen(false);
        setSelectClientOpen(false)
        setNewClient({
            nomComplet: "",
            tel: "",
            email: "",
            adresse: ""
        });
    }
    
    return (
        <Dialog open={newClientDrawerOpen} onOpenChange={setNewClientDrawerOpen}>
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
                            <Label htmlFor="nom">Nom complet <Required/></Label>
                            <Input 
                             id="nom"
                             type="text"
                             value={newClient.nomComplet}
                             onChange={(e) => setNewClient(({...newClient, nomComplet: e.target.value}))}
                            />
                        </div>
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="tel">Téléphone <Required/></Label>
                            <Input 
                             id="tel"
                             type="tel"
                             value={newClient.tel}
                             onChange={(e) => setNewClient(({...newClient, tel: e.target.value}))}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mb-10">
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                             id="email"
                             type="email"
                             value={newClient.email}
                             onChange={(e) => setNewClient(({...newClient, email: e.target.value}))}
                            />
                        </div>
                        <div className="grid gap-3 flex-1/2">
                            <Label htmlFor="adresse">Adresse</Label>
                            <Input 
                             id="adresse"
                             type="text"
                             value={newClient.adresse}
                             onChange={(e) => setNewClient(({...newClient, adresse: e.target.value}))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button 
                          className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer text-white font-bold rounded"
                          onClick={handleAddClient}
                        >
                            Enregistrer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AddClientPopup;
