"use client";

import Header from "@/components/Header";
import InstallAppBanner from "@/components/InstallAppBanner";
import MobileNav from "@/components/MobileNav";
import { MobileNavProvider, useMobileNav } from "@/context/MobileNavContext";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { hidden } = useMobileNav();

  return (
    <div
      className={`flex min-h-full flex-col md:pb-0 ${
        hidden
          ? "pb-0"
          : "pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]"
      }`}
    >
      <Header />
      <InstallAppBanner />
      {children}
      <MobileNav />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <AppShellInner>{children}</AppShellInner>
    </MobileNavProvider>
  );
}
