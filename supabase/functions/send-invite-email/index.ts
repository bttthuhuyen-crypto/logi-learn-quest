import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  emails: string[];
  role: string;
  customMessage?: string;
  invitedBy: string;
  inviteType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails, role, customMessage, invitedBy, inviteType = 'email' }: InviteEmailRequest = await req.json();

    console.log(`Processing invite request for ${emails.length} emails from user ${invitedBy}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get inviter's profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', invitedBy)
      .single();

    const inviterName = inviterProfile?.full_name || 'Quản trị viên';
    const communityName = '10X Logistics';
    const joinUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/auth`;

    let successCount = 0;
    let failedCount = 0;
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of emails) {
      try {
        // Send email
        const emailResponse = await resend.emails.send({
          from: `${communityName} <onboarding@resend.dev>`,
          to: [email],
          subject: `Bạn được mời tham gia ${communityName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; margin-bottom: 10px;">🎉 Bạn được mời!</h1>
              </div>
              
              <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 16px;">
                  <strong>${inviterName}</strong> đã mời bạn tham gia cộng đồng <strong>${communityName}</strong>.
                </p>
                
                ${customMessage ? `
                <div style="background: white; border-left: 4px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
                  <p style="margin: 0; font-style: italic; color: #555;">"${customMessage}"</p>
                </div>
                ` : ''}
                
                <p style="margin: 16px 0 0 0; color: #666;">
                  Bạn sẽ được tham gia với vai trò: <strong>${role === 'moderator' ? 'Điều hành viên' : 'Thành viên'}</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${joinUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Tham gia ngay
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
              
              <p style="text-align: center; color: #888; font-size: 14px;">
                Email này được gửi từ ${communityName}.<br>
                Nếu bạn không muốn nhận email này, vui lòng bỏ qua.
              </p>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${email}:`, emailResponse);

        // Log to database
        await supabase
          .from('invite_logs')
          .insert({
            email,
            invite_type: inviteType,
            status: 'sent',
            invited_by: invitedBy,
          });

        successCount++;
        results.push({ email, success: true });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${email}:`, emailError);
        failedCount++;
        results.push({ email, success: false, error: emailError.message });

        // Log failed attempt
        await supabase
          .from('invite_logs')
          .insert({
            email,
            invite_type: inviteType,
            status: 'failed',
            invited_by: invitedBy,
          });
      }
    }

    console.log(`Invite emails completed: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failedCount,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
