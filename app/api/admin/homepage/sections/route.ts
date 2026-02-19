import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface HomepageImageInput {
  id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
}

interface CollectionItemInput {
  id?: string;
  product_id?: string;
  display_order: number;
  title?: string;
  products?: {
    name?: string;
  };
}

function safeParseContent(content?: string | null): Record<string, unknown> {
  if (!content) return {};
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function formatTitle(sectionType: string) {
  return sectionType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { position: "asc" },
      include: {
        images: true,
        collectionItems: true
      }
    });

    const productIds = sections
      .flatMap((section) => section.collectionItems)
      .map((item) => item.productId)
      .filter((id): id is string => Boolean(id));

    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true, image: true }
        })
      : [];

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const transformedSections = sections.reduce((acc, section) => {
      const sortedImages = section.images
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((image) => ({
          id: image.id,
          image_url: image.url,
          alt_text: image.caption || "",
          display_order: image.position
        }));

      const sortedCollectionItems = section.collectionItems
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((item) => {
          const product = item.productId
            ? productMap.get(item.productId)
            : undefined;

          return {
            id: item.id,
            product_id: item.productId || "",
            display_order: item.position,
            products: product
              ? {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  images: product.image ? [product.image] : []
                }
              : null
          };
        });

      acc[section.type] = {
        id: section.id,
        content: safeParseContent(section.content),
        status: "published",
        scheduled_publish_at: null,
        images: sortedImages,
        collection_items: sortedCollectionItems,
        created_at: section.createdAt.toISOString(),
        updated_at: section.updatedAt.toISOString()
      };

      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      sections: transformedSections
    });
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage sections" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_type, content, images, collection_items } = body;

    if (!section_type || !content) {
      return NextResponse.json(
        { error: "section_type and content are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.homepageSection.findFirst({
      where: { type: section_type }
    });

    const section = existing
      ? await prisma.homepageSection.update({
          where: { id: existing.id },
          data: {
            content: JSON.stringify(content),
            updatedAt: new Date()
          }
        })
      : await prisma.homepageSection.create({
          data: {
            type: section_type,
            title: formatTitle(section_type),
            position: 0,
            content: JSON.stringify(content)
          }
        });

    await prisma.homepageImage.deleteMany({
      where: { sectionId: section.id }
    });

    if (Array.isArray(images) && images.length > 0) {
      await prisma.homepageImage.createMany({
        data: images.map((img: HomepageImageInput) => ({
          sectionId: section.id,
          url: img.image_url,
          caption: img.alt_text || null,
          position: img.display_order ?? 0
        }))
      });
    }

    await prisma.collectionItem.deleteMany({
      where: { sectionId: section.id }
    });

    if (Array.isArray(collection_items) && collection_items.length > 0) {
      await prisma.collectionItem.createMany({
        data: collection_items.map((item: CollectionItemInput) => ({
          sectionId: section.id,
          productId: item.product_id || null,
          title: item.title || item.products?.name || "Collection Item",
          position: item.display_order ?? 0
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating homepage section:", error);
    return NextResponse.json(
      { error: "Failed to update homepage section" },
      { status: 500 }
    );
  }
}
