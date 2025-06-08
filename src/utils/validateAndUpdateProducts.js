import Product from "@/models/Product.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function validateAndUpdateProducts(items, session) {
    for (const item of items) {
        if(!mongoose.Types.ObjectId.isValid(item.product)){
            return NextResponse.json({
                message: "Veuillez fournir un ID de produit valide.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const prod = await Product.findById(item.product).session(session)
        if (!prod) {
            return NextResponse.json({
                message: "Produit introuvable.",
                success: false,
                error: true
            }, { status: 400 })
        }

        prod.QteStock -= item.quantity
        if (prod.QteStock < 0) {
            return NextResponse.json({
                message: "Quantité en stock insuffisante pour le produit : " + prod.nom,
                success: false,
                error: true
            }, { status: 400 })
        }

        await prod.save({ session })
    }

    return null
}