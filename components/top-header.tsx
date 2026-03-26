"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const welcomeMessages = [
  "Welcome back!",
  "Good to see you!",
  "Hello there!",
  "Ready to get started?",
  "Let's make it happen!",
];

export function TopHeader() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get username from auth
  React.useEffect(() => {
    const auth = localStorage.getItem("token");
    if (auth) {
      setUsername("Admin");
    }
    // TODO: Update page routing logic here when user is authenticated and try to access /
    // TODO: Username logic here when user is authenticated
  }, []);

  // Rotate welcome messages
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % welcomeMessages.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {    
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <header className="border-b border-border bg-gradient-to-r from-card via-card to-muted/30 px-8 py-4 flex items-center justify-between shadow-sm animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative h-6 overflow-hidden">
          <h2 
            className={`text-lg font-semibold text-foreground transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {welcomeMessages[currentMessageIndex]}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover-lift transition-smooth hover:bg-primary/10"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-semibold shadow-md transition-transform hover:scale-110">
                {username.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{username || "Admin"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 animate-fade-in">
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
