"use client"

import { create } from "zustand";
import toast from "react-hot-toast";

export const useQuoteStore = create((set, get) => ({
  loading: false,
  quotePreviewOpen: false,
  setQuotePreviewOpen: (isOpen) => set({ quotePreviewOpen: isOpen }),
  currentQuote: null,
  setCurrentQuote: (quote) => set({ currentQuote: quote }),
  savedCartForRestore: [], // ✅ Panier sauvegardé pour restauration stocks

  createQuote: async (saleStore) => {
    set({ loading: true });
    const {
      shopId,
      cart,
      client,
      discount,
      saleDate,
    } = saleStore;

    if (!shopId) {
      toast.error("ID de boutique manquant");
      set({ loading: false });
      return null;
    }

    if (cart.length === 0) {
      toast.error("Le panier est vide");
      set({ loading: false });
      return null;
    }

    const total = saleStore.total();

    try {
      const data = {
        businessId: shopId,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.prixVente
        })),
        quoteDate: saleDate,
        remise: discount,
        total,
        client,
        notes: "",
      };

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success("Devis créé avec succès");
        
        // ✅ Sauvegarder le panier avant de le vider
        const savedCart = [...cart];
        
        // Réinitialiser le panier
        saleStore.cart = [];
        saleStore.client = null;
        saleStore.discount = 0;
        
        // Ouvrir preview
        set({ 
          currentQuote: result.data,
          quotePreviewOpen: true,
          savedCartForRestore: savedCart // ✅ Sauvegarder pour restauration
        });

        return result.data;
      } else {
        const errorData = await res.json();
        console.error(errorData);
        toast.error(errorData.message || "Erreur lors de la création du devis");
        return null;
      }
    } catch (error) {
      console.error("Erreur pendant la création du devis :", error);
      toast.error("Erreur lors de la création du devis");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  convertQuoteToSale: async (quoteId, payments, status) => {
    set({ loading: true });

    try {
      const data = {
        quoteId,
        payments: payments || [],
        status: status || "pending",
      };

      const res = await fetch("/api/quote/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success("Devis converti en vente avec succès");
        return result.data;
      } else {
        const errorData = await res.json();
        console.error(errorData);
        toast.error(errorData.message || "Erreur lors de la conversion");
        return null;
      }
    } catch (error) {
      console.error("Erreur pendant la conversion :", error);
      toast.error("Erreur lors de la conversion");
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));