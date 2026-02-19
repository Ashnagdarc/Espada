'use client';

import { useRouter } from 'next/navigation';
import { Heart, Package } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function CustomerWishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { wishlistItems, loading } = useWishlist();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your wishlist.</p>
      </Card>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your Wishlist is Empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Save items you love to your wishlist and shop them later.
        </p>
        <Button
          onClick={() => router.push('/products')}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          Browse Products
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {wishlistItems.map((item) => (
        <Card key={item.id} className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {item.product?.image ? (
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {item.product?.name || 'Unavailable product'}
            </h4>
            {item.product?.price != null && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                NGN {item.product.price.toFixed(2)}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(item.product ? `/products/${item.product.id}` : '/products')}
          >
            View
          </Button>
        </Card>
      ))}
    </div>
  );
}
