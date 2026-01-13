import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoDMPayload {
  user_id: string;
  user_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: AutoDMPayload = await req.json();
    
    console.log('Received auto-dm payload:', payload);

    // Validate required fields
    if (!payload.user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch auto_dm_settings
    const { data: settings, error: settingsError } = await supabase
      .from('auto_dm_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching auto_dm_settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch auto DM settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if auto DM is enabled
    if (!settings || !settings.is_enabled) {
      console.log('Auto DM is disabled');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Auto DM is disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if sender is configured
    if (!settings.sender_id) {
      console.log('No sender configured for auto DM');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'No sender configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Don't send DM to the sender themselves
    if (settings.sender_id === payload.user_id) {
      console.log('Skipping auto DM - sender is the same as recipient');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Sender is the recipient' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Replace placeholder in message template
    const userName = payload.user_name || 'Thành viên';
    const messageContent = (settings.message_template || 'Chào mừng bạn đến với cộng đồng!')
      .replace(/#NAME#/g, userName);

    console.log('Prepared message:', messageContent);

    // Check if conversation already exists between sender and user
    const { data: existingParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', settings.sender_id);

    let conversationId: string | null = null;

    if (existingParticipations && existingParticipations.length > 0) {
      const conversationIds = existingParticipations.map(p => p.conversation_id);
      
      // Check if any of these conversations include the target user
      const { data: matchingParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', payload.user_id)
        .in('conversation_id', conversationIds);

      if (matchingParticipations && matchingParticipations.length > 0) {
        conversationId = matchingParticipations[0].conversation_id;
        console.log('Found existing conversation:', conversationId);
      }
    }

    // Create new conversation if none exists
    if (!conversationId) {
      console.log('Creating new conversation');
      
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return new Response(
          JSON.stringify({ error: 'Failed to create conversation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      conversationId = newConversation.id;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: settings.sender_id },
          { conversation_id: conversationId, user_id: payload.user_id },
        ]);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        return new Response(
          JSON.stringify({ error: 'Failed to add conversation participants' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Created new conversation:', conversationId);
    }

    // Send the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: settings.sender_id,
        content: messageContent,
        message_type: 'text',
        is_auto_dm: true,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auto DM sent successfully:', message.id);

    // Create notification for the new message
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', settings.sender_id)
      .maybeSingle();

    const senderName = senderProfile?.full_name || 'Quản trị viên';

    await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        type: 'message',
        title: 'Tin nhắn mới',
        message: `${senderName} đã gửi tin nhắn cho bạn`,
        actor_id: settings.sender_id,
        target_type: 'conversation',
        target_id: conversationId,
        is_read: false,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversation_id: conversationId,
        message_id: message.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-dm-on-approval function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
