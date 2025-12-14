-- Helper RPC function to execute SQL from client (Service Role only)
-- Run this in Supabase SQL Editor once to enable remote migrations via scripts

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
