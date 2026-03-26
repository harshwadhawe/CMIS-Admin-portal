"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Building2, Eye, Search, User } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");
        const response = await api.getStudents();
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

  const filteredStudents = data?.filter(
    (student: any) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Students
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            View and manage student profiles
          </p>
        </div>
        {/* <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Matches
        </Button> */}
      </div>

      {/* Search */}
      <div
        className="relative animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Students & Mentors Table */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 border-b-2 border-primary/20">
                <TableHead className="w-[300px] font-bold text-foreground">
                  Name
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  Email
                </TableHead>
                <TableHead className="w-[150px] font-bold text-foreground">
                  Academic Year
                </TableHead>
                <TableHead className="w-[100px] text-center font-bold text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-56" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Skeleton className="h-8 w-16 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredStudents?.length > 0 ? (
                filteredStudents?.map((student: any, index: number) => (
                  <TableRow
                    key={student.id}
                    className="h-12 transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:shadow-sm cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Name */}
                    <TableCell className="py-3">
                      <div className="font-medium text-foreground">
                        {student.name}
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-3">
                      <div className="text-sm text-muted-foreground">
                        {student.email}
                      </div>
                    </TableCell>

                    {/* Academic Year */}
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-1 border-primary/30 text-primary bg-primary/5"
                      >
                        {student.academicLevel || student.year || 'N/A'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center py-3">
                      <Link href={`/students/${student?.studentId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary hover:to-primary/90 hover:text-primary-foreground border-primary/30 transition-all hover-lift"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground animate-fade-in">
                      <User className="h-8 w-8 opacity-40" />
                      <p>No students found matching your search</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
