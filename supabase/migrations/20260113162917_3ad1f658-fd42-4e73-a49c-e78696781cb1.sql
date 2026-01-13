-- Fix: set immutable search_path on generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM public.affiliate_links WHERE referral_code = result) INTO code_exists;

    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$function$;

-- Fix: avoid permissive WITH CHECK (true) on referral_clicks
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.referral_clicks;
CREATE POLICY "Anyone can insert clicks" ON public.referral_clicks
  FOR INSERT TO public
  WITH CHECK (affiliate_link_id IS NOT NULL);
