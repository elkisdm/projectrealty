/**
 * Shopify REST API Client
 * 
 * Este cliente está preparado para integrarse con Shopify REST API.
 * Por ahora usa mock data, pero la estructura está lista para conectar con Shopify.
 * 
 * Configuración necesaria:
 * - SHOPIFY_STORE_DOMAIN: dominio de la tienda (ej: "mi-tienda.myshopify.com")
 * - SHOPIFY_ACCESS_TOKEN: token de acceso de la API
 * - SHOPIFY_API_VERSION: versión de la API (ej: "2024-01")
 */

import type {
  Product,
  Category,
  Cart,
  CartItem,
  Variant,
} from "@schemas/ecommerce";
// import {
//   getAllProducts,
//   getProductByHandle,
//   getProductsByCategory,
//   getAllCategories,
//   getCategoryBySlug,
// } from "@workspace/data/ecommerce.mock"; // Deshabilitado - no es parte del MVP

// Configuración (en producción, usar variables de entorno)
const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2024-01";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

// Base URL para Shopify API
const SHOPIFY_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

/**
 * Helper para hacer requests a Shopify API
 */
async function shopifyFetch(endpoint: string, options: RequestInit = {}) {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    throw new Error("Using mock data - Shopify not configured");
  }

  const url = `${SHOPIFY_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Transformar producto de Shopify a nuestro schema
 */
function transformShopifyProduct(_shopifyProduct: any): Product {
  // TODO: Implementar transformación de formato Shopify a nuestro schema
  // Por ahora, retornar mock data - Deshabilitado - no es parte del MVP
  // Retornar un objeto Product vacío para evitar errores de tipo
  return {
    id: '',
    title: '',
    handle: '',
    description: '',
    price: 1, // Debe ser positivo
    compareAtPrice: undefined,
    available: false,
    category: '',
    categoryName: '', // Campo requerido
    inventory: 0, // Campo requerido
    tags: [],
    images: ['https://placeholder.com/image.jpg'], // Debe tener al menos 1 imagen
    variants: [{
      id: '',
      title: '',
      price: 1,
      inventory: 0,
      available: false,
    }], // Debe tener al menos 1 variant
    rating: undefined,
    reviewCount: 0,
  };
}

/**
 * Obtener todos los productos
 */
export async function getProducts(options?: {
  limit?: number;
  category?: string;
}): Promise<Product[]> {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    // Deshabilitado - no es parte del MVP
    let products: Product[] = [];
    // if (options?.category) {
    //   const category = getCategoryBySlug(options.category);
    //   if (category) {
    //     products = getProductsByCategory(category.id);
    //   }
    // }
    if (options?.limit) {
      products = products.slice(0, options.limit);
    }
    return products;
  }

  try {
    const endpoint = `/products.json${options?.limit ? `?limit=${options.limit}` : ""}`;
    const data = await shopifyFetch(endpoint);
    return data.products.map(transformShopifyProduct);
  } catch (error) {
    console.error("Error fetching products from Shopify:", error);
    // Fallback a mock data - Deshabilitado - no es parte del MVP
    return [];
  }
}

/**
 * Obtener un producto por handle (slug)
 */
export async function getProduct(handle: string): Promise<Product | null> {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    // return getProductByHandle(handle) || null; // Deshabilitado - no es parte del MVP
    return null;
  }

  try {
    const endpoint = `/products.json?handle=${handle}`;
    const data = await shopifyFetch(endpoint);
    if (data.products && data.products.length > 0) {
      return transformShopifyProduct(data.products[0]);
    }
    return null;
  } catch (error) {
    console.error("Error fetching product from Shopify:", error);
    // Fallback a mock data
    // return getProductByHandle(handle) || null; // Deshabilitado - no es parte del MVP
    return null;
  }
}

/**
 * Obtener todas las colecciones (categorías)
 */
export async function getCollections(): Promise<Category[]> {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    // return getAllCategories(); // Deshabilitado - no es parte del MVP
    return [];
  }

  try {
    const endpoint = "/collections.json";
    const data = await shopifyFetch(endpoint);
    // TODO: Transformar colecciones de Shopify a nuestro schema
    // return getAllCategories(); // Deshabilitado - no es parte del MVP
    return [];
  } catch (error) {
    console.error("Error fetching collections from Shopify:", error);
    // Fallback a mock data
    // return getAllCategories(); // Deshabilitado - no es parte del MVP
    return [];
  }
}

/**
 * Crear un carrito en Shopify
 */
export async function createCart(): Promise<Cart> {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  }

  try {
    // Shopify usa el Storefront API para carritos, no REST API
    // Esto requeriría usar GraphQL o el Cart API
    // Por ahora, retornar carrito vacío
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  } catch (error) {
    console.error("Error creating cart in Shopify:", error);
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  }
}

/**
 * Agregar item al carrito de Shopify
 */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart> {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    // En producción, esto se manejaría con el store local
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  }

  try {
    // Shopify Storefront API para carritos
    // TODO: Implementar con GraphQL o Cart API
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  } catch (error) {
    console.error("Error adding to cart in Shopify:", error);
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  }
}

/**
 * Actualizar carrito en Shopify
 */
export async function updateCart(
  cartId: string,
  updates: { itemId: string; quantity: number }[]
): Promise<Cart> {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  }

  try {
    // TODO: Implementar actualización de carrito
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  } catch (error) {
    console.error("Error updating cart in Shopify:", error);
    return {
      items: [],
      subtotal: 0,
      total: 0,
      currency: "CLP",
    };
  }
}

/**
 * Obtener URL de checkout de Shopify
 */
export function getCheckoutUrl(cartId: string): string {
  if (USE_MOCK_DATA || !SHOPIFY_STORE_DOMAIN) {
    return "#";
  }

  // Shopify Checkout URL
  return `https://${SHOPIFY_STORE_DOMAIN}/cart/${cartId}`;
}

/**
 * Verificar si Shopify está configurado
 */
export function isShopifyConfigured(): boolean {
  return !USE_MOCK_DATA && !!SHOPIFY_STORE_DOMAIN && !!SHOPIFY_ACCESS_TOKEN;
}

