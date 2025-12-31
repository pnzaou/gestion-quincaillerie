"use client"

import toast from "react-hot-toast";
import { create } from "zustand";

export const useOrderStore = create((set, get) => ({
  loading: false,
  shopId: null,
  setShopId: (id) => set({ shopId: id }),
  selectSupplierOpen: false,
  setSelectSupplierOpen: (isOpen) => set({ selectSupplierOpen: isOpen }),

  orderDate: new Date(),
  setOrderDate: (newDate) => set({ orderDate: newDate }),

  expectedDelivery: null,
  setExpectedDelivery: (date) => set({ expectedDelivery: date }),

  supplier: null,
  setSupplier: (supplier) => set({ supplier }),

  suppliersData: [],
  getSuppliersData: async () => {
    const shopId = get().shopId;
    if (!shopId) {
      console.error("shopId manquant pour getSuppliersData");
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch(`/api/supplier?businessId=${shopId}`);
      const body = await res.json();

      if (!res.ok) {
        console.error("Impossible de récupérer les fournisseurs :", body.message);
        return;
      }

      set({ suppliersData: body.data });
    } catch (err) {
      console.error("Erreur pendant la récupération des données :", err);
    } finally {
      set({ loading: false });
    }
  },

  cart: [],
  
  addToCart: (item) => {
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
  },

  removeFromCart: (itemId) => {
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
  },

  // ✅ NOUVEAU - Mise à jour directe de la quantité
  updateCartQuantity: (item, newQuantity) => {
    const cart = get().cart;
    const existingItem = cart.find((i) => i._id === item._id);

    if (newQuantity === 0) {
      // Retirer complètement du panier
      set((state) => ({
        ...state,
        cart: state.cart.filter((i) => i._id !== item._id),
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
  },

  clearCart: () => set({ cart: [] }),

  notes: "",
  setNotes: (notes) => set({ notes }),

  total: () => {
    const cart = get().cart;
    return cart.reduce((sum, item) => {
      const prix = item.prixAchat;
      return sum + prix * item.quantity;
    }, 0);
  },

  createOrder: async () => {
    set({ loading: true });
    const {
      shopId,
      supplier,
      cart,
      orderDate,
      expectedDelivery,
      notes,
    } = get();
    const total = get().total();

    if (!shopId) {
      toast.error("ID de boutique manquant");
      set({ loading: false });
      return;
    }

    if (cart.length === 0) {
      toast.error("Le panier est vide");
      set({ loading: false });
      return;
    }

    try {
      const data = {
        businessId: shopId,
        supplier: supplier?._id || null,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.prixAchat
        })),
        orderDate,
        expectedDelivery,
        notes,
        total,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Commande créée avec succès");
        set({
          cart: [],
          supplier: null,
          orderDate: new Date(),
          expectedDelivery: null,
          notes: "",
        });
        return true;
      } else {
        const errorData = await res.json();
        console.error(errorData);
        toast.error(
          errorData.message || "Erreur lors de la création de la commande"
        );
        return false;
      }
    } catch (error) {
      console.error("Erreur pendant la création de la commande :", error);
      toast.error("Erreur lors de la création de la commande");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));