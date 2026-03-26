"use client";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/top-header";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("token");
    if (!auth) {
      router.push("/");
    } else {
      try {
        if (auth) {
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
