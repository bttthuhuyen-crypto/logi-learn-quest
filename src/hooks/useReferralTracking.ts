import { useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_COOKIE_KEY = 'affiliate_ref';
const REFERRAL_COOKIE_DAYS = 14; // Cookie duration in days

export const useReferralTracking = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get stored referral code from cookie/localStorage
  const getStoredReferral = useCallback((): string | null => {
    // Try localStorage first (more reliable)
    const stored = localStorage.getItem(REFERRAL_COOKIE_KEY);
    if (stored) {
      try {
        const { code, expires } = JSON.parse(stored);
        if (new Date(expires) > new Date()) {
          return code;
        }
        // Expired, remove it
        localStorage.removeItem(REFERRAL_COOKIE_KEY);
      } catch {
        localStorage.removeItem(REFERRAL_COOKIE_KEY);
      }
    }
    return null;
  }, []);

  // Store referral code
  const storeReferral = useCallback((code: string) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + REFERRAL_COOKIE_DAYS);
    
    localStorage.setItem(REFERRAL_COOKIE_KEY, JSON.stringify({
      code,
      expires: expires.toISOString(),
      storedAt: new Date().toISOString(),
    }));

    console.log(`Stored referral code: ${code}, expires: ${expires.toISOString()}`);
  }, []);

  // Clear stored referral (after successful attribution)
  const clearReferral = useCallback(() => {
    localStorage.removeItem(REFERRAL_COOKIE_KEY);
  }, []);

  // Track click via edge function
  const trackClick = useCallback(async (referralCode: string) => {
    try {
      console.log(`Tracking click for code: ${referralCode}`);
      
      const { data, error } = await supabase.functions.invoke('track-referral-click', {
        body: {
          referral_code: referralCode,
          landing_page: location.pathname + location.search,
        },
      });

      if (error) {
        console.error('Error tracking referral click:', error);
        return false;
      }

      console.log('Click tracked successfully:', data);
      return true;
    } catch (err) {
      console.error('Failed to track referral click:', err);
      return false;
    }
  }, [location.pathname, location.search]);

  // Check for referral code in URL on mount and route changes
  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      console.log(`Detected referral code in URL: ${refCode}`);
      
      // Store the referral code (overwrites previous - last-touch attribution)
      storeReferral(refCode);
      
      // Track the click
      trackClick(refCode);
      
      // Clean up URL without causing a navigation
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, storeReferral, trackClick]);

  return {
    getStoredReferral,
    storeReferral,
    clearReferral,
    trackClick,
  };
};

// Export utility functions for use outside of React components
export const getReferralCode = (): string | null => {
  const stored = localStorage.getItem(REFERRAL_COOKIE_KEY);
  if (stored) {
    try {
      const { code, expires } = JSON.parse(stored);
      if (new Date(expires) > new Date()) {
        return code;
      }
      localStorage.removeItem(REFERRAL_COOKIE_KEY);
    } catch {
      localStorage.removeItem(REFERRAL_COOKIE_KEY);
    }
  }
  return null;
};

export const clearReferralCode = () => {
  localStorage.removeItem(REFERRAL_COOKIE_KEY);
};
