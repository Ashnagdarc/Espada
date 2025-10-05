"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Heart } from "lucide-react";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface HomepageImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface CollectionItem {
  id: string;
  product_id: string;
  display_order: number;
  products: Product;
}

interface HomepageSection {
  id: string;
  content: any;
  status: string;
  images: HomepageImage[];
  collection_items: CollectionItem[];
  created_at: string;
  updated_at: string;
}

interface HomepageData {
  hero: HomepageSection | null;
  new_this_week: HomepageSection | null;
  xiv_collections: HomepageSection | null;
  approach: HomepageSection | null;
}

export default function HomePage() {
  const t = useTranslations();
  const { user, profile, isLoading, handleRoleBasedRedirect } =
    useAuth();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("HomePage mounted");
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/homepage');
      const result = await response.json();

      if (result.success) {
        setHomepageData(result.data);
      } else {
        setError('Failed to load homepage data');
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setError('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchHomepageData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Note: Admin redirect logic removed to prevent conflicts with admin login flow
  // Admin users should be redirected through the proper login flow

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Grain Texture Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <Image
          src="/images/mg0ujxhg-g1wcp10.png"
          alt="Grain texture"
          width={1299}
          height={832}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-8">
              {/* Categories */}
              <nav className="space-y-2">
                <Link
                  href="/sudo"
                  className="block text-callout font-medium text-label-primary hover:text-primary transition-colors duration-200 focus-ring-inset rounded-md px-3 py-2"
                >
                  Sudo
                </Link>
                <Link
                  href="/xvii"
                  className="block text-callout font-medium text-label-primary hover:text-primary transition-colors duration-200 focus-ring-inset rounded-md px-3 py-2"
                >
                  XVII
                </Link>
                <Link
                  href="/teyo"
                  className="block text-callout font-medium text-label-primary hover:text-primary transition-colors duration-200 focus-ring-inset rounded-md px-3 py-2"
                >
                  Teyo
                </Link>
              </nav>

              {/* Hero Title */}
              <div className="space-y-4">
                <h1 className="text-large-title font-bold text-label-primary tracking-tight leading-tight uppercase">
                  {homepageData?.hero?.content?.title || t.home.hero.title}
                </h1>
                <p className="text-callout text-label-secondary">
                  {homepageData?.hero?.content?.subtitle || t.home.hero.subtitle}
                </p>
              </div>

              {/* CTA Button */}
              <Link href="/products">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  Shop Collections
                </Button>
              </Link>
            </div>

            {/* Right Content - Hero Images */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="card-apple overflow-hidden">
                  <Image
                    src={homepageData?.hero?.images?.[0]?.image_url || "/images/mg0ujxhg-rt8uqe1.png"}
                    alt={homepageData?.hero?.images?.[0]?.alt_text || "Collection item"}
                    width={366}
                    height={376}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="card-apple overflow-hidden">
                  <Image
                    src={homepageData?.hero?.images?.[1]?.image_url || "/images/mg0ujxhg-glpb31v.png"}
                    alt={homepageData?.hero?.images?.[1]?.alt_text || "Collection item"}
                    width={366}
                    height={376}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New This Week Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <h2 className="text-large-title font-bold text-label-primary tracking-tight leading-tight uppercase mb-4 sm:mb-0">
              {homepageData?.new_this_week?.content?.title || t.home.newThisWeek}
            </h2>
            <p className="text-title-3 font-bold text-primary uppercase">
              ({homepageData?.new_this_week?.collection_items?.length || 0})
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {(homepageData?.new_this_week?.collection_items || [
              {
                id: "1",
                product_id: "1",
                display_order: 1,
                products: {
                  id: "1",
                  name: "Oversized Vintage T-Shirt",
                  price: 99,
                  images: ["/images/mg0ujxh9-0dku27x.png"],
                  category: "T-Shirts"
                }
              },
              {
                id: "2",
                product_id: "2",
                display_order: 2,
                products: {
                  id: "2",
                  name: "Oversized Vintage T-Shirt",
                  price: 99,
                  images: ["/images/mg0ujxh9-a5mq5qt.png"],
                  category: "T-Shirts"
                }
              },
              {
                id: "3",
                product_id: "3",
                display_order: 3,
                products: {
                  id: "3",
                  name: "Oversized Vintage T-Shirt",
                  price: 99,
                  images: ["/images/mg0ujxh9-l0v596f.png"],
                  category: "T-Shirts"
                }
              }
            ]).map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.products.id}`}
                className="group block"
              >
                <div className="relative card-apple overflow-hidden mb-4">
                  <Image
                    src={item.products.images?.[0] || "/images/placeholder.png"}
                    alt={item.products.name}
                    width={305}
                    height={313}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    className="absolute top-3 right-3 w-11 h-11 bg-fill-quaternary/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-fill-tertiary transition-all duration-200 focus-ring"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="w-5 h-5 text-label-secondary hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-caption-1 font-medium text-label-tertiary">
                    {item.products.name}
                  </h3>
                  <p className="text-callout font-medium text-label-primary">
                    $ {item.products.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* XIV Collections Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <h2 className="text-large-title font-bold text-label-primary tracking-tight leading-tight uppercase mb-4 sm:mb-0">
              {homepageData?.xiv_collections?.content?.title || t.home.xivCollections}
            </h2>
            <p className="text-title-3 font-bold text-primary uppercase">
              ({homepageData?.xiv_collections?.collection_items?.length || 50})
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {(homepageData?.xiv_collections?.collection_items || [
              {
                id: "1",
                product_id: "1",
                display_order: 1,
                products: {
                  id: "1",
                  name: "Oversized Vintage T-Shirt",
                  price: 99,
                  images: ["/images/mg0ujxh9-0dku27x.png"],
                  category: "T-Shirts"
                }
              },
              {
                id: "2",
                product_id: "2",
                display_order: 2,
                products: {
                  id: "2",
                  name: "Oversized Vintage T-Shirt",
                  price: 99,
                  images: ["/images/mg0ujxh9-a5mq5qt.png"],
                  category: "T-Shirts"
                }
              },
              {
                id: "3",
                product_id: "3",
                display_order: 3,
                products: {
                  id: "3",
                  name: "Oversized Vintage T-Shirt",
                  price: 99,
                  images: ["/images/mg0ujxh9-l0v596f.png"],
                  category: "T-Shirts"
                }
              }
            ]).map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.products.id}`}
                className="group block"
              >
                <div className="relative card-apple overflow-hidden mb-4">
                  <Image
                    src={item.products.images?.[0] || "/images/placeholder.png"}
                    alt={item.products.name}
                    width={305}
                    height={313}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    className="absolute top-3 right-3 w-11 h-11 bg-fill-quaternary/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-fill-tertiary transition-all duration-200 focus-ring"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="w-5 h-5 text-label-secondary hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-caption-1 font-medium text-label-tertiary">
                    {item.products.name}
                  </h3>
                  <p className="text-callout font-medium text-label-primary">
                    $ {item.products.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Our Approach Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-large-title font-bold text-label-primary tracking-tight leading-tight uppercase mb-12">
            {homepageData?.approach?.content?.title || "Our Approach"}
          </h2>

          {/* Approach Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {(homepageData?.approach?.images || [
              { image_url: "/images/mg0ujxhg-rt8uqe1.png", alt_text: "Sustainable Materials" },
              { image_url: "/images/mg0ujxhg-glpb31v.png", alt_text: "Quality Craftsmanship" },
              { image_url: "/images/mg0ujxhg-rt8uqe1.png", alt_text: "Innovative Design" }
            ]).map((image, index) => (
              <div key={index} className="card-apple overflow-hidden">
                <Image
                  src={image.image_url}
                  alt={image.alt_text}
                  width={366}
                  height={376}
                  className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Approach Text */}
          <div className="max-w-4xl space-y-6">
            <p className="text-body text-label-primary leading-relaxed">
              {homepageData?.approach?.content?.description || "We believe in creating timeless pieces that transcend seasonal trends. Our approach to fashion is rooted in sustainability, quality craftsmanship, and innovative design. Each piece in our collection is carefully curated to ensure it meets our high standards for both style and durability."}
            </p>
            {homepageData?.approach?.content?.additional_text && (
              <p className="text-body text-label-primary leading-relaxed">
                {homepageData.approach.content.additional_text}
              </p>
            )}
            {!homepageData?.approach?.content?.additional_text && (
              <p className="text-body text-label-primary leading-relaxed">
                From the initial concept to the final product, we work closely
                with skilled artisans and use only the finest materials. Our
                commitment to ethical production practices ensures that every
                garment is made with respect for both the environment and the
                people who create them.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Information */}
            <div>
              <h3 className="text-headline font-semibold text-white mb-6 uppercase">
                Information
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/size-guide"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-headline font-semibold text-white mb-6 uppercase">
                Languages
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    English
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Français
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Español
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Deutsch
                  </a>
                </li>
              </ul>
            </div>

            {/* Technologies */}
            <div>
              <h3 className="text-headline font-semibold text-white mb-6 uppercase">
                Technologies
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Sustainable Fabrics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Eco-Friendly Dyes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Recycled Materials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-callout text-label-tertiary hover:text-white transition-colors focus-ring"
                  >
                    Zero Waste
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-headline font-semibold text-white mb-6 uppercase">
                Newsletter
              </h3>
              <p className="text-callout text-label-tertiary mb-6">
                Subscribe to get updates on new collections and exclusive
                offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-transparent border border-separator text-white placeholder-label-tertiary text-callout focus:outline-none focus:border-white transition-colors rounded-lg focus-ring"
                />
                <Button
                  variant="default"
                  size="default"
                  className="whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-separator pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <p className="text-footnote text-label-tertiary">
                © 2024 Espada. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-8">
              <a
                href="#"
                className="text-footnote text-label-tertiary hover:text-white transition-colors focus-ring"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-footnote text-label-tertiary hover:text-white transition-colors focus-ring"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
