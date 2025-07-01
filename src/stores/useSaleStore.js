import { create } from "zustand";

export const useSaleStore = create((set) => ({
    //gestion des informations du client à envoyer lors de la soumission de la commande
    client: null,
    setClient: (client) => set({ client }),

    //gestion du popup d'ajout d'un nouveau client
    newClientDrawerOpen: false,
    setNewClientDrawerOpen: (isOpen) => set({ newClientDrawerOpen: isOpen }),

    //gestion du formulaire d'ajout d'un nouveau client
    newClient: {
        nomComplet: "",
        tel: "",
        email: "",
        adresse: ""
    },
    setNewClient: (newClient) => set({ newClient }),

    //gestion du combobox de selection d'un client
    selectClientOpen: false,
    setSelectClientOpen: (isOpen) => set({ selectClientOpen: isOpen }),
}))