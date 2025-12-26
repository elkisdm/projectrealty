import { redirect } from "next/navigation";

export const revalidate = 3600;

export default async function LegacyPropertyPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = await params;
  redirect(`/property/${id}`);
}
