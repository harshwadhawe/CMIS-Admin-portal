"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Code,
  Lightbulb,
  Linkedin,
  Mail,
  Send,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface Mentor {
  id: number;
  name: string;
  company: string;
  position: string;
  location: string;
  expertise: string[];
  matchScore: number;
  yearsOfExperience: number;
  esId?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  year: string;
  gpa: string;
  interests: string[];
  skills: string[];
  potentialMentors: Mentor[];
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = Number(params?.id);
  // const student = mockStudentData[studentId];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [sentMentorIds, setSentMentorIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["student-mentor", studentId],
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");

        const response = await api.getMentorEmails({
          studentId: `${studentId}`,
        });
        if (!response.success) {
          throw new Error("Network response was not ok");
        }
        return response.data as any;
        // return mockStudentData[studentId];
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    },
  });
  const { data: mentorEmailData, isLoading: isMentorEmailLoading } = useQuery({
    queryKey: ["mentor-email", selectedMentor],
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");

        const response = await api.getMentorEmailsByStakeholder(
          `${selectedMentor?.esId}`
        );
        if (!response.success) {
          throw new Error("Network response was not ok");
        }
        return response.data as any;
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    },
    enabled: !!selectedMentor,
  });

  // Populate form fields when mentor email data is loaded
  useEffect(() => {
    if (mentorEmailData && !isMentorEmailLoading) {
      setEmailTo(mentorEmailData?.stakeholder?.email || "");
      setEmailSubject(mentorEmailData?.mentorEmails?.[0]?.subject || "");
      setEmailContent(mentorEmailData?.mentorEmails?.[0]?.body || "");
      // Open modal only after data is loaded
      setIsModalOpen(true);
    }
  }, [mentorEmailData, isMentorEmailLoading]);

  const handleConnectClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");
        const response = await api.updateMentorEmailByStakeholder(
          `${selectedMentor?.esId}` || "",
          {
            body: emailContent,
            subject: emailSubject,
            email: emailTo,
          }
        );
        if (!response.success) {
          throw new Error("Network response was not ok");
        }
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: async (data) => {
      if (data?.success) {
        // Mark this mentor as having received an email
        if (selectedMentor?.esId) {
          setSentMentorIds(prev => new Set(prev).add(selectedMentor.esId!));
        }
        
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["student-mentor"] });
        try {
          const { api } = await import("@/lib/api-client");

          const response = await api.triggerMentorMatching({
            esId: selectedMentor?.esId || "",
            studentId: studentId.toString(),
          });
          if (!response.success) {
            throw new Error("Network response was not ok");
          }
          return response;
        } catch (error) {
          console.log(error);
        }
        toast.success("Email sent successfully");
      }
    },
  });

  const handleSendEmail = () => {
    mutateAsync();
    // setSelectedMentor(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEmailTo("");
    setEmailSubject("");
    setEmailContent("");
    setSelectedMentor(null);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-40" />
        </div>

        {/* Student Profile Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Avatar Skeleton */}
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />

              {/* Student Info Skeleton */}
              <div className="flex-1 grid grid-cols-[auto_1fr_1fr] gap-x-12 gap-y-3 items-center">
                {/* Name and Email */}
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-5 w-56" />
                </div>

                {/* Year and GPA */}
                <div className="flex gap-8">
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>

                <div></div>

                {/* Interests */}
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>

                {/* Skills */}
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Potential Mentors Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <Card key={index} className="relative flex flex-col">
                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Match Indicator Dot Skeleton */}
                    <div className="absolute top-4 right-4">
                      <Skeleton className="h-3 w-3 rounded-full" />
                    </div>

                    {/* Mentor Header Skeleton */}
                    <div className="flex items-start gap-3 pr-16 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>

                    {/* Company Skeleton */}
                    <div className="mb-4">
                      <Skeleton className="h-5 w-40" />
                    </div>

                    {/* Expertise Skeleton */}
                    <div className="mb-4 flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-wrap gap-1.5">
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>

                    {/* Connect Button Skeleton */}
                    <Skeleton className="h-9 w-full mt-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/students">
            <Button variant="link" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Student not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getMatchDotColor = (index: number) => {
    if (index === 0) return "bg-green-500";
    if (index === 1) return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="link" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </Link>
      </div>

      {/* Student Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {getInitials(data?.student?.name)}
              </AvatarFallback>
            </Avatar>

            {/* Student Info - Horizontal Layout */}
            <div className="flex-1 grid grid-cols-[auto_1fr_1fr] gap-x-12 gap-y-3 items-center">
              {/* Name and Email - Column 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <a
                    href={data?.student?.linkedinUrl ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold hover:text-primary transition-colors cursor-pointer"
                  >
                    {data?.student?.name}
                  </a>
                  <a
                    href={data?.student?.linkedinUrl ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{data?.student?.email}</span>
                </div>
              </div>

              {/* Year and GPA - Column 2 */}
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Year</p>
                  <p className="text-sm font-medium">
                    {data?.student?.academic_level}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">GPA</p>
                  <p className="text-sm font-medium">{data?.student?.gpa}</p>
                </div>
              </div>

              {/* Empty spacer for grid alignment */}
              <div></div>

              {/* Interests - Column 1 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Interests
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data?.student?.domain_interests?.map(
                    (interest: any, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs py-0.5"
                      >
                        {interest}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {/* Skills - Column 2 & 3 */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data?.student?.skills?.map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs py-0.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Potential Mentors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Potential Mentors</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Top mentor matches based on interests, goals, and expertise
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.mentors?.map((mentor: any, index: number) => (
              <Card key={mentor.id} className="relative flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  {/* Match Indicator Dot */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`h-3 w-3 rounded-full ${getMatchDotColor(
                        index
                      )}`}
                    />
                  </div>

                  {/* Mentor Header */}
                  <div className="flex items-start gap-3 pr-16 mb-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(mentor?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {mentor?.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {mentor?.title}
                      </p>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{mentor?.organization}</span>
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="mb-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      EXPERTISE
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor?.expertise?.map((exp: any, expIndex: number) => (
                        <Badge
                          key={expIndex}
                          variant="outline"
                          className="text-sm"
                        >
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Connect Button */}
                  <Button
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => handleConnectClick(mentor)}
                    disabled={sentMentorIds.has(mentor?.esId || "")}
                  >
                    {sentMentorIds.has(mentor?.esId || "") ? "Email Sent" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Email to{" "}
              {(selectedMentor as any)?.fullName || selectedMentor?.name}
            </DialogTitle>
            <DialogDescription>
              Compose your mentorship request email
            </DialogDescription>
          </DialogHeader>

          {isMentorEmailLoading ? (
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Loading email template...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email-to" className="text-sm font-medium">
                  To
                </label>
                <Input
                  id="email-to"
                  type="email"
                  placeholder="Enter recipient email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email-subject" className="text-sm font-medium">
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

              <div className="space-y-2">
                <label htmlFor="email-content" className="text-sm font-medium">
                  Email Content
                </label>
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
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <Button onClick={handleCancel} variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSendEmail}
              className="gap-2"
              disabled={isMentorEmailLoading}
            >
              <Send className="h-4 w-4" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
