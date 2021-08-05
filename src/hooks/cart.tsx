import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketPlace:products');

      setProducts(JSON.parse(response));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(p => p.id === product.id);

      if (!productExists) {
        const createProduct = { ...product, quantity: 1 };
        setProducts(p => [...p, createProduct]);
      } else {
        const updateProduct = products.map(p => {
          if (p.id === product.id) {
            const updatedProduct = { ...p, quantity: p.quantity += 1 };
            return updatedProduct;
          }
          return p;
        });

        setProducts(updateProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updateProducts = products.map(p => {
        if (id === p.id) {
          return { ...p, quantity: p.quantity + 1 };
        }
        return p;
      });

      setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProducts = products.map(p => {
        if (id === p.id && p.quantity >= 1) {
          return { ...p, quantity: p.quantity - 1 };
        }
        return p;
      });

      setProducts(decrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
