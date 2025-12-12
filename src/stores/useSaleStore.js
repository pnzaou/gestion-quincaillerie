"use client"

import { saleVerif } from "@/utils/saleVerif";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useSaleStore = create((set, get) => ({
  loading: false,
  shopId: null, // ✅ Ajout du shopId
  setShopId: (id) => set({ shopId: id }), // ✅ Setter pour shopId

  //gestion de la date de vente
  saleDate: new Date(),
  setSaleDate: (newDate) => set({ saleDate: newDate }),

  //gestion des clients provenants de la bd pour les afficher dans le combobox client
  clientsData: [],
  getClientsData: async () => {
    const shopId = get().shopId;
    if (!shopId) {
      console.error("shopId manquant pour getClientsData");
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch(`/api/client?businessId=${shopId}`);
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
    adresse: "",
  },
  setNewClient: (newClient) => set({ newClient }),

  handleUpdateNewClient: () => {
    set({
      panierDrawerOpen: false,
      selectClientOpen: true,
      newClientDrawerOpen: true,
      newClient: get().client,
    });
  },

  //gestion du combobox de selection d'un client
  selectClientOpen: false,
  setSelectClientOpen: (isOpen) => set({ selectClientOpen: isOpen }),

  //suppression du client selectionné
  handleDeleteSelectedClient: () => {
    set({
      client: null,
      newClient: {
        nomComplet: "",
        tel: "",
        email: "",
        adresse: "",
      },
    });
  },

  //gestion du panier de vente
  panierDrawerOpen: false,
  setPanierDrawerOpen: (isOpen) => set({ panierDrawerOpen: isOpen }),

  cart: [],
  addToCart: (item, localStocks, setLocalStocks) => {
    const currentStock = localStocks[item._id] ?? item.QteStock;

    if (currentStock <= 0) {
      return;
    }

    set((state) => {
      const exists = state.cart.find((i) => i._id === item._id);
      if (exists) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...item, quantity: 1 }],
      };
    });

    setLocalStocks((prev) => ({
      ...prev,
      [item._id]: prev[item._id] - 1,
    }));
  },
  removeFromCart: (itemId, setLocalStocks) => {
    const cart = get().cart;
    const item = cart.find((i) => i._id === itemId);

    if (!item) {
      return;
    }

    set((state) => ({
      ...state,
      cart: state.cart
        .map((i) => (i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    }));

    setLocalStocks((prev) => ({
      ...prev,
      [itemId]: prev[itemId] + 1,
    }));
  },

  //gestion remise
  discount: 0,
  setDiscount: (newDiscount) => set({ discount: newDiscount }),

  //gestion statut vente
  saleStatus: "",
  setSaleStatus: (newStatus) => set({ saleStatus: newStatus }),

  //gestion du total
  total: () => {
    const cart = get().cart;
    const discount = get().discount;
    return (
      cart.reduce((sum, item) => {
        const prix = item.prixVenteDetail || item.prixVenteEnGros;
        return sum + prix * item.quantity;
      }, 0) *
      (1 - discount / 100)
    );
  },

  //montant payé
  amountPaid: 0,
  setAmountPaid: (newAmount) => set({ amountPaid: newAmount }),

  //méthode de paiement
  payementMethod: "",
  setPayementMethod: (newMethod) => set({ payementMethod: newMethod }),

  payments: [], // tableau { method, amount }

  addPayment: (payment) => {
    set((state) => {
      return { payments: [...state.payments, payment] };
    });
  },

  updatePayment: (index, patch) => {
    set((state) => {
      const payments = [...state.payments];
      payments[index] = { ...payments[index], ...patch };
      return { payments };
    });
  },

  removePayment: (index) => {
    set((state) => {
      const payments = state.payments.filter((_, i) => i !== index);
      return { payments };
    });
  },

  clearPayments: () => set({ payments: [] }),

  paymentsSum: () => {
    const payments = get().payments || [];
    return payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  },

  //creation de la vente
  createSale: async () => {
    set({ loading: true });
    const {
      saleDate,
      client,
      cart,
      discount,
      saleStatus,
      payments,
      clearPayments,
      shopId // ✅ Récupérer shopId
    } = get();
    const total = get().total();

    if (!shopId) {
      toast.error("ID de boutique manquant");
      set({ loading: false });
      return;
    }

    try {
      saleVerif(cart, saleStatus, payments, total, client);
      const data = {
        businessId: shopId, // ✅ Ajout du businessId
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.prixVenteDetail || item.prixVenteEnGros,
        })),
        dateExacte: saleDate,
        remise: discount,
        total,
        client,
        status: saleStatus,
        payments,
      };
      const res = await fetch("/api/sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Vente enregistrée avec succès");
        set({
          cart: [],
          client: null,
          saleDate: new Date(),
          discount: 0,
          saleStatus: "",
          amountPaid: 0,
          payementMethod: "",
        });
        clearPayments();
        return;
      } else {
        const errorData = await res.json();
        console.error(errorData);
        toast.error(
          errorData.message || "Erreur lors de la création de la vente"
        );
        return;
      }
    } catch (error) {
      console.error("Erreur pendant la création de la vente :", error);
    } finally {
      set({ loading: false });
    }
  },
}));