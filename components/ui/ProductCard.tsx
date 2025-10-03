"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useCartWithToast } from "@/hooks/useCartWithToast";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: "New" | "Sale";
  isLiked?: boolean;
  colors?: Array<{ name: string; value: string }>;
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
  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartWithToast();

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.colors?.[0]?.name || "Default",
        size: "M", // Default size for quick add from product card
      });

      // Simulate brief loading for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (layout === "list") {
    return (
      <motion.div
        className={cn(
          "group flex items-center rounded-2xl bg-card border border-border/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 p-6",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
          className
        )}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        layout
      >
        <div className="relative h-24 w-24 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 rounded-xl" />
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="rounded-xl object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
          />
          <AnimatePresence>
            {product.badge && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs font-bold shadow-lg backdrop-blur-md border border-white/20",
                  product.badge === "New"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : "bg-gradient-to-r from-rose-500 to-red-500 text-white"
                )}
              >
                {product.badge}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 ml-6 space-y-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          {/* Color Options Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Colors:</span>
              <div className="flex gap-1.5">
                {product.colors.slice(0, 3).map((color, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    className="relative"
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  </motion.div>
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground ml-1 font-medium">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
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
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="default"
              size="md"
              onClick={handleAddToCart}
              isLoading={isLoading}
              className={cn(
                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                "shadow-lg hover:shadow-xl transition-all duration-300 font-semibold",
                "border border-primary/20 backdrop-blur-sm px-6"
              )}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

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

          <AnimatePresence>
            {product.badge && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className={cn(
                  "absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md border border-white/20",
                  product.badge === "New"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : "bg-gradient-to-r from-rose-500 to-red-500 text-white"
                )}
              >
                {product.badge}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.div
            className="absolute top-4 right-4 z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleLike();
              }}
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
            </Button>
          </motion.div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
            </div>
          </div>
          
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

          {/* Color Options Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Colors:</span>
              <div className="flex gap-1.5">
                {product.colors.slice(0, 4).map((color, index) => (
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
                {product.colors.length > 4 && (
                  <span className="text-xs text-muted-foreground ml-1 font-medium">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6 pt-0">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="default"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            isLoading={isLoading}
            className={cn(
              "w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
              "shadow-lg hover:shadow-xl transition-all duration-300 font-semibold",
              "border border-primary/20 backdrop-blur-sm"
            )}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
