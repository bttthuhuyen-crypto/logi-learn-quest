import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  message: string;
  actor_id?: string;
  target_type?: string;
  target_id?: string;
  data?: Record<string, unknown>;
}

// Notification types that can be disabled via settings
const NOTIFICATION_SETTINGS_MAP: Record<string, string> = {
  'like': 'notify_likes',
  'comment': 'notify_comments',
  'mention': 'notify_mentions',
  'follow': 'notify_followers',
  'following_post': 'notify_following_posts',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    
    console.log('Received notification payload:', payload);

    // Validate required fields
    if (!payload.user_id || !payload.type || !payload.title || !payload.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, type, title, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's notification settings if this type can be disabled
    const settingKey = NOTIFICATION_SETTINGS_MAP[payload.type];
    if (settingKey) {
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', payload.user_id)
        .maybeSingle();

      if (settings && settings[settingKey] === false) {
        console.log(`User ${payload.user_id} has disabled ${payload.type} notifications`);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'User disabled this notification type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        actor_id: payload.actor_id || null,
        target_type: payload.target_type || null,
        target_id: payload.target_id || null,
        data: payload.data || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting notification:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Notification created successfully:', notification.id);

    return new Response(
      JSON.stringify({ success: true, notification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-notification function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
