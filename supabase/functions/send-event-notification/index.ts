import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventNotificationPayload {
  event_id: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatTime = (timeStr: string) => {
  return timeStr.slice(0, 5);
};

const getLocationLabel = (locationType: string | null) => {
  const labels: Record<string, string> = {
    'skool_call': 'Skool Call',
    'skool_webinar': 'Webinar',
    'zoom': 'Zoom',
    'google_meet': 'Google Meet',
    'in_person': 'Trực tiếp',
    'other': 'Khác',
  };
  return labels[locationType || ''] || 'Online';
};

const generateEventEmailHtml = (event: any, appUrl: string) => {
  const eventUrl = `${appUrl}/calendar/event/${event.id}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📅 Sự kiện mới</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #333; margin-top: 0;">${event.title}</h2>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 8px 0;">
        <strong>📆 Thời gian:</strong> ${formatDate(event.start_date)} lúc ${formatTime(event.start_time)}
      </p>
      <p style="margin: 8px 0;">
        <strong>⏱️ Thời lượng:</strong> ${event.duration_minutes} phút
      </p>
      <p style="margin: 8px 0;">
        <strong>📍 Địa điểm:</strong> ${getLocationLabel(event.location_type)}
      </p>
    </div>
    
    ${event.description ? `<p style="color: #666; margin: 20px 0;">${event.description}</p>` : ''}
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
        Xem chi tiết
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Bạn nhận được email này vì đã đăng ký nhận thông báo từ cộng đồng.
    </p>
  </div>
</body>
</html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email notifications');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'RESEND_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: EventNotificationPayload = await req.json();
    console.log('Received event notification payload:', payload);

    if (!payload.event_id) {
      return new Response(
        JSON.stringify({ error: 'Missing event_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', payload.event_id)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all approved members with email notifications enabled
    const { data: members, error: membersError } = await supabase
      .from('membership_requests')
      .select('user_id')
      .eq('status', 'approved');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw membersError;
    }

    const memberIds = members?.map(m => m.user_id) || [];
    console.log(`Found ${memberIds.length} approved members`);

    // Fetch notification settings for members who have email_event_reminders enabled
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('user_id')
      .in('user_id', memberIds)
      .eq('email_event_reminders', true);

    const usersWithEmailEnabled = new Set(settings?.map(s => s.user_id) || []);

    // Fetch auth users to get emails
    let successfulEmails = 0;
    let failedEmails = 0;
    const appUrl = supabaseUrl.replace('.supabase.co', '.lovable.app').replace('https://', 'https://');

    // Create in-app notifications for all members
    const notifications = memberIds.map(userId => ({
      user_id: userId,
      type: 'event_new',
      title: 'Sự kiện mới',
      message: `"${event.title}" đã được tạo`,
      target_type: 'event',
      target_id: event.id,
      is_read: false,
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating in-app notifications:', notifError);
      } else {
        console.log(`Created ${notifications.length} in-app notifications`);
      }
    }

    // Send emails to users with email notifications enabled
    for (const userId of memberIds) {
      if (!usersWithEmailEnabled.has(userId)) continue;

      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError || !userData?.user?.email) {
          console.log(`Could not get email for user ${userId}`);
          continue;
        }

        const emailHtml = generateEventEmailHtml(event, 'https://10xlogistics.lovable.app');

        const { error: emailError } = await resend.emails.send({
          from: '10X Logistics <notifications@resend.dev>',
          to: [userData.user.email],
          subject: `[10X Logistics] Sự kiện mới: ${event.title}`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Email failed for ${userData.user.email}:`, emailError);
          failedEmails++;
        } else {
          successfulEmails++;
        }
      } catch (error) {
        console.error(`Error sending email to user ${userId}:`, error);
        failedEmails++;
      }
    }

    // Log notification stats
    const { error: logError } = await supabase
      .from('event_notification_logs')
      .insert({
        event_id: event.id,
        notification_type: 'new_event',
        total_recipients: memberIds.length,
        successful_sends: successfulEmails,
        failed_sends: failedEmails,
      });

    if (logError) {
      console.error('Error logging notification:', logError);
    }

    console.log(`Event notification complete: ${successfulEmails} emails sent, ${failedEmails} failed, ${notifications.length} in-app notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails_sent: successfulEmails,
        emails_failed: failedEmails,
        in_app_notifications: notifications.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-event-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
