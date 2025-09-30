/**
 * Supabase database types
 * TODO: Generate these types using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 *
 * For now, using a placeholder type
 */

export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
