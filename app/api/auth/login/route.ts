import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken, getTokenExpiration } from "@/lib/jwt";
import { userDb } from "@/lib/db";
import { createErrorResponse, createSuccessResponse } from "@/lib/auth";
import { LoginRequest, LoginResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return createErrorResponse("Username and password are required", 400);
    }

    // Find user
    const user = await userDb.findByUsername(username);
    if (!user) {
      return createErrorResponse("Invalid username or password", 401);
    }

    // Verify password
    if (!user.password) {
      return createErrorResponse("User password not set", 500);
    }

    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return createErrorResponse(
        "Invalid username or pdsaasdasdasassword",
        401
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Create response
    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      expiresIn: getTokenExpiration(),
    };

    return createSuccessResponse(response, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
