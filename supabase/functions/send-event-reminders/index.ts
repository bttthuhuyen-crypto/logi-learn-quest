import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const generateReminderEmailHtml = (event: any, reminderType: string, appUrl: string) => {
  const eventUrl = `${appUrl}/calendar/event/${event.id}`;
  const isOneHour = reminderType === '1h';
  
  const headerText = isOneHour 
    ? '⏰ Sắp bắt đầu trong 1 giờ!' 
    : '⏰ Nhắc nhở: Diễn ra vào ngày mai';
  
  const headerColor = isOneHour ? '#f59e0b' : '#667eea';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${headerColor}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">${headerText}</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #333; margin-top: 0;">${event.title}</h2>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 8px 0;">
        <strong>📆 Thời gian:</strong> ${formatDate(event.start_date)} lúc ${formatTime(event.start_time)}
      </p>
      <p style="margin: 8px 0;">
        <strong>📍 Địa điểm:</strong> ${getLocationLabel(event.location_type)}
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${eventUrl}" style="display: inline-block; background: ${headerColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
        ${isOneHour ? 'Tham gia ngay' : 'Xem chi tiết'}
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Bạn nhận được email này vì đã đăng ký nhắc nhở sự kiện.
    </p>
  </div>
</body>
</html>
  `;
};

const generateLiveEmailHtml = (event: any, appUrl: string) => {
  const eventUrl = `${appUrl}/calendar/event/${event.id}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ef4444; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">🔴 Đang diễn ra!</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #333; margin-top: 0;">${event.title}</h2>
    
    <p style="color: #666; text-align: center; font-size: 18px;">
      Sự kiện đang diễn ra ngay bây giờ!
    </p>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${eventUrl}" style="display: inline-block; background: #ef4444; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
        Tham gia ngay
      </a>
    </div>
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const now = new Date();
    const appUrl = 'https://10xlogistics.lovable.app';

    // Calculate time windows
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in75Minutes = new Date(now.getTime() + 75 * 60 * 1000);

    console.log('Running event reminders check at:', now.toISOString());

    // Fetch all events
    const { data: allEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('status', ['scheduled', 'live']);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    // Helper to get event datetime
    const getEventDateTime = (event: any) => {
      const dateStr = event.start_date;
      const timeStr = event.start_time;
      return new Date(`${dateStr}T${timeStr}`);
    };

    // Filter events for 24h reminder
    const events24h = (allEvents || []).filter(event => {
      const eventTime = getEventDateTime(event);
      return eventTime >= in24Hours && eventTime < in25Hours && event.status === 'scheduled';
    });

    // Filter events for 1h reminder  
    const events1h = (allEvents || []).filter(event => {
      const eventTime = getEventDateTime(event);
      return eventTime >= in1Hour && eventTime < in75Minutes && event.status === 'scheduled';
    });

    // Filter live events that just went live
    const liveEvents = (allEvents || []).filter(event => event.status === 'live');

    console.log(`Found ${events24h.length} events for 24h reminder, ${events1h.length} for 1h reminder, ${liveEvents.length} live events`);

    // Fetch approved members
    const { data: members } = await supabase
      .from('membership_requests')
      .select('user_id')
      .eq('status', 'approved');

    const memberIds = members?.map(m => m.user_id) || [];

    // Fetch notification settings
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('user_id, email_event_reminders')
      .in('user_id', memberIds);

    const usersWithEmailEnabled = new Set(
      settings?.filter(s => s.email_event_reminders).map(s => s.user_id) || []
    );

    let totalEmailsSent = 0;
    let totalNotificationsCreated = 0;

    // Process 24h reminders
    for (const event of events24h) {
      // Check if reminder already sent
      const { data: existingReminders } = await supabase
        .from('event_reminders')
        .select('id, user_id')
        .eq('event_id', event.id)
        .eq('reminder_type', '24h');

      const alreadySentUserIds = new Set(existingReminders?.map(r => r.user_id) || []);

      const usersToNotify = memberIds.filter(id => !alreadySentUserIds.has(id));
      
      if (usersToNotify.length === 0) continue;

      console.log(`Sending 24h reminders for event "${event.title}" to ${usersToNotify.length} users`);

      // Create in-app notifications
      const notifications = usersToNotify.map(userId => ({
        user_id: userId,
        type: 'event_reminder_24h',
        title: 'Nhắc nhở sự kiện',
        message: `"${event.title}" diễn ra vào ngày mai`,
        target_type: 'event',
        target_id: event.id,
        is_read: false,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (!notifError) {
        totalNotificationsCreated += notifications.length;
      }

      // Log reminders
      const reminderLogs = usersToNotify.map(userId => ({
        event_id: event.id,
        user_id: userId,
        reminder_type: '24h' as const,
        channel: 'in_app',
      }));

      await supabase.from('event_reminders').insert(reminderLogs);

      // Send emails
      if (resend) {
        for (const userId of usersToNotify) {
          if (!usersWithEmailEnabled.has(userId)) continue;

          try {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            if (!userData?.user?.email) continue;

            const emailHtml = generateReminderEmailHtml(event, '24h', appUrl);

            await resend.emails.send({
              from: '10X Logistics <notifications@resend.dev>',
              to: [userData.user.email],
              subject: `⏰ Nhắc nhở: "${event.title}" diễn ra vào ngày mai`,
              html: emailHtml,
            });

            totalEmailsSent++;
          } catch (error) {
            console.error(`Error sending 24h reminder email:`, error);
          }
        }
      }
    }

    // Process 1h reminders
    for (const event of events1h) {
      const { data: existingReminders } = await supabase
        .from('event_reminders')
        .select('id, user_id')
        .eq('event_id', event.id)
        .eq('reminder_type', '1h');

      const alreadySentUserIds = new Set(existingReminders?.map(r => r.user_id) || []);
      const usersToNotify = memberIds.filter(id => !alreadySentUserIds.has(id));
      
      if (usersToNotify.length === 0) continue;

      console.log(`Sending 1h reminders for event "${event.title}" to ${usersToNotify.length} users`);

      // Create in-app notifications
      const notifications = usersToNotify.map(userId => ({
        user_id: userId,
        type: 'event_reminder_1h',
        title: 'Sắp bắt đầu',
        message: `"${event.title}" trong 1 giờ nữa`,
        target_type: 'event',
        target_id: event.id,
        is_read: false,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (!notifError) {
        totalNotificationsCreated += notifications.length;
      }

      // Log reminders
      const reminderLogs = usersToNotify.map(userId => ({
        event_id: event.id,
        user_id: userId,
        reminder_type: '1h' as const,
        channel: 'in_app',
      }));

      await supabase.from('event_reminders').insert(reminderLogs);

      // Send emails
      if (resend) {
        for (const userId of usersToNotify) {
          if (!usersWithEmailEnabled.has(userId)) continue;

          try {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            if (!userData?.user?.email) continue;

            const emailHtml = generateReminderEmailHtml(event, '1h', appUrl);

            await resend.emails.send({
              from: '10X Logistics <notifications@resend.dev>',
              to: [userData.user.email],
              subject: `⏰ Sắp bắt đầu: "${event.title}" trong 1 giờ nữa!`,
              html: emailHtml,
            });

            totalEmailsSent++;
          } catch (error) {
            console.error(`Error sending 1h reminder email:`, error);
          }
        }
      }
    }

    // Process live event notifications
    for (const event of liveEvents) {
      const { data: existingReminders } = await supabase
        .from('event_reminders')
        .select('id, user_id')
        .eq('event_id', event.id)
        .eq('reminder_type', '15m'); // Using 15m as "live" indicator

      const alreadySentUserIds = new Set(existingReminders?.map(r => r.user_id) || []);
      const usersToNotify = memberIds.filter(id => !alreadySentUserIds.has(id));
      
      if (usersToNotify.length === 0) continue;

      console.log(`Sending live notifications for event "${event.title}" to ${usersToNotify.length} users`);

      // Create in-app notifications
      const notifications = usersToNotify.map(userId => ({
        user_id: userId,
        type: 'event_live',
        title: 'Đang diễn ra',
        message: `"${event.title}" đang diễn ra!`,
        target_type: 'event',
        target_id: event.id,
        is_read: false,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (!notifError) {
        totalNotificationsCreated += notifications.length;
      }

      // Log reminders
      const reminderLogs = usersToNotify.map(userId => ({
        event_id: event.id,
        user_id: userId,
        reminder_type: '15m' as const,
        channel: 'in_app',
      }));

      await supabase.from('event_reminders').insert(reminderLogs);

      // Send emails
      if (resend) {
        for (const userId of usersToNotify) {
          if (!usersWithEmailEnabled.has(userId)) continue;

          try {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            if (!userData?.user?.email) continue;

            const emailHtml = generateLiveEmailHtml(event, appUrl);

            await resend.emails.send({
              from: '10X Logistics <notifications@resend.dev>',
              to: [userData.user.email],
              subject: `🔴 "${event.title}" đang diễn ra!`,
              html: emailHtml,
            });

            totalEmailsSent++;
          } catch (error) {
            console.error(`Error sending live event email:`, error);
          }
        }
      }
    }

    console.log(`Reminders complete: ${totalEmailsSent} emails sent, ${totalNotificationsCreated} in-app notifications created`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails_sent: totalEmailsSent,
        notifications_created: totalNotificationsCreated,
        events_processed: {
          '24h': events24h.length,
          '1h': events1h.length,
          'live': liveEvents.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-event-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
