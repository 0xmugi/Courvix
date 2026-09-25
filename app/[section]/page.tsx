import Marketing from "../marketing";
import { notFound } from "next/navigation";
const pages: Record<string, string> = {
  platform: "Platform",
  "club-life": "Club Life — Inspirasi & Budaya Olahraga",
  sports: "Cabang Olahraga",
  pricing: "Harga",
  custom: "Website & Sistem Klub",
  contact: "Kontak",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: `${pages[section] || "Halaman"} — Courvix`,
    description:
      "Pengelolaan klub olahraga dan layanan website khusus dari Courvix.",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!pages[section]) notFound();
  return <Marketing page={section} />;
}
