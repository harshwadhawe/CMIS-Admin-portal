import {
  createErrorResponse,
  createSuccessResponse,
  verifyAuth,
} from "@/lib/auth";
import { eventDb } from "@/lib/db";
import { uploadEventFile } from "@/lib/s3";
import { NextRequest } from "next/server";

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || "Unauthorized", 401);
    }

    const events = await eventDb.findAll();
    return createSuccessResponse(events, "Events retrieved successfully");
  } catch (error) {
    console.error("Get events error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || "Unauthorized", 401);
    }

    const contentType = request.headers.get("content-type") || "";
    let title: string | null = null;
    let description: string | null = null;
    let eventDate: string | undefined;
    let startTime: string | undefined;
    let endTime: string | undefined;
    let locationType: string | undefined;
    let fileName: string | undefined;
    let eventSummary: string | undefined;
    let eventEmbedding: string | undefined;
    let fileKey: string | undefined;
    let pdfUrl: string | undefined; // For backward compatibility

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") as string) || null;
      description = (formData.get("description") as string) || null;
      eventDate = (formData.get("eventDate") as string) || undefined;
      startTime = (formData.get("startTime") as string) || undefined;
      endTime = (formData.get("endTime") as string) || undefined;
      locationType = (formData.get("locationType") as string) || undefined;
      fileName = (formData.get("fileName") as string) || undefined;
      eventSummary = (formData.get("eventSummary") as string) || undefined;
      eventEmbedding = (formData.get("eventEmbedding") as string) || undefined;
      const file = formData.get("pdfFile") as File | null;

      if (file) {
        const uploadResult = await uploadEventFile({
          file,
          originalName: file.name,
          eventTitle: title || "event",
          contentType: file.type || "application/pdf",
        });
        fileKey = uploadResult.key;
        pdfUrl = uploadResult.url;
        // Use file name if not provided
        if (!fileName) {
          fileName = file.name;
        }
      }
    } else {
      const body = await request.json();
      title = body.title;
      description = body.description;
      eventDate = body.eventDate;
      startTime = body.startTime;
      endTime = body.endTime;
      locationType = body.locationType;
      fileName = body.fileName;
      eventSummary = body.eventSummary;
      eventEmbedding = body.eventEmbedding;
      fileKey = body.fileKey;
      pdfUrl = body.pdfUrl; // For backward compatibility
    }

    // Validate input
    if (!title || !description) {
      return createErrorResponse("Title and description are required", 400);
    }

    // Create event
    const newEvent = await eventDb.create({
      title,
      description,
      eventDate: eventDate || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      locationType: locationType || undefined,
      fileName: fileName || undefined,
      eventSummary: eventSummary || undefined,
      eventEmbedding: eventEmbedding || undefined,
      fileKey: fileKey || undefined,
      createdBy: auth.payload?.userId,
    });

    return createSuccessResponse(newEvent, "Event created successfully", 201);
  } catch (error) {
    console.error("Create event error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
