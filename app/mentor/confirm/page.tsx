"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Mail, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface MentorAssignment {
  studentName: string;
  studentId: string;
  esId:string;
}

function MentorConfirmationContent() {
  const searchParams = useSearchParams();
  const [assignment, setAssignment] = useState<MentorAssignment | null>(null);

  useEffect(() => {
    const studentName = searchParams.get("student_name") || "Your Mentee";
    const studentId = searchParams.get("student_id") || "";
    const esId = searchParams.get("es_id") || "";
    setAssignment({
      studentName,
      studentId,
      esId,
    });
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["mentor-confirmation", assignment],
    queryFn: async () => {
      if (!assignment) return;
      try {
        const response = await fetch(
          `/api/n8n/custom-trigger?student_name=${encodeURIComponent(
            assignment.studentName
          )}&student_id=${encodeURIComponent(assignment.studentId)}&es_id=${encodeURIComponent(assignment.esId)}`
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error("Error triggering N8n webhook:", error);
      }
    },
  });
  console.log("N8n webhook response data:", data);

  if (isLoading || !data?.success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl border-2">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              {/* Success Icon Skeleton */}
              <div className="inline-flex items-center justify-center w-20 h-20">
                <Skeleton className="w-20 h-20 rounded-full" />
              </div>

              {/* Title Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>

              {/* Student Info Skeleton */}
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-8 w-48" />
              </div>

              {/* Button Skeleton */}
              <Skeleton className="h-11 w-40 mx-auto" />

              {/* Footer Skeleton */}
              <div className="pt-6 border-t">
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No assignment information found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-2">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Mentorship Approved
              </h1>
              <p className="text-muted-foreground text-lg">
                Below mentee has been assigned to you
              </p>
            </div>

            {/* Student Info */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {assignment.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-foreground">
                {assignment.studentName}
              </h2>
            </div>

            {/* Action Button */}
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 gap-2"
              onClick={() => window.open("https://cmis.ai", "_blank")}
            >
              <ExternalLink className="w-5 h-5" />
              Visit CMIS
            </Button>

            {/* Footer */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Thank you for being part of the CMIS mentorship program
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MentorConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card className="shadow-xl border-2">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20">
                  <Skeleton className="w-20 h-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-2/3 mx-auto" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-11 w-40 mx-auto" />
                <div className="pt-6 border-t">
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <MentorConfirmationContent />
    </Suspense>
  );
}
