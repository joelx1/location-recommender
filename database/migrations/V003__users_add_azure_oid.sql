-- V003: Add azure_oid column to users table
-- This links each user row to their Microsoft Entra External ID identity.
-- The backend reads the 'sub' claim from the JWT token and looks up by this column.
ALTER TABLE users ADD COLUMN azure_oid VARCHAR(255) UNIQUE;
