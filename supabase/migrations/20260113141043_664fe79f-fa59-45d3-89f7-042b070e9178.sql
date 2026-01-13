-- =============================================
-- Calendar/Events Schema Migration
-- =============================================

-- Step 1: Create new Enum Types
CREATE TYPE event_location_type AS ENUM (
  'skool_call', 'skool_webinar', 'zoom', 
  'google_meet', 'in_person', 'other'
);

CREATE TYPE event_recurrence_pattern AS ENUM (
  'daily', 'weekly', 'monthly', 'yearly'
);

CREATE TYPE event_recurrence_end_type AS ENUM (
  'never', 'on_date', 'after_occurrences'
);

CREATE TYPE event_status AS ENUM (
  'scheduled', 'live', 'ended', 'cancelled'
);

CREATE TYPE event_rsvp_status AS ENUM (
  'going', 'maybe', 'not_going'
);

CREATE TYPE event_reminder_type AS ENUM (
  '24h', '1h', '15m'
);

-- Step 2: Extend events table
-- Rename existing columns for consistency
ALTER TABLE public.events RENAME COLUMN created_by TO creator_id;
ALTER TABLE public.events RENAME COLUMN location TO location_url;

-- Add new columns
ALTER TABLE public.events 
  ADD COLUMN community_id uuid NULL,
  ADD COLUMN start_date date NULL,
  ADD COLUMN start_time time NULL,
  ADD COLUMN duration_minutes integer NOT NULL DEFAULT 60,
  ADD COLUMN timezone varchar(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  ADD COLUMN location_type event_location_type NULL,
  ADD COLUMN location_address text NULL,
  ADD COLUMN skool_call_id uuid NULL,
  ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN recurrence_pattern event_recurrence_pattern NULL,
  ADD COLUMN recurrence_day_of_week integer NULL CHECK (recurrence_day_of_week >= 0 AND recurrence_day_of_week <= 6),
  ADD COLUMN recurrence_end_type event_recurrence_end_type NULL,
  ADD COLUMN recurrence_end_date date NULL,
  ADD COLUMN recurrence_occurrences integer NULL,
  ADD COLUMN parent_event_id uuid NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ADD COLUMN status event_status NOT NULL DEFAULT 'scheduled',
  ADD COLUMN attendee_count integer NOT NULL DEFAULT 0;

-- Migrate existing data: populate start_date and start_time from start_at
UPDATE public.events 
SET 
  start_date = start_at::date,
  start_time = start_at::time
WHERE start_at IS NOT NULL;

-- Make start_date and start_time NOT NULL after data migration
ALTER TABLE public.events ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE public.events ALTER COLUMN start_time SET NOT NULL;

-- Step 3: Create event_attendees table
CREATE TABLE public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status event_rsvp_status NOT NULL DEFAULT 'going',
  joined_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Step 4: Create event_reminders table
CREATE TABLE public.event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reminder_type event_reminder_type NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id, reminder_type)
);

-- Step 5: Create Indexes
CREATE INDEX idx_events_start_date_time ON public.events(start_date, start_time);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_creator ON public.events(creator_id);
CREATE INDEX idx_events_parent ON public.events(parent_event_id) WHERE parent_event_id IS NOT NULL;

CREATE INDEX idx_event_attendees_user ON public.event_attendees(user_id);
CREATE INDEX idx_event_attendees_event ON public.event_attendees(event_id);

CREATE INDEX idx_event_reminders_event ON public.event_reminders(event_id);
CREATE INDEX idx_event_reminders_user ON public.event_reminders(user_id);

-- Step 6: Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendees
CREATE POLICY "Authenticated users can view event attendees"
ON public.event_attendees FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can RSVP to events"
ON public.event_attendees FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVP"
ON public.event_attendees FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVP"
ON public.event_attendees FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for event_reminders
CREATE POLICY "Users can view their own reminders"
ON public.event_reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reminders"
ON public.event_reminders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Step 7: Create Database Functions

-- Function to update attendee count
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'going' THEN
      UPDATE public.events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'going' AND NEW.status != 'going' THEN
      UPDATE public.events SET attendee_count = attendee_count - 1 WHERE id = NEW.event_id;
    ELSIF OLD.status != 'going' AND NEW.status = 'going' THEN
      UPDATE public.events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'going' THEN
      UPDATE public.events SET attendee_count = attendee_count - 1 WHERE id = OLD.event_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for attendee count
CREATE TRIGGER update_event_attendee_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.event_attendees
FOR EACH ROW EXECUTE FUNCTION public.update_event_attendee_count();

-- Function to get upcoming events
CREATE OR REPLACE FUNCTION public.get_upcoming_events(limit_count integer DEFAULT 10)
RETURNS SETOF public.events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.events
  WHERE status IN ('scheduled', 'live')
    AND (start_date > CURRENT_DATE OR (start_date = CURRENT_DATE AND start_time >= CURRENT_TIME))
  ORDER BY start_date, start_time
  LIMIT limit_count;
$$;

-- Function to get live events
CREATE OR REPLACE FUNCTION public.get_live_events()
RETURNS SETOF public.events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.events
  WHERE status = 'live'
    OR (
      status = 'scheduled'
      AND start_date = CURRENT_DATE
      AND start_time <= CURRENT_TIME
      AND (start_time + (duration_minutes || ' minutes')::interval) >= CURRENT_TIME
    )
  ORDER BY start_date, start_time;
$$;

-- Function to generate recurring events
CREATE OR REPLACE FUNCTION public.generate_recurring_events(parent_id uuid, count_to_generate integer DEFAULT 10)
RETURNS SETOF public.events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_event public.events;
  new_date date;
  i integer;
  generated_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  -- Get parent event
  SELECT * INTO parent_event FROM public.events WHERE id = parent_id;
  
  IF parent_event IS NULL OR parent_event.is_recurring = false THEN
    RETURN;
  END IF;
  
  new_date := parent_event.start_date;
  
  FOR i IN 1..count_to_generate LOOP
    -- Calculate next date based on recurrence pattern
    CASE parent_event.recurrence_pattern
      WHEN 'daily' THEN
        new_date := new_date + INTERVAL '1 day';
      WHEN 'weekly' THEN
        new_date := new_date + INTERVAL '1 week';
      WHEN 'monthly' THEN
        new_date := new_date + INTERVAL '1 month';
      WHEN 'yearly' THEN
        new_date := new_date + INTERVAL '1 year';
      ELSE
        EXIT;
    END CASE;
    
    -- Check recurrence end conditions
    IF parent_event.recurrence_end_type = 'on_date' AND new_date > parent_event.recurrence_end_date THEN
      EXIT;
    END IF;
    
    IF parent_event.recurrence_end_type = 'after_occurrences' AND i > parent_event.recurrence_occurrences THEN
      EXIT;
    END IF;
    
    -- Insert new event instance
    INSERT INTO public.events (
      creator_id, title, description, cover_image_url,
      start_date, start_time, duration_minutes, timezone,
      location_type, location_url, location_address,
      status, parent_event_id
    ) VALUES (
      parent_event.creator_id, parent_event.title, parent_event.description, parent_event.cover_image_url,
      new_date, parent_event.start_time, parent_event.duration_minutes, parent_event.timezone,
      parent_event.location_type, parent_event.location_url, parent_event.location_address,
      'scheduled', parent_id
    )
    RETURNING id INTO generated_ids[i];
  END LOOP;
  
  RETURN QUERY SELECT * FROM public.events WHERE id = ANY(generated_ids);
END;
$$;

-- Enable realtime for event_attendees (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;