"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import LoginScreen from "@/components/ui/LoginScreen";

const ChurchWorld = dynamic(() => import("@/components/ChurchWorld"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-dvw items-center justify-center bg-stone-900 text-amber-100">
      Loading sanctuary...
    </div>
  ),
});

export default function Home() {
  const hasEntered = useAppStore((s) => s.hasEntered);
  return hasEntered ? <ChurchWorld /> : <LoginScreen />;
}
