"use client"

import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Required from "../Required";
import toast from "react-hot-toast";
import { useSaleStore } from "@/stores/useSaleStore";

const AddClientPopup = () => {
    const params = useParams();
    const shopId = params?.shopId;

    const newClientDrawerOpen = useSaleStore((state) => state.newClientDrawerOpen);
    const setNewClientDrawerOpen = useSaleStore((state) => state.setNewClientDrawerOpen);
    const newClient = useSaleStore((state) => state.newClient);
    const setNewClient = useSaleStore((state) => state.setNewClient);
    const setClient = useSaleStore((state) => state.setClient);
    const setSelectClientOpen = useSaleStore((state) => state.setSelectClientOpen);

    const handleAddClient = () => {
        if (!shopId) {
            toast.error("ID de boutique manquant");
            return;
        }

        if (newClient.nomComplet.trim() === "" || newClient.tel.trim() === "") {
            toast.error("Le nom et numéro du client sont obligatoires");  
            return;
        }

        setClient({
            ...newClient,
            businessId: shopId
        });
        
        setNewClientDrawerOpen(false);
        setSelectClientOpen(false);
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
                <Button className="mt-2 w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer text-white font-semibold rounded-t-none">
                    + Nouveau client
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        Nouveau client
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Ligne 1 - responsive */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="nom">Nom complet <Required/></Label>
                            <Input 
                             id="nom"
                             type="text"
                             value={newClient.nomComplet}
                             onChange={(e) => setNewClient(({...newClient, nomComplet: e.target.value}))}
                            />
                        </div>
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="tel">Téléphone <Required/></Label>
                            <Input 
                             id="tel"
                             type="tel"
                             value={newClient.tel}
                             onChange={(e) => setNewClient(({...newClient, tel: e.target.value}))}
                            />
                        </div>
                    </div>

                    {/* Ligne 2 - responsive */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                             id="email"
                             type="email"
                             value={newClient.email}
                             onChange={(e) => setNewClient(({...newClient, email: e.target.value}))}
                            />
                        </div>
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="adresse">Adresse</Label>
                            <Input 
                             id="adresse"
                             type="text"
                             value={newClient.adresse}
                             onChange={(e) => setNewClient(({...newClient, adresse: e.target.value}))}
                            />
                        </div>
                    </div>

                    {/* Bouton */}
                    <div className="flex justify-end pt-4">
                        <Button 
                          className="w-full sm:w-auto bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer text-white font-semibold"
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