"use client"

import { saleVerif } from "@/utils/saleVerif";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useSaleStore = create((set, get) => ({
  loading: false,
  shopId: null,
  setShopId: (id) => set({ shopId: id }),
  
  invoicePreviewOpen: false,
  setInvoicePreviewOpen: (isOpen) => set({ invoicePreviewOpen: isOpen }),

  currentSale: null,
  setCurrentSale: (sale) => set({ currentSale: sale }),

  currentPayments: [],
  setCurrentPayments: (payments) => set({ currentPayments: payments }),

  printType: null, // 'invoice' ou 'receipt'
  setPrintType: (type) => set({ printType: type }),
  
  saleDate: new Date(),
  setSaleDate: (newDate) => set({ saleDate: newDate }),

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

  client: null,
  setClient: (client) => set({ client }),

  newClientDrawerOpen: false,
  setNewClientDrawerOpen: (isOpen) => set({ newClientDrawerOpen: isOpen }),

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

  selectClientOpen: false,
  setSelectClientOpen: (isOpen) => set({ selectClientOpen: isOpen }),

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
            i._id === item._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
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
        .map((i) => 
          i._id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));

    setLocalStocks((prev) => ({
      ...prev,
      [itemId]: prev[itemId] + 1,
    }));
  },

  // ✅ NOUVEAU - Mise à jour directe de la quantité
  updateCartQuantity: (item, newQuantity, localStocks, setLocalStocks) => {
    const cart = get().cart;
    const existingItem = cart.find((i) => i._id === item._id);
    const oldQuantity = existingItem?.quantity || 0;
    const quantityDiff = newQuantity - oldQuantity;

    if (newQuantity === 0) {
      // Retirer complètement du panier
      set((state) => ({
        ...state,
        cart: state.cart.filter((i) => i._id !== item._id),
      }));

      setLocalStocks((prev) => ({
        ...prev,
        [item._id]: prev[item._id] + oldQuantity,
      }));
      return;
    }

    if (existingItem) {
      // Mettre à jour la quantité
      set((state) => ({
        ...state,
        cart: state.cart.map((i) =>
          i._id === item._id
            ? { ...i, quantity: newQuantity }
            : i
        ),
      }));
    } else {
      // Ajouter au panier
      set((state) => ({
        ...state,
        cart: [...state.cart, { ...item, quantity: newQuantity }],
      }));
    }

    // Ajuster le stock local
    setLocalStocks((prev) => ({
      ...prev,
      [item._id]: prev[item._id] - quantityDiff,
    }));
  },

  discount: 0,
  setDiscount: (newDiscount) => set({ discount: newDiscount }),

  saleStatus: "",
  setSaleStatus: (newStatus) => set({ saleStatus: newStatus }),

  total: () => {
    const cart = get().cart;
    const discount = get().discount;
    return (
      cart.reduce((sum, item) => {
        const prix = item.prixVente;
        return sum + prix * item.quantity;
      }, 0) *
      (1 - discount / 100)
    );
  },

  amountPaid: 0,
  setAmountPaid: (newAmount) => set({ amountPaid: newAmount }),

  payementMethod: "",
  setPayementMethod: (newMethod) => set({ payementMethod: newMethod }),

  payments: [],

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
      shopId
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
        businessId: shopId,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.prixVente
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
        const result = await res.json();
        toast.success("Vente enregistrée avec succès");

        set({
          currentSale: result.sale,
          currentPayments: result.payments || [],
          invoicePreviewOpen: true,
          panierDrawerOpen: false,
        });

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
        return result.sale;
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
      toast.error("Erreur lors de la création de la vente");
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));