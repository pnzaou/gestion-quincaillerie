import { create } from "zustand";

export const useSaleStore = create((set) => ({
    loading: false,

    //gesttion des clients provenants de la bd pour les afficher dans le combobox client
    clientsData: [],
    getClientsData: async () => {
        set({ loading: true });
        try {
            const res = await fetch("/api/client");
            const body = await res.json();
        
            if (!res.ok) {
              console.error("Impossible de récupérer les clients :", body.message);
              return;
            }
        
            set({ clientsData: body.data });
        } catch (err) {
            console.error("Erreur pendant la récupération des données :", err);
        } finally {
            set({ loading: false });
        }
    },

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