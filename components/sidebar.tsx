"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Users, Settings, LayoutDashboard, BarChart3 } from "lucide-react";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/students", icon: Users, label: "Students and Mentors" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="w-64 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border flex flex-col shadow-lg animate-slide-in-right">
      {/* Logo */}
      <div
        className="p-6 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent/10 transition-colors group"
        onClick={() => router.push("/dashboard")}
      >
        <h1 className="text-2xl font-bold text-sidebar-foreground group-hover:text-primary transition-colors">
          CMIS
        </h1>
        <p className="text-xs text-sidebar-foreground/70 mt-1 group-hover:text-sidebar-foreground/90 transition-colors">
          Admin Portal
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 relative group",
                "hover:translate-x-1",
                isActive
                  ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground rounded-r-full" />
              )}
              <Icon 
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} 
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
