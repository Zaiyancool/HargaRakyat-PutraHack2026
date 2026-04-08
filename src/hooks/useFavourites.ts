import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

// Cast supabase to any to bypass strict typing for tables that may not be in schema yet
const supabase = supabaseClient as any;

interface FavouriteItem {
  id?: string;
  item_id: number;
  user_id: string;
  created_at?: string;
}

interface UseFavouritesReturn {
  favourites: Set<number>;
  isLoading: boolean;
  isFavourite: (itemId: number) => boolean;
  addFavourite: (itemId: number) => Promise<void>;
  removeFavourite: (itemId: number) => Promise<void>;
  toggleFavourite: (itemId: number) => Promise<void>;
  getFavouriteItems: () => Promise<any[]>;
}

/**
 * useFavouritesGeneric Hook Factory
 * Creates a hook for managing user favourite items with a specific source (explorer or forecast)
 * Each source has its own Supabase table to allow independent tracking
 */
const useFavouritesGeneric = (source: 'explorer' | 'forecast'): UseFavouritesReturn => {
  const { user } = useAuthContext();
  const [favourites, setFavourites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  const tableName = source === 'explorer' ? 'users_favorites_explorer' : 'users_favorites_forecast';

  // Memoize loadFavourites to prevent unnecessary re-renders and infinite loops
  const loadFavourites = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select('item_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const itemIds = new Set((data || []).map((fav: any) => fav.item_id));
      setFavourites(itemIds as Set<number>);
    } catch (error) {
      console.error(`Failed to load ${source} favourites:`, error);
      setFavourites(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, tableName]);

  // Load favourites on mount or when user changes
  useEffect(() => {
    if (!user?.id) {
      setFavourites(new Set());
      setIsLoading(false);
      return;
    }

    loadFavourites();
  }, [user?.id, loadFavourites]);

  // Memoize addFavourite to prevent infinite loops in dependency arrays
  const addFavourite = useCallback(async (itemId: number) => {
    if (!user?.id) return;

    try {
      // Optimistic update
      setFavourites((prev) => new Set([...prev, itemId]));

      const { error } = await supabase
        .from(tableName)
        .insert([{ user_id: user.id, item_id: itemId }]);

      if (error) {
        // Revert optimistic update on error
        setFavourites((prev) => {
          const updated = new Set(prev);
          updated.delete(itemId);
          return updated;
        });
        throw error;
      }
    } catch (error) {
      console.error(`Failed to add ${source} favourite:`, error);
    }
  }, [user?.id, tableName]);

  // Memoize removeFavourite to prevent infinite loops in dependency arrays
  const removeFavourite = useCallback(async (itemId: number) => {
    if (!user?.id) return;

    try {
      // Optimistic update
      setFavourites((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) {
        // Revert optimistic update on error
        setFavourites((prev) => new Set([...prev, itemId]));
        throw error;
      }
    } catch (error) {
      console.error(`Failed to remove ${source} favourite:`, error);
    }
  }, [user?.id, tableName]);

  // Memoize isFavourite to provide stable reference (declare before toggleFavourite)
  const isFavourite = useCallback((itemId: number): boolean => {
    return favourites.has(itemId);
  }, [favourites]);

  // Memoize toggleFavourite to prevent infinite loops
  const toggleFavourite = useCallback(async (itemId: number) => {
    if (isFavourite(itemId)) {
      await removeFavourite(itemId);
    } else {
      await addFavourite(itemId);
    }
  }, [addFavourite, removeFavourite, isFavourite]);

  // Memoize getFavouriteItems to prevent infinite loops in ProfilePage useEffect
  const getFavouriteItems = useCallback(async () => {
    if (!user?.id) {
      console.warn('getFavouriteItems: No user logged in');
      return [];
    }

    try {
      // First get favourite item IDs
      const { data: favData, error: favError } = await supabase
        .from(tableName)
        .select('item_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favError) {
        // More specific error handling for common issues
        if (favError.message.includes('relation') || favError.message.includes('does not exist')) {
          console.warn(`Table ${tableName} not found. Create it first.`);
        }
        throw favError;
      }

      if (!favData || favData.length === 0) return [];

      const itemIds = new Set(favData.map((fav: any) => fav.item_id));

      // Fetch items data from public JSON file to get item metadata
      try {
        const response = await fetch('/data/items.json');
        if (!response.ok) throw new Error('Failed to fetch items data');
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid content type: expected JSON');
        }
        
        const allItems = await response.json();
        
        // Verify we got an array back
        if (!Array.isArray(allItems)) {
          throw new Error('Expected items array from JSON');
        }
        
        // Filter to only include favourite items and map to expected format
        const favouriteItems = allItems
          .filter((item: any) => itemIds.has(item.c))
          .map((item: any) => ({
            item_id: item.c,
            item_name: item.n || 'Unknown',
            category: item.k || 'Unknown',
            unit: item.u || 'N/A',
            avg_price: 0,
          }));

        return favouriteItems;
      } catch (jsonError) {
        console.error('Failed to fetch items from JSON:', jsonError);
        // Fallback: return items with just the ID if JSON fetch fails
        return Array.from(itemIds).map((id) => ({
          item_id: id,
          item_name: `Item ${id}`,
          category: 'Unknown',
          unit: 'Unknown',
          avg_price: 0,
        }));
      }
    } catch (error) {
      console.error(`Failed to get ${source} favourite items:`, error);
      return [];
    }
  }, [user?.id, tableName]);

  return {
    favourites,
    isLoading,
    isFavourite,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    getFavouriteItems,
  };
};

/**
 * useFavouritesExplorer - For tracking favorites from the Price Explorer page
 */
export const useFavouritesExplorer = (): UseFavouritesReturn => {
  return useFavouritesGeneric('explorer');
};

/**
 * useFavouritesForecasts - For tracking favorites from the Price Forecast page
 */
export const useFavouritesForecasts = (): UseFavouritesReturn => {
  return useFavouritesGeneric('forecast');
};

/**
 * useFavouritesAll - Get both explorer and forecast favorites (for Profile page)
 * Returns both favorite sets and methods to manage them
 * FIXED: Now uses memoized function references to prevent infinite loops
 */
export const useFavouritesAll = () => {
  const explorer = useFavouritesExplorer();
  const forecast = useFavouritesForecasts();

  // IMPORTANT: Depend only on the memoized function references, not the entire objects
  // This prevents the infinite loop in ProfilePage useEffect
  const getFavouriteItemsBySource = useCallback(
    async (source: 'explorer' | 'forecast') => {
      return source === 'explorer' ? explorer.getFavouriteItems() : forecast.getFavouriteItems();
    },
    [explorer.getFavouriteItems, forecast.getFavouriteItems]
  );

  return {
    explorer,
    forecast,
    getFavouriteItemsBySource,
  };
};

/**
 * Deprecated: useFavourites - kept for backward compatibility  
 * Use useFavouritesExplorer or useFavouritesForecasts instead
 */
export const useFavourites = (): UseFavouritesReturn => {
  return useFavouritesGeneric('explorer');
};
