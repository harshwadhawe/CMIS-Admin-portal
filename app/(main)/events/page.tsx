"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { AddEventDialog } from "./page.client";
import Link from "next/link";
import { formatEventDateTime } from "@/lib/utils";

export default function EventsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const { api } = await import("@/lib/api-client");
        const response = await api.getEvents();
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
    queryKey: ["events"],
  });

  const handleDelete = (id: number | string) => {
    // TODO: Implement delete API call
    // setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Events</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage CMIS events and activities
          </p>
        </div>
        <Button
          className="gap-2 hover-lift transition-smooth bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Skeleton loading cards
          Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="flex flex-col overflow-hidden"
            >
              <CardHeader className="pb-3">
                <Skeleton className="h-7 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 mt-1" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </CardContent>
              <CardContent className="border-t pt-3 pb-4">
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          data?.map((event, index) => {
            const { formattedDate, formattedTime } = formatEventDateTime(
              event?.eventDate,
              event?.startTime,
              event?.endTime
            );
            
            return (
              <Card
                key={event.id}
                className="flex flex-col overflow-hidden hover-lift transition-smooth border-2 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl font-bold line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 mt-1 bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  </div>
                  <CardDescription className="text-sm line-clamp-3 leading-relaxed">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-3 pb-4">
                  {/* Date */}
                  {formattedDate !== 'N/A' && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Time */}
                  {formattedTime !== 'N/A' && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                          {formattedTime}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardContent className="border-t bg-gradient-to-r from-muted/40 to-muted/20 pt-3 pb-4">
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-sm hover:shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {!isLoading && data?.length === 0 && (
        <Card className="col-span-full animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-muted/30 to-transparent">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4 mb-4 animate-pulse-glow">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Get started by creating your first event to manage CMIS activities
            </p>
            <Button 
              onClick={() => setIsOpen(true)} 
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover-lift"
            >
              <Plus className="h-4 w-4" />
              Create First Event
            </Button>
          </CardContent>
        </Card>
      )}
      <AddEventDialog
        isOpen={isOpen}
        setIsOpen={(open: boolean) => {
          setIsOpen(open);
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["events"] });
          }
        }}
      />
    </div>
  );
}
