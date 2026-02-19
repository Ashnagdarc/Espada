import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function createUniqueSlug(name: string) {
  const base = slugify(name) || `product-${Date.now()}`;
  let slug = base;
  let count = 0;

  while (await prisma.product.findUnique({ where: { slug } })) {
    count += 1;
    slug = `${base}-${count}`;
  }

  return slug;
}

// GET /api/admin/products - Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformedProducts = products.map((product) => ({
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
      published: product.published || false,
      publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ["name", "description", "price", "category"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (body.stock !== undefined && (typeof body.stock !== "number" || body.stock < 0)) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    const image = Array.isArray(body.images) ? body.images[0] : body.image;
    const slug = await createUniqueSlug(body.name);

    // Attempt to create product, but be defensive if DB schema doesn't include published fields yet
    let product;
    const createData: any = {
      name: body.name,
      slug,
      description: body.description,
      price: body.price,
      category: body.category,
      stock: body.stock || 0,
      featured: body.featured || false,
      image: image || null,
    };
    if (body.published !== undefined) {
      createData.published = body.published || false;
      createData.publishedAt = body.published ? new Date() : null;
    }

    try {
      product = await prisma.product.create({ data: createData });
    } catch (err) {
      console.warn('Create product with published fields failed, retrying without published:', err);
      // Retry without published fields
      delete createData.published;
      delete createData.publishedAt;
      product = await prisma.product.create({ data: createData });
    }

    return NextResponse.json(
      {
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
          published: product.published || false,
          publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
