// PostgreSQL database operations
// Replaces the in-memory database

import { query } from "./db-connection";
import { User, Event, ExternalStakeholder } from "./types";
import bcrypt from "bcryptjs";

// User operations
export const userDb = {
  findByUsername: async (username: string): Promise<User | null> => {
    try {
      const result = await query(
        'SELECT id, username, password, role FROM admins WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        username: row.username,
        password: row.password,
        role: row.role,
      };
    } catch (error) {
      console.error("Error finding user by username:", error);
      return null;
    }
  },

  findById: async (id: string): Promise<User | null> => {
    try {
      const result = await query(
        "SELECT id, username, password, role FROM admins WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        username: row.username,
        email: row.email,
        password: row.password,
        role: row.role,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("Error finding user by id:", error);
      return null;
    }
  },

  create: async (user: Omit<User, "id" | "createdAt">): Promise<User> => {
    try {
      const hashedPassword = user.password
        ? await bcrypt.hash(user.password, 10)
        : "";

      const result = await query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
        [user.username, user.email || null, hashedPassword, user.role || "user"]
      );

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        username: row.username,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
};

// Event operations
export const eventDb = {
  findAll: async (): Promise<Event[]> => {
    try {
      const result = await query(
        "SELECT event_id, title, description, event_date, start_time, end_time, location_type, file_name, event_summary, event_embedding, file_key FROM events ORDER BY event_date DESC"
      );

      return result.rows.map((row) => ({
        id: row.event_id.toString(),
        title: row.title,
        description: row.description || "",
        eventDate: row.event_date || undefined,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        locationType: row.location_type || undefined,
        fileName: row.file_name || undefined,
        eventSummary: row.event_summary || undefined,
        eventEmbedding: row.event_embedding || undefined,
        fileKey: row.file_key || undefined,
      }));
    } catch (error) {
      console.error("Error finding all events:", error);
      return [];
    }
  },

  findById: async (id: string): Promise<Event | null> => {
    try {
      const result = await query(
        "SELECT event_id, title, description, event_date, start_time, end_time, location_type, file_name, event_summary, event_embedding, file_key FROM events WHERE event_id = $1",
        [id]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.event_id.toString(),
        title: row.title,
        description: row.description || "",
        eventDate: row.event_date || undefined,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        locationType: row.location_type || undefined,
        fileName: row.file_name || undefined,
        eventSummary: row.event_summary || undefined,
        eventEmbedding: row.event_embedding || undefined,
        fileKey: row.file_key || undefined,
      };
    } catch (error) {
      console.error("Error finding event by id:", error);
      return null;
    }
  },

  create: async (
    event: Omit<Event, "id" | "createdAt" | "updatedAt">
  ): Promise<Event> => {
    try {
      const result = await query(
        "INSERT INTO events (title, description, event_date, start_time, end_time, location_type, file_name, event_summary, event_embedding, file_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING event_id, title, description, event_date, start_time, end_time, location_type, file_name, event_summary, event_embedding, file_key",
        [
          event.title,
          event.description,
          event.eventDate || null,
          event.startTime || null,
          event.endTime || null,
          event.locationType || null,
          event.fileName || null,
          event.eventSummary || null,
          event.eventEmbedding || null,
          event.fileKey || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.event_id.toString(),
        title: row.title,
        description: row.description || "",
        eventDate: row.event_date || undefined,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        locationType: row.location_type || undefined,
        fileName: row.file_name || undefined,
        eventSummary: row.event_summary || undefined,
        eventEmbedding: row.event_embedding || undefined,
        fileKey: row.file_key || undefined,
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  update: async (
    id: string,
    updates: Partial<Event>
  ): Promise<Event | null> => {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        values.push(updates.title);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.eventDate !== undefined) {
        updateFields.push(`event_date = $${paramCount++}`);
        values.push(updates.eventDate);
      }
      if (updates.startTime !== undefined) {
        updateFields.push(`start_time = $${paramCount++}`);
        values.push(updates.startTime);
      }
      if (updates.endTime !== undefined) {
        updateFields.push(`end_time = $${paramCount++}`);
        values.push(updates.endTime);
      }
      if (updates.locationType !== undefined) {
        updateFields.push(`location_type = $${paramCount++}`);
        values.push(updates.locationType);
      }
      if (updates.fileName !== undefined) {
        updateFields.push(`file_name = $${paramCount++}`);
        values.push(updates.fileName);
      }
      if (updates.eventSummary !== undefined) {
        updateFields.push(`event_summary = $${paramCount++}`);
        values.push(updates.eventSummary);
      }
      if (updates.eventEmbedding !== undefined) {
        updateFields.push(`event_embedding = $${paramCount++}`);
        values.push(updates.eventEmbedding);
      }
      if (updates.fileKey !== undefined) {
        updateFields.push(`file_key = $${paramCount++}`);
        values.push(updates.fileKey);
      }

      if (updateFields.length === 0) {
        // No fields to update, return the existing event
        return await eventDb.findById(id);
      }

      values.push(id);

      const result = await query(
        `UPDATE events SET ${updateFields.join(
          ", "
        )} WHERE event_id = $${paramCount} RETURNING event_id, title, description, event_date, start_time, end_time, location_type, file_name, event_summary, event_embedding, file_key`,
        values
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.event_id.toString(),
        title: row.title,
        description: row.description || "",
        eventDate: row.event_date || undefined,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        locationType: row.location_type || undefined,
        fileName: row.file_name || undefined,
        eventSummary: row.event_summary || undefined,
        eventEmbedding: row.event_embedding || undefined,
        fileKey: row.file_key || undefined,
      };
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const result = await query("DELETE FROM events WHERE event_id = $1", [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  },
};

// External Stakeholder operations
export const judgeDb = {
  findAll: async (): Promise<ExternalStakeholder[]> => {
    try {
      const result = await query(
        "SELECT es_id, es_type, full_name, email, phone, organization, title, location, graduation_year, linkedin_url, bio_text, bio_embedding FROM external_stakeholders"
      );

      return result.rows.map((row) => ({
        id: row.es_id.toString(),
        esType: row.es_type,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone || undefined,
        organization: row.organization || undefined,
        title: row.title || undefined,
        location: row.location || undefined,
        graduationYear: row.graduation_year || undefined,
        linkedinUrl: row.linkedin_url || undefined,
        bioText: row.bio_text || undefined,
        bioEmbedding: row.bio_embedding || undefined,
      }));
    } catch (error) {
      console.error("Error finding all external stakeholders:", error);
      return [];
    }
  },

  findById: async (id: string): Promise<ExternalStakeholder | null> => {
    try {
      const result = await query(
        "SELECT es_id, es_type, full_name, email, phone, organization, title, location, graduation_year, linkedin_url, bio_text, bio_embedding FROM external_stakeholders WHERE es_id = $1",
        [id]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.es_id.toString(),
        esType: row.es_type,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone || undefined,
        organization: row.organization || undefined,
        title: row.title || undefined,
        location: row.location || undefined,
        graduationYear: row.graduation_year || undefined,
        linkedinUrl: row.linkedin_url || undefined,
        bioText: row.bio_text || undefined,
        bioEmbedding: row.bio_embedding || undefined,
      };
    } catch (error) {
      console.error("Error finding external stakeholder by id:", error);
      return null;
    }
  },

  findByType: async (esType: string): Promise<ExternalStakeholder[]> => {
    try {
      const result = await query(
        "SELECT es_id, es_type, full_name, email, phone, organization, title, location, graduation_year, linkedin_url, bio_text, bio_embedding FROM external_stakeholders WHERE es_type = $1",
        [esType]
      );

      return result.rows.map((row) => ({
        id: row.es_id.toString(),
        esType: row.es_type,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone || undefined,
        organization: row.organization || undefined,
        title: row.title || undefined,
        location: row.location || undefined,
        graduationYear: row.graduation_year || undefined,
        linkedinUrl: row.linkedin_url || undefined,
        bioText: row.bio_text || undefined,
        bioEmbedding: row.bio_embedding || undefined,
      }));
    } catch (error) {
      console.error("Error finding external stakeholders by type:", error);
      return [];
    }
  },

  create: async (
    stakeholder: Omit<ExternalStakeholder, "id">
  ): Promise<ExternalStakeholder> => {
    try {
      const result = await query(
        "INSERT INTO external_stakeholders (es_type, full_name, email, phone, organization, title, location, graduation_year, linkedin_url, bio_text, bio_embedding) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING es_id, es_type, full_name, email, phone, organization, title, location, graduation_year, linkedin_url, bio_text, bio_embedding",
        [
          stakeholder.esType,
          stakeholder.fullName,
          stakeholder.email,
          stakeholder.phone || null,
          stakeholder.organization || null,
          stakeholder.title || null,
          stakeholder.location || null,
          stakeholder.graduationYear || null,
          stakeholder.linkedinUrl || null,
          stakeholder.bioText || null,
          stakeholder.bioEmbedding || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.es_id.toString(),
        esType: row.es_type,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone || undefined,
        organization: row.organization || undefined,
        title: row.title || undefined,
        location: row.location || undefined,
        graduationYear: row.graduation_year || undefined,
        linkedinUrl: row.linkedin_url || undefined,
        bioText: row.bio_text || undefined,
        bioEmbedding: row.bio_embedding || undefined,
      };
    } catch (error) {
      console.error("Error creating external stakeholder:", error);
      throw error;
    }
  },

  update: async (
    id: string,
    updates: Partial<ExternalStakeholder>
  ): Promise<ExternalStakeholder | null> => {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.esType !== undefined) {
        updateFields.push(`es_type = $${paramCount++}`);
        values.push(updates.esType);
      }
      if (updates.fullName !== undefined) {
        updateFields.push(`full_name = $${paramCount++}`);
        values.push(updates.fullName);
      }
      if (updates.email !== undefined) {
        updateFields.push(`email = $${paramCount++}`);
        values.push(updates.email);
      }
      if (updates.phone !== undefined) {
        updateFields.push(`phone = $${paramCount++}`);
        values.push(updates.phone);
      }
      if (updates.organization !== undefined) {
        updateFields.push(`organization = $${paramCount++}`);
        values.push(updates.organization);
      }
      if (updates.title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        values.push(updates.title);
      }
      if (updates.location !== undefined) {
        updateFields.push(`location = $${paramCount++}`);
        values.push(updates.location);
      }
      if (updates.graduationYear !== undefined) {
        updateFields.push(`graduation_year = $${paramCount++}`);
        values.push(updates.graduationYear);
      }
      if (updates.linkedinUrl !== undefined) {
        updateFields.push(`linkedin_url = $${paramCount++}`);
        values.push(updates.linkedinUrl);
      }
      if (updates.bioText !== undefined) {
        updateFields.push(`bio_text = $${paramCount++}`);
        values.push(updates.bioText);
      }
      if (updates.bioEmbedding !== undefined) {
        updateFields.push(`bio_embedding = $${paramCount++}`);
        values.push(updates.bioEmbedding);
      }

      if (updateFields.length === 0) {
        // No fields to update, return the existing stakeholder
        return await judgeDb.findById(id);
      }

      values.push(id);

      const result = await query(
        `UPDATE external_stakeholders SET ${updateFields.join(
          ", "
        )} WHERE es_id = $${paramCount} RETURNING es_id, es_type, full_name, email, phone, organization, title, location, graduation_year, linkedin_url, bio_text, bio_embedding`,
        values
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.es_id.toString(),
        esType: row.es_type,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone || undefined,
        organization: row.organization || undefined,
        title: row.title || undefined,
        location: row.location || undefined,
        graduationYear: row.graduation_year || undefined,
        linkedinUrl: row.linkedin_url || undefined,
        bioText: row.bio_text || undefined,
        bioEmbedding: row.bio_embedding || undefined,
      };
    } catch (error) {
      console.error("Error updating external stakeholder:", error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const result = await query("DELETE FROM external_stakeholders WHERE es_id = $1", [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting external stakeholder:", error);
      return false;
    }
  },
};
