-- Review candidate: promote with `supabase migration new heartbeat_setup`
-- after schema/history reconciliation. Never apply implicitly during review.
BEGIN;

CREATE TABLE IF NOT EXISTS public.heartbeat (
  id integer PRIMARY KEY,
  last_seen timestamptz NOT NULL DEFAULT now()
);

-- Existing installations are accepted only if the route's assumptions hold.
-- Never coerce an unknown live schema or discard existing heartbeat values.
DO $guard$
BEGIN
  IF (SELECT relkind FROM pg_class WHERE oid = 'public.heartbeat'::regclass) <> 'r'
    OR NOT EXISTS (SELECT 1 FROM pg_attribute
      WHERE attrelid = 'public.heartbeat'::regclass AND attname = 'id'
        AND atttypid IN ('int2'::regtype, 'int4'::regtype, 'int8'::regtype)
        AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_attribute
      WHERE attrelid = 'public.heartbeat'::regclass AND attname = 'last_seen'
        AND atttypid = 'timestamptz'::regtype AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_attribute a
      ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = 'public.heartbeat'::regclass AND c.contype = 'p'
        AND cardinality(c.conkey) = 1 AND a.attname = 'id')
    OR EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.heartbeat'::regclass)
  THEN
    RAISE EXCEPTION 'Unexpected heartbeat schema/policies; inspect before applying';
  END IF;
END;
$guard$;

-- Preserve row 1 and its timestamp if it already exists. Other rows are untouched.
INSERT INTO public.heartbeat (id, last_seen)
SELECT 1, now() WHERE NOT EXISTS (SELECT 1 FROM public.heartbeat WHERE id = 1);

ALTER TABLE public.heartbeat ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.heartbeat FROM PUBLIC, anon, authenticated, service_role;
-- Table REVOKE alone does not remove pre-existing column grants.
DO $columns$
DECLARE col name;
BEGIN
  FOR col IN SELECT attname FROM pg_attribute
    WHERE attrelid = 'public.heartbeat'::regclass AND attnum > 0 AND NOT attisdropped
  LOOP
    EXECUTE format('REVOKE ALL (%I) ON public.heartbeat FROM PUBLIC, anon, authenticated, service_role', col);
  END LOOP;
END;
$columns$;
GRANT SELECT (id), UPDATE (last_seen) ON public.heartbeat TO service_role;
-- service_role bypasses RLS. No browser policy and no runtime insert/sequence grant.
COMMIT;
