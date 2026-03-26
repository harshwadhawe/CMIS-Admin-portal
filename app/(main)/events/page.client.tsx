"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

// Types
interface AddEventDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface EventFormValues {
  title: string;
  description: string;
  file: null;
  eventDate: Date | null;
  locationType: string;
  startTime: string;
  endTime: string;
}

const LOCATION_TYPES = [
  { value: "In-person", label: "In-Person" },
  { value: "Virtual", label: "Virtual" },
  { value: "Hybrid", label: "Hybrid" },
] as const;

const INITIAL_FORM_VALUES: EventFormValues = {
  title: "",
  description: "",
  file: null,
  eventDate: null,
  locationType: "In-person",
  startTime: "",
  endTime: "",
};

export function AddEventDialog({
  isOpen,
  setIsOpen,
}: Readonly<AddEventDialogProps>) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<EventFormValues>({
    initialValues: INITIAL_FORM_VALUES,
    validate: {
      title: (value) => (!value.trim() ? "Event title is required" : null),
      eventDate: (value) => (!value ? "Event date is required" : null),
    },
  });
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const { api } = await import("@/lib/api-client");

      const response = await api.createEvent({
        title: form.values.title.trim(),
        description: form.values.description.trim(),
        pdfFile: selectedFile ?? undefined,
        eventDate: form.values.eventDate
          ? format(form.values.eventDate, "yyyy-MM-dd")
          : undefined,
        locationType: form.values.locationType || undefined,
        startTime: form.values.startTime || undefined,
        endTime: form.values.endTime || undefined,
      });

      return response;
    },
    onSuccess: async (response) => {
      if (response.success) {
        toast.success("Event created successfully!");
        handleClose();
        // router.refresh();

        // Trigger workflow in background
        try {
          const { api } = await import("@/lib/api-client");
          await api.triggerWorkflow({
            eventId: response?.data?.id,
            type: "event_created",
            payload: {},
          });
        } catch (error) {
          console.error("Failed to trigger workflow:", error);
          toast.warning("Event created, but workflow notification failed");
        }
      } else {
        toast.error("Failed to create event");
      }
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast.error("An error occurred while creating the event");
    },
  });

  const handleClose = useCallback(() => {
    form.reset();
    setSelectedFile(null);
    setIsOpen(false);
    router.replace("/events");
  }, [form, setIsOpen, router]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.type !== "application/pdf") {
          toast.error("Please upload a PDF file");
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast.error("File size must be less than 10MB");
          return;
        }
        setSelectedFile(file);
      }
    },
    []
  );

  const handleSubmit = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      toast.error("Please fill in all required fields");
      return;
    }
    await mutateAsync();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
        router.replace("/events");
        form.reset();
      }}
    >
      <DialogContent className="max-w-md max-h-[calc(100vh-2rem)] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event and add details
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="space-y-4 overflow-y-auto flex-1 pr-2"
        >
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Event Title
            </label>
            <Input
              placeholder="Enter event title"
              id="title"
              value={form.values.title}
              key={form.key("title")}
              {...form.getInputProps("title")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              placeholder="Enter event description"
              id="description"
              value={form.values.description}
              key={form.key("description")}
              {...form.getInputProps("description")}
              rows={4}
            />
          </div>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label htmlFor="event-date" className="text-sm font-medium block">
                Event Date
              </label>
              <Popover>
                <PopoverTrigger className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !form.values.eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.values.eventDate ? (
                      format(form.values.eventDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.values.eventDate || undefined}
                    onSelect={(date) =>
                      form.setFieldValue("eventDate", date || null)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1">
              <label
                htmlFor="location-type"
                className="text-sm font-medium block"
              >
                Event Location
              </label>
              <Select
                value={form.values.locationType}
                onValueChange={(value) =>
                  form.setFieldValue("locationType", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-Person</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Time</div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="start-time"
                  className="text-xs text-muted-foreground"
                >
                  Start Time
                </label>
                <Input
                  id="start-time"
                  type="time"
                  value={form.values.startTime}
                  onChange={(e) =>
                    form.setFieldValue("startTime", e.target.value)
                  }
                  placeholder="HH:mm"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="end-time"
                  className="text-xs text-muted-foreground"
                >
                  End Time
                </label>
                <Input
                  id="end-time"
                  type="time"
                  value={form.values.endTime}
                  onChange={(e) =>
                    form.setFieldValue("endTime", e.target.value)
                  }
                  placeholder="HH:mm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Upload PDF (Optional)</div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".pdf"
                // id="file"
                key={form.key("file")}
                {...form.getInputProps("file")}
                onChange={(event) =>
                  setSelectedFile(event?.target?.files?.[0] as File)
                }
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                {selectedFile?.name ? (
                  <div className="text-sm">
                    <p className="font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p>Click to upload PDF</p>
                    <p className="text-xs">or drag and drop</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                form.reset();
                setSelectedFile(null);
                form.setFieldValue("eventDate", null);
                form.setFieldValue("locationType", "");
                form.setFieldValue("startTime", "");
                form.setFieldValue("endTime", "");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
