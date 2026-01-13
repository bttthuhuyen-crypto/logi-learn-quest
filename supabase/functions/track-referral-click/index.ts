import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { referral_code, landing_page } = await req.json();

    if (!referral_code) {
      console.log('No referral code provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No referral code provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Tracking click for referral code: ${referral_code}`);

    // Get the affiliate link by referral code
    const { data: affiliateLink, error: linkError } = await supabase
      .from('affiliate_links')
      .select('id, user_id')
      .eq('referral_code', referral_code)
      .single();

    if (linkError || !affiliateLink) {
      console.log(`Invalid referral code: ${referral_code}`, linkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid referral code' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get client info from headers
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    console.log(`Recording click - IP: ${ip_address}, Landing: ${landing_page}`);

    // Record the click
    const { error: insertError } = await supabase
      .from('referral_clicks')
      .insert({
        affiliate_link_id: affiliateLink.id,
        ip_address,
        user_agent,
        landing_page: landing_page || '/',
      });

    if (insertError) {
      console.error('Error recording click:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record click' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Click recorded successfully for affiliate: ${affiliateLink.user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        affiliate_id: affiliateLink.user_id,
        message: 'Click tracked successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in track-referral-click:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
