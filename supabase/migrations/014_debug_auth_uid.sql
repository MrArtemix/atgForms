-- Temporary debug function to check auth.uid() from client
-- Remove this after debugging is complete
CREATE OR REPLACE FUNCTION public.auth_uid_check()
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'is_authenticated', auth.uid() IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
