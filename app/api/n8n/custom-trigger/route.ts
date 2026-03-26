import { createErrorResponse, createSuccessResponse } from "@/lib/auth";
import { NextRequest } from "next/server";

// POST /api/n8n/custom-trigger - Generic webhook to trigger an N8n workflow
// Forwards any JSON payload from the frontend to an N8n webhook URL.
export async function GET(request: NextRequest) {
  try {
    // Accept any JSON payload
    const { searchParams } = new URL(request.url);
    const studentName = searchParams.get("student_name");
    const studentId = searchParams.get("student_id");
    const esId = searchParams.get("es_id");

    const n8nWebhookUrl = `${
      process.env.NEXT_PUBLIC_N8N_MENTOR_CONFIRMATION_WEBHOOK_URL
    }?student_name=${encodeURIComponent(studentName || "")}&student_id=${encodeURIComponent(studentId || "")}&es_id=${encodeURIComponent(esId || "")}`;
    if (!n8nWebhookUrl) {
      return createErrorResponse(
        "NEXT_PUBLIC_N8N_MENTOR_CONFIRMATION_WEBHOOK_URL not configured",
        500
      );
    }

    // Enrich payload with metadata for observability
    const n8nPayload = {
      // triggeredByUserId: auth.payload?.userId,
      triggeredAt: new Date().toISOString(),
      source: "cmis-admin-portal",
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text().catch(() => "");
      console.error("N8n custom webhook error:", errorText);
      return createErrorResponse("Failed to trigger N8n workflow", 500);
    }

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    return createSuccessResponse(
      {
        success: true,
        n8nResponse: n8nResult,
        payload: n8nPayload,
      },
      "Custom webhook trigger sent to N8n successfully"
    );
  } catch (error) {
    console.error("N8n custom webhook error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
