import type { Metadata } from "next";
import { Suspense } from "react";
import { FlagsAdminClient } from "./FlagsAdminClient";
import { ADMIN_FLAGS_CONSTANTS } from "./constants";

export const metadata: Metadata = {
  title: ADMIN_FLAGS_CONSTANTS.METADATA.TITLE,
  description: ADMIN_FLAGS_CONSTANTS.METADATA.DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
};

function LoadingFallback() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{ADMIN_FLAGS_CONSTANTS.LOADING.TITLE}</h1>
        <p className="text-[var(--subtext)]">{ADMIN_FLAGS_CONSTANTS.LOADING.SUBTITLE}</p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: ADMIN_FLAGS_CONSTANTS.LOADING.SKELETON_COUNT }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-2xl bg-[var(--admin-surface-2)] p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 h-6 w-1/3 rounded bg-gray-600"></div>
                <div className="h-4 w-2/3 rounded bg-gray-600"></div>
              </div>
              <div className="ml-4">
                <div className="h-6 w-11 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlagsAdminPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FlagsAdminClient />
    </Suspense>
  );
}
