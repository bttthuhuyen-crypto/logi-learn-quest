-- Create function to notify admins on new membership requests
CREATE OR REPLACE FUNCTION public.notify_admins_new_membership_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  requester_name TEXT;
BEGIN
  -- Get the requester's name
  SELECT full_name INTO requester_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Notify all admins and owners
  FOR admin_record IN 
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'owner')
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      actor_id,
      target_id,
      target_type,
      is_read
    ) VALUES (
      admin_record.user_id,
      'new_membership_request',
      CASE 
        WHEN requester_name IS NOT NULL AND requester_name != '' 
        THEN requester_name || ' đã gửi yêu cầu tham gia'
        ELSE 'Có yêu cầu tham gia mới'
      END,
      'Một người dùng mới đã gửi yêu cầu tham gia cộng đồng.',
      NEW.user_id,
      NEW.id,
      'membership_request',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on membership_requests table
DROP TRIGGER IF EXISTS on_new_membership_request ON public.membership_requests;
CREATE TRIGGER on_new_membership_request
  AFTER INSERT ON public.membership_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admins_new_membership_request();

-- Enable realtime for membership_requests table for live count updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.membership_requests;