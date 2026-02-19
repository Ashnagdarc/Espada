import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void request;
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category || "General",
        sizes: [],
        colors: [],
        images: product.image ? [product.image] : [],
        stock: product.stock,
        featured: product.featured,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (body.price !== undefined) {
      if (typeof body.price !== "number" || body.price <= 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        );
      }
    }

    if (body.stock !== undefined) {
      if (typeof body.stock !== "number" || body.stock < 0) {
        return NextResponse.json(
          { error: "Stock must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    const image = Array.isArray(body.images) ? body.images[0] : body.image;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        stock: body.stock,
        featured: body.featured,
        image: image === undefined ? undefined : image
      }
    });

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category || "General",
        sizes: [],
        colors: [],
        images: product.image ? [product.image] : [],
        stock: product.stock,
        featured: product.featured,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void request;
  const { id } = await params;
  try {
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
