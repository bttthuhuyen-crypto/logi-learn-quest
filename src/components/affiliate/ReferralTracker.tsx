import { useEffect } from 'react';
import { useReferralTracking } from '@/hooks/useReferralTracking';

/**
 * Component that initializes referral tracking.
 * Detects ?ref= parameter in URL, stores it, and tracks the click.
 * Should be rendered once at app root level inside BrowserRouter.
 */
export const ReferralTracker = () => {
  // This hook handles all the detection and tracking logic
  useReferralTracking();
  
  return null; // This component doesn't render anything
};
