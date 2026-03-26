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
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Save, Send, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedJudges, setSelectedJudges] = useState<number[]>([]);
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");
        const eventId = Array.isArray(params?.id)
          ? params.id?.[0]
          : params?.id ?? "";
        const response = await api.getEventById(eventId);
        if (response.success) {
          return response.data || [];
        } else {
          console.error("Failed to fetch events:", response.error);
          return [];
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    },
    queryKey: ["event-detail", params?.id],
  });

  const { data: judges, isLoading: isLoadingJudges } = useQuery({
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");
        const eventId = Array.isArray(params?.id) ? params.id?.[0] : params?.id;
        const response = await api.getEventJudges(eventId);
        if (response.success) {
          return response.data || [];
        } else {
          console.error("Failed to fetch events:", response.error);
          return [];
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    },
    queryKey: ["event-judges", params?.id],
  });
  const [activeJudge, setActiveJudge] = useState(judges?.[0]?.id);

  useEffect(() => {
    setActiveJudge(judges?.[0]?.id);
  }, [judges]);

  const { data: judgeEmail } = useQuery({
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");
        const eventId = Array.isArray(params?.id)
          ? params.id?.[0]
          : params?.id ?? "";
        const response = await api.getOutreachEmailsByEventAndStakeholder(
          eventId,
          activeJudge
        );
        if (response.success) {
          return response.data || [];
        } else {
          console.error("Failed to fetch events:", response.error);
          return [];
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    },
    queryKey: ["event-judge-email", params?.id, activeJudge],
    enabled: !!activeJudge,
  });

  const handleSendEmail = async () => {
    if (selectedJudges.length === 0) {
      return;
    }

    // Capture the selected judges before clearing the state
    const judgesToSend = [...selectedJudges];
    await sendEmailAsync(judgesToSend);
    setSelectedJudges([]);
  };

  const toggleJudge = (id: number) => {
    setSelectedJudges((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };
  const [emailContent, setEmailContent] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailTo, setEmailTo] = useState<string>("");
  useEffect(() => {
    if (judgeEmail && judgeEmail.length > 0 && judgeEmail[0]?.body) {
      const content = judgeEmail[0].body || "";
      setEmailContent(content);
    } else {
      setEmailContent("");
    }
    if (judgeEmail && judgeEmail.length > 0 && judgeEmail[0]?.subject) {
      const subject = judgeEmail[0].subject || "";
      setEmailSubject(subject);
    } else {
      setEmailSubject("");
    }
    if (
      judgeEmail &&
      judgeEmail.length > 0 &&
      judgeEmail?.[0]?.stakeholder?.email
    ) {
      const to = judgeEmail?.[0]?.stakeholder?.email || "";
      setEmailTo(to);
    } else {
      setEmailTo("");
    }
  }, [activeJudge, judgeEmail]);

  const handleJudgeChange = (judgeId: number) => {
    setActiveJudge(judgeId);
  };
  const handleCancel = () => {
    if (judgeEmail && judgeEmail.length > 0 && judgeEmail[0]?.body) {
      const content = judgeEmail?.[0].body || "";
      setEmailContent(content);
    }
    if (judgeEmail && judgeEmail.length > 0 && judgeEmail[0]?.subject) {
      const subject = judgeEmail?.[0].subject || "";
      setEmailSubject(subject);
    }
    if (
      judgeEmail &&
      judgeEmail.length > 0 &&
      judgeEmail?.[0]?.stakeholder?.email
    ) {
      const to = judgeEmail?.[0]?.stakeholder?.email || "";
      setEmailTo(to);
    }
  };
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");

        const response = await api.updateOutreachEmail(
          judgeEmail?.[0].outreachId,
          {
            body: emailContent,
            subject: emailSubject,
            to: emailTo,
          }
        );
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  });
  const { mutateAsync: sendEmailAsync, isPending: isEmailSendPeniing } =
    useMutation({
      mutationFn: async (judges: number[]) => {
        try {
          const { api } = await import("@/lib/api-client");
          const eventId = Array.isArray(params?.id)
            ? params?.id?.[0]
            : params?.id ?? "";
          const response = await api.triggerEmail({
            recipients: judges,
            eventId,
          });
          return response;
        } catch (error) {
          console.log(error);
        }
      },
      onSuccess: (response) => {
        if (response?.success) {
          router.push("/events");
          toast.success("Email(s) sent successfully!");
        }
      },
    });

  // Loading skeleton for event details
  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {/* Back Button Skeleton */}
        <Skeleton className="h-10 w-32" />

        {/* Event Details Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Editor Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-md mb-4" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Judges List Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={`event-detail-judge-skeleton-${i}`}
                    className="flex items-center gap-3 p-2"
                  >
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <Button variant="link" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{data?.title}</CardTitle>
          <CardDescription>{data?.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Draft Email
              </CardTitle>
              <CardDescription>
                Customize the email to send to judges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email-to" className="text-sm font-medium">
                    To
                  </label>
                  <Input
                    id="email-to"
                    type="text"
                    placeholder="Send email to"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email-subject"
                    className="text-sm font-medium"
                  >
                    Subject
                  </label>
                  <Input
                    id="email-subject"
                    type="text"
                    placeholder="Enter email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full"
                  />
                </div>
                <ReactQuill
                  value={emailContent}
                  onChange={setEmailContent}
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline", "strike"],
                      ["blockquote", "code-block"],
                      [{ header: 1 }, { header: 2 }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                  theme="snow"
                  className="bg-card text-foreground rounded-md border border-input"
                  style={{ height: "300px", marginBottom: "40px" }}
                />
              </div>
              <br />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    mutateAsync();
                  }}
                  disabled={isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isPending ? "Updating..." : "Update"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isPending}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Judges List */}
        <Card>
          <CardHeader>
            <CardTitle>Potential Judges</CardTitle>
            <CardDescription>{selectedJudges.length} selected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingJudges ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={`judges-list-skeleton-${i}`}
                    className="flex items-center gap-3 p-2"
                  >
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {judges?.map((judge) => (
                  <div
                    key={judge.id}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer ${
                      activeJudge === judge.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedJudges.includes(judge.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleJudge(judge.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="w-4 h-4 cursor-pointer"
                      aria-label={`Select ${judge.fullName}`}
                    />
                    <button
                      type="button"
                      className={`flex-1 min-w-0 text-left bg-transparent border-none p-0`}
                      onClick={() => {
                        handleJudgeChange(judge?.id);
                      }}
                      // disabled={isEditing}
                      aria-label={`View email for ${judge.fullName}`}
                    >
                      <p className="text-sm font-medium truncate cursor-pointer">
                        {judge.fullName}
                      </p>
                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={`${judge.title} at ${judge.organization}`}
                      >
                        {judge.title} at {judge.organization}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleSendEmail}
              disabled={selectedJudges.length === 0 || isEmailSendPeniing}
              className="w-full gap-2 mt-4"
            >
              <Send className="h-4 w-4" />
              {isEmailSendPeniing ? "Sending..." : "Send Email"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
