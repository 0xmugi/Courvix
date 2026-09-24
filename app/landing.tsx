"use client";
import Marketing from "./marketing";
export default function Landing(_props: {
  enter: (role?: string, page?: string) => void;
  contact: () => void;
  legal: () => void;
}) {
  return <Marketing page="home" />;
}
