"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AppleButton from "../apple/AppleButton";
import { useCartWithToast } from "@/hooks/useCartWithToast";
import { useWishlist } from "@/hooks/useWishlist";

interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: "New" | "Sale";
  isLiked?: boolean;
  colors?: Array<{ name: string; value: string }> | string[];
}

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  className?: string;
}

export default function ProductCard({
  product,
  layout = "grid",
  className,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartWithToast();
  const {
    toggleWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const isLiked = isInWishlist(String(product.id));

  // Helper function to normalize colors
  const normalizeColors = (
    colors?: Array<{ name: string; value: string }> | string[]
  ) => {
    if (!colors || colors.length === 0) return [];
    if (typeof colors[0] === "string") {
      return (colors as string[]).map((color) => ({
        name: color,
        value: getColorValue(color),
      }));
    }
    return colors as Array<{ name: string; value: string }>;
  };

  // Helper function to get color value from color name
  const getColorValue = (colorName: string) => {
    const colorMap: Record<string, string> = {
      // Basic colors
      Black: "#000000",
      White: "#FFFFFF",
      Gray: "#808080",
      Grey: "#808080",

      // Earth tones
      Brown: "#8B4513",
      Tan: "#D2B48C",
      Beige: "#F5F5DC",
      Khaki: "#F0E68C",
      Olive: "#808000",
      Sand: "#C2B280",
      Cream: "#FFFDD0",
      Ivory: "#FFFFF0",

      // Blues
      Blue: "#0066CC",
      Navy: "#000080",
      "Royal Blue": "#4169E1",
      "Sky Blue": "#87CEEB",
      Teal: "#008080",
      Turquoise: "#40E0D0",
      Cyan: "#00FFFF",
      "Steel Blue": "#4682B4",
      "Powder Blue": "#B0E0E6",

      // Reds
      Red: "#DC2626",
      Crimson: "#DC143C",
      Burgundy: "#800020",
      Maroon: "#800000",
      Cherry: "#DE3163",
      Rose: "#FF007F",
      Coral: "#FF7F50",
      Salmon: "#FA8072",

      // Greens
      Green: "#16A34A",
      "Forest Green": "#228B22",
      Lime: "#32CD32",
      Mint: "#98FB98",
      Sage: "#9CAF88",
      Emerald: "#50C878",
      Jade: "#00A86B",
      Pine: "#01796F",

      // Purples
      Purple: "#7C3AED",
      Violet: "#8A2BE2",
      Lavender: "#E6E6FA",
      Plum: "#DDA0DD",
      Indigo: "#4B0082",
      Magenta: "#FF00FF",
      Orchid: "#DA70D6",

      // Yellows/Oranges
      Yellow: "#EAB308",
      Gold: "#FFD700",
      Orange: "#EA580C",
      Amber: "#FFBF00",
      Peach: "#FFCBA4",
      Apricot: "#FBCEB1",
      Mustard: "#FFDB58",
      Honey: "#FFC30B",

      // Pinks
      Pink: "#EC4899",
      "Hot Pink": "#FF69B4",
      Blush: "#DE5D83",
      Fuchsia: "#FF00FF",
      Mauve: "#E0B0FF",
      "Dusty Rose": "#DCAE96",

      // Neutrals
      Charcoal: "#36454F",
      Slate: "#708090",
      Silver: "#C0C0C0",
      Platinum: "#E5E4E2",
      Pearl: "#F8F6F0",
      Ash: "#B2BEB5",
      Stone: "#928E85",
      Taupe: "#483C32",

      // Modern colors
      "Mint Green": "#00FF7F",
      "Electric Blue": "#7DF9FF",
      "Neon Pink": "#FF6EC7",
      "Lime Green": "#32CD32",
      "Sunset Orange": "#FF8C69",
      "Deep Purple": "#663399",
      Forest: "#355E3B",
      Ocean: "#006994",
    };
    return colorMap[colorName] || "#808080";
  };

  const normalizedColors = normalizeColors(product.colors);

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: normalizedColors?.[0]?.name || "Default",
        size: "M",
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    await toggleWishlist(String(product.id));
  };

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-border/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        className
      )}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      layout
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />

          {/* Wishlist Button */}
          <motion.div
            className="absolute top-4 right-4 z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AppleButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleLike();
              }}
              disabled={wishlistLoading}
              className={cn(
                "h-12 w-12 rounded-full backdrop-blur-md border border-white/20 dark:border-gray-600/50 shadow-lg transition-all duration-300",
                isLiked
                  ? "bg-red-500/90 hover:bg-red-500 text-white"
                  : "bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
              )}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isLiked ? "fill-current" : ""
                  )}
                />
              </motion.div>
            </AppleButton>
          </motion.div>
        </div>

        <div className="p-6 space-y-4">
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Color Options Preview */}
          {normalizedColors && normalizedColors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Colors:
              </span>
              <div className="flex gap-1.5">
                {normalizedColors.slice(0, 4).map((color, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    className="relative"
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  </motion.div>
                ))}
                {normalizedColors.length > 4 && (
                  <span className="text-xs text-muted-foreground ml-1 font-medium">
                    +{normalizedColors.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-6 pt-0">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <AppleButton
            variant="primary"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            loading={isLoading}
            fullWidth={true}
            leftIcon={<ShoppingBag className="h-5 w-5" />}
            className={cn(
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
              "shadow-lg hover:shadow-xl transition-all duration-300 font-semibold",
              "border border-primary/20 backdrop-blur-sm"
            )}
          >
            Add to Cart
          </AppleButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
