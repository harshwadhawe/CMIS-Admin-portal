"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Users, Calendar, FileText, TrendingUp } from "lucide-react";

const dashboardData = [
  { month: "Jan", events: 4, students: 12, judges: 8 },
  { month: "Feb", events: 3, students: 14, judges: 9 },
  { month: "Mar", events: 5, students: 18, judges: 11 },
  { month: "Apr", events: 6, students: 22, judges: 13 },
  { month: "May", events: 7, students: 25, judges: 15 },
  { month: "Jun", events: 8, students: 28, judges: 18 },
];

const eventTypeData = [
  { name: "Competitions", value: 45 },
  { name: "Workshops", value: 30 },
  { name: "Seminars", value: 20 },
  { name: "Networking", value: 5 },
];

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

// Animated counter component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = 0;
    const endValue = value;
    const durationMs = duration;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / durationMs, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className="animate-number-count">{count}</span>;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const kpiCards = [
    {
      title: "Total Events",
      value: 38,
      change: "+5 this month",
      icon: Calendar,
      color: "text-primary",
      bgGradient: "from-primary/10 to-primary/5",
      borderColor: "border-primary/20",
    },
    {
      title: "Active Students",
      value: 342,
      change: "+28 this month",
      icon: Users,
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 to-blue-400/5",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Judges",
      value: 84,
      change: "+6 this month",
      icon: Users,
      color: "text-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-400/5",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Pending Emails",
      value: 12,
      change: "3 urgent",
      icon: FileText,
      color: "text-amber-600",
      bgGradient: "from-amber-500/10 to-amber-400/5",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header with gradient text */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome back to <span className="font-semibold text-primary">CMIS Admin Portal</span>
        </p>
      </div>

      {/* KPI Cards with animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`hover-lift border-2 ${card.borderColor} bg-gradient-to-br ${card.bgGradient} transition-smooth animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-background/50 ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {mounted ? <AnimatedCounter value={card.value} /> : card.value}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <span className="font-medium text-emerald-600">{card.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
