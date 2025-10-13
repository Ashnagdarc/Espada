import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToastActions } from '@/hooks/useToast';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

export function useWishlist() {
  const { user, session } = useAuth();
  const { success, error, info } = useToastActions();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's wishlist
  const fetchWishlist = async () => {
    if (!user || !session) return;

    try {
      setLoading(true);
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string) => {
    if (!user || !session) {
      error('Authentication Required', 'Please log in to add items to your wishlist');
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', 'Added to wishlist!');
        await fetchWishlist(); // Refresh wishlist
        return true;
      } else if (response.status === 409) {
        info('Already Added', 'Item already in wishlist');
        return false;
      } else {
        error('Add Failed', data.error || 'Failed to add to wishlist');
        return false;
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      error('Add Failed', 'Failed to add to wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    if (!user || !session) {
      error('Authentication Required', 'Please log in to manage your wishlist');
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        success('Success', 'Removed from wishlist');
        await fetchWishlist(); // Refresh wishlist
        return true;
      } else {
        const data = await response.json();
        error('Remove Failed', data.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      error('Remove Failed', 'Failed to remove from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist status
  const toggleWishlist = async (productId: string) => {
    const isInWishlist = wishlistItems.some(item => item.product_id === productId);
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  // Fetch wishlist when user changes
  useEffect(() => {
    if (user && session) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, session]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    fetchWishlist,
  };
}