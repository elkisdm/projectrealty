import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle, getAllCategories, getReviewsByProductId } from "@workspace/data/ecommerce.mock";
import type { ExtendedProduct } from "@schemas/ecommerce";
import { AnnouncementBar } from "@components/product/AnnouncementBar";
import { ProductHero } from "@components/product/ProductHero";
import { PurchaseOptions } from "@components/product/PurchaseOptions";
import { CoreBenefits } from "@components/product/CoreBenefits";
import { SocialProof } from "@components/product/SocialProof";
import { AuthorityValidation } from "@components/product/AuthorityValidation";
import { BundlesPrimary } from "@components/product/BundlesPrimary";
import { EducationBlocks } from "@components/product/EducationBlocks";
import { BundlesSecondary } from "@components/product/BundlesSecondary";
import { ReviewsExtended } from "@components/product/ReviewsExtended";
import { ProductFAQ } from "@components/product/ProductFAQ";
import { ProductStickyCTA } from "@components/product/ProductStickyCTA";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductByHandle(slug) as ExtendedProduct | undefined;

  if (!product) {
    notFound();
  }

  // Obtener la categoría del producto para el breadcrumb
  const category = getAllCategories().find((c) => c.id === product.category);
  const categorySlug = category?.slug || product.categoryName.toLowerCase().replace(/\s+/g, "-");

  // Datos para componentes (con valores por defecto si no existen)
  const announcementConfig = product.announcementConfig || {
    freeShippingThreshold: 50000,
    installments: "Hasta 12 cuotas sin interés",
    showInstallments: true,
    showFreeShipping: true,
  };

  const bundles = product.bundles || [];
  const expertQuotes = product.expertQuotes || [];
  const faqs = product.faqs || [];
  const educationBlocks = product.educationBlocks || [];
  const coreBenefits = product.coreBenefits || [];

  // Helper para obtener bundles relacionados (mismo producto pero diferentes packs)
  const relatedBundles = bundles.filter((b) => b.id !== bundles[0]?.id);

  return (
    <>
      {/* AnnouncementBar */}
      {announcementConfig.showFreeShipping || announcementConfig.showInstallments ? (
        <AnnouncementBar
          freeShippingThreshold={announcementConfig.freeShippingThreshold}
          installments={announcementConfig.installments}
        />
      ) : null}

      <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
          <nav className="text-sm text-subtext mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
          <Link href="/" className="hover:text-[#8B6CFF] transition-colors">
            Inicio
          </Link>
              </li>
              <li aria-hidden="true">
          <span className="mx-2">/</span>
              </li>
              <li>
          <Link
            href={`/category/${categorySlug}`}
            className="hover:text-[#8B6CFF] transition-colors"
          >
            {product.categoryName}
          </Link>
              </li>
              <li aria-hidden="true">
          <span className="mx-2">/</span>
              </li>
              <li className="text-text" aria-current="page">
                {product.title}
              </li>
            </ol>
        </nav>

          {/* ProductHero - Above the fold */}
          <ProductHero product={product} />

          {/* PurchaseOptions */}
          {bundles.length > 0 && (
            <PurchaseOptions product={product} bundles={bundles} />
          )}

          {/* CoreBenefits */}
          {coreBenefits.length > 0 && <CoreBenefits benefits={coreBenefits} />}

          {/* SocialProof */}
          {product.rating && product.reviewCount ? (
            <SocialProof
              averageRating={product.rating || 0}
              totalReviews={product.reviewCount || 0}
              reviews={getReviewsByProductId(product.id)}
            />
          ) : null}

          {/* AuthorityValidation */}
          {expertQuotes.length > 0 && (
            <AuthorityValidation expertQuotes={expertQuotes} />
          )}

          {/* BundlesPrimary - Aparece SOLO después de AuthorityValidation */}
          {bundles.length > 0 && (
            <BundlesPrimary product={product} bundles={bundles} />
          )}

          {/* EducationBlocks */}
          {educationBlocks.length > 0 && (
            <EducationBlocks educationBlocks={educationBlocks} />
          )}

          {/* BundlesSecondary - Cross sell */}
          {relatedBundles.length > 0 && (
            <BundlesSecondary product={product} relatedBundles={relatedBundles} />
          )}

          {/* ReviewsExtended - Confirmación final */}
          <ReviewsExtended product={product} />

          {/* FAQs - Reducción de objeciones */}
          {faqs.length > 0 && <ProductFAQ faqs={faqs} />}
        </div>
      </div>

      {/* RepeatedCTA - Sticky */}
      <ProductStickyCTA product={product} />
    </>
  );
}
