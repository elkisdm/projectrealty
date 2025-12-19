import { z } from "zod";

// Variant Schema - Compatible con Shopify
export const VariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  inventory: z.number().int().nonnegative(),
  available: z.boolean(),
  option1: z.string().optional(), // Sabor, tamaño, etc.
  option2: z.string().optional(),
  option3: z.string().optional(),
  weight: z.number().positive().optional(),
  weightUnit: z.enum(["kg", "g", "lb", "oz"]).optional(),
});

export type Variant = z.infer<typeof VariantSchema>;

// Product Schema - Compatible con Shopify
export const ProductSchema = z.object({
  id: z.string().min(1),
  handle: z.string().min(1), // Slug del producto
  title: z.string().min(1),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  price: z.number().positive(), // Precio base (del variant más barato)
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1),
  variants: z.array(VariantSchema).min(1),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1), // ID de categoría
  categoryName: z.string().min(1), // Nombre de categoría
  vendor: z.string().optional(), // Marca
  type: z.string().optional(), // Tipo de producto
  available: z.boolean(),
  inventory: z.number().int().nonnegative(), // Stock total
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  // Metafields para información adicional
  metafields: z.record(z.any()).optional(),
  // Campos específicos de suplementos
  ingredients: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  servingSize: z.string().optional(),
  servingsPerContainer: z.number().int().positive().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// Category Schema
export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  productCount: z.number().int().nonnegative(),
  parentId: z.string().optional(), // Para subcategorías
});

export type Category = z.infer<typeof CategorySchema>;

// Cart Item Schema
export const CartItemSchema = z.object({
  id: z.string().min(1), // ID único del item en el carrito
  variantId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  product: ProductSchema,
  variant: VariantSchema,
});

export type CartItem = z.infer<typeof CartItemSchema>;

// Cart Schema
export const CartSchema = z.object({
  id: z.string().optional(), // ID del carrito en Shopify
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().optional(),
  shipping: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  currency: z.string().default("CLP"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Cart = z.infer<typeof CartSchema>;

// Search Result Schema
export const SearchResultSchema = z.object({
  products: z.array(ProductSchema),
  categories: z.array(CategorySchema),
  total: z.number().int().nonnegative(),
  query: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// Filter Options Schema
export const FilterOptionsSchema = z.object({
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  vendors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

// Sort Options
export enum SortOption {
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NAME_ASC = "name_asc",
  NAME_DESC = "name_desc",
  POPULARITY = "popularity",
  RATING = "rating",
  NEWEST = "newest",
}

export const SortOptionSchema = z.nativeEnum(SortOption);

// Bundle Schema - Packs con descuento progresivo
export const BundleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1), // "Pack 1 unidad", "Pack 3 unidades", etc.
  discount: z.number().min(0).max(100).optional(), // Porcentaje de descuento
  perks: z.array(z.string()).optional(), // ["Envío gratis", "Regalo incluido"]
  isRecommended: z.boolean().default(false),
  products: z.array(z.string()).min(1), // IDs de productos incluidos
  quantity: z.number().int().positive().default(1), // Cantidad de unidades
  price: z.number().positive().optional(), // Precio del bundle (calculado si no se proporciona)
});

export type Bundle = z.infer<typeof BundleSchema>;

// Expert Quote Schema - Citas de autoridad
export const ExpertQuoteSchema = z.object({
  id: z.string().min(1),
  image: z.string().url(),
  name: z.string().min(1),
  title: z.string().min(1), // "Nutricionista", "Entrenador certificado"
  text: z.string().min(1), // Texto corto de la cita
  credentials: z.string().optional(), // Credenciales adicionales
});

export type ExpertQuote = z.infer<typeof ExpertQuoteSchema>;

// FAQ Item Schema
export const FAQItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(["uso", "resultados", "miedos", "logistica", "certificaciones"]).optional(),
});

export type FAQItem = z.infer<typeof FAQItemSchema>;

// Education Block Schema
export const EducationBlockSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  visualSupport: z.string().url().optional(), // Imagen o video
  order: z.number().int().nonnegative().default(0), // Orden de visualización
});

export type EducationBlock = z.infer<typeof EducationBlockSchema>;

// Announcement Config Schema
export const AnnouncementConfigSchema = z.object({
  freeShippingThreshold: z.number().positive().default(50000),
  installments: z.string().optional(), // "Hasta 12 cuotas sin interés"
  showInstallments: z.boolean().default(true),
  showFreeShipping: z.boolean().default(true),
});

export type AnnouncementConfig = z.infer<typeof AnnouncementConfigSchema>;

// Benefit Schema - Para CoreBenefits
export const BenefitSchema = z.object({
  id: z.string().min(1),
  icon: z.string().optional(), // Nombre del icono (lucide-react)
  title: z.string().min(1),
  description: z.string().min(1),
});

export type Benefit = z.infer<typeof BenefitSchema>;

// Extender ProductSchema con nuevos campos opcionales
export const ExtendedProductSchema = ProductSchema.extend({
  bundles: z.array(BundleSchema).optional(),
  expertQuotes: z.array(ExpertQuoteSchema).optional(),
  faqs: z.array(FAQItemSchema).optional(),
  announcementConfig: AnnouncementConfigSchema.optional(),
  educationBlocks: z.array(EducationBlockSchema).optional(),
  coreBenefits: z.array(BenefitSchema).optional(), // Beneficios estructurados
});

export type ExtendedProduct = z.infer<typeof ExtendedProductSchema>;

