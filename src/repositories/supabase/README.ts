/**
 * Supabase provider switch guide
 * --------------------------------
 * Schema: supabase/schema.sql (run in SQL Editor)
 * Setup:  supabase/README.md
 *
 * To activate Supabase later:
 * 1. Implement repositories/supabase/* matching contracts in repositories/contracts
 * 2. Change DataProvider / NEXT_PUBLIC_DATA_PROVIDER from "mock" to "supabase"
 * 3. Use NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from .env
 * 4. Auth + Storage + RLS are defined in schema.sql
 */

export const SUPABASE_READY = true;
