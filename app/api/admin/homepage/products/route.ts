import { NextRequest, NextResponse } from "next/server";
import { Prisma, type Product } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const featured = searchParams.get("featured");

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 20 : limit;
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true";
    }

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ["category"]
      })
    ]);

    const transformedProducts = (products as Product[]).map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock_quantity: product.stock,
      image: product.image || null,
      images: product.image ? [product.image] : [],
      featured: product.featured,
      created_at: product.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      },
      filters: {
        categories: (categories as Array<{ category: string | null }>)
          .map((item) => item.category)
          .filter((value): value is string => Boolean(value))
      }
    });
  } catch (error) {
    console.error("Error fetching homepage products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
