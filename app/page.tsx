"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "@mantine/form";
import { Lock, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.values.username,
          password: form.values.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Invalid username or password");
      }

      localStorage.setItem("token", data?.data?.token ?? "");
      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.message ||
        err?.error ||
        "Unable to log in. Please try again in a moment.";
      setError(message);
      toast.error("Login failed", {
        description: message,
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl hover-lift transition-smooth border-2 border-primary/20 animate-fade-in-up">
        <CardHeader className="space-y-2 text-center bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-lg shadow-md animate-pulse-glow">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">
            CMIS Admin Portal
          </CardTitle>
          <CardDescription className="text-base">
            Council for the Management of Information Systems - Texas A&M
            University
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.onSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={form.values.username}
                disabled={loading}
                key={form.key("username")}
                {...form.getInputProps("username")}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                key={form.key("password")}
                {...form.getInputProps("password")}
                placeholder="Enter your password"
                value={form.values.password}
                disabled={loading}
                className="h-10"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-maroon-500 focus:ring-maroon-500"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-maroon-500 cursor-pointer hover:text-maroon-600 font-medium"
              >
                Forgot password?
              </button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover-lift transition-all"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
