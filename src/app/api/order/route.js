import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { withAuth } from "@/utils/withAuth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { validateOrderPayload } from "@/dtos/order.dto";
import { createOrder } from "@/services/order.service";
import { HttpError } from "@/services/errors.service";
import mongoose from "mongoose";

export const POST = withAuth(async (req) => {
  await dbConnection();
  const raw = await req.json();

  // Vérifier businessId avant validation
  if (!raw.businessId) {
    return NextResponse.json({
      message: "ID de la boutique manquant.",
      success: false,
      error: true
    }, { status: 400 });
  }

  const { valid, errors, payload } = validateOrderPayload(raw);
  if (!valid) {
    return NextResponse.json({
      message: "Données invalides",
      errors,
      success: false,
      error: true,
    }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  try {
    const order = await createOrder({ payload, user: session?.user });
    return NextResponse.json({
      message: "Commande créée avec succès.",
      success: true,
      error: false,
      data: order
    }, { status: 201 });

  } catch (err) {
    console.error("Erreur route POST /order :", err);
    if (err instanceof HttpError || (err.status && err.message)) {
      return NextResponse.json({ 
        message: err.message, 
        success: false, 
        error: true 
      }, { status: err.status || 400 });
    }
    return NextResponse.json({ 
      message: "Erreur! Veuillez réessayer.", 
      success: false, 
      error: true 
    }, { status: 500 });
  }
});

export const GET = withAuth(async (req) => {
  try {
    await dbConnection();
    const session = await getServerSession(authOptions);
    const { role, id: userId } = session?.user;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status") || "";
    const businessId = searchParams.get("businessId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Vérifier businessId
    if (!businessId) {
      return NextResponse.json({
        message: "ID de la boutique manquant.",
        success: false,
        error: true
      }, { status: 400 });
    }

    const businessObjectId = new mongoose.Types.ObjectId(businessId);

    // Filtre status
    const statuses = statusParam
      ? statusParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Construction du filtre
    const filter = {
      business: businessObjectId
    };

    // Recherche par référence
    if (search) {
      const regex = new RegExp(search, "i");
      filter.reference = { $regex: regex };
    }

    // Filtre par status
    if (statuses.length) {
      filter.status = { $in: statuses };
    }

    // Filtre par date
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.orderDate.$lte = end;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("supplier", "nom tel")
        .populate("createdBy", "nom prenom")
        .populate("items.product", "nom reference"),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        message: orders.length
          ? "Commandes récupérées avec succès."
          : "Aucune commande trouvée.",
        data: orders,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        success: true,
        error: false,
      },
      { status: 200, headers: { "Cache-Control": "no-cache" } }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Erreur! Veuillez réessayer.",
        success: false,
        error: true,
      },
      { status: 500 }
    );
  }
});