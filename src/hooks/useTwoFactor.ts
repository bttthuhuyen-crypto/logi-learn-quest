import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TwoFactorState {
  isEnabled: boolean;
  isEnrolling: boolean;
  isVerifying: boolean;
  isDisabling: boolean;
  qrCode: string | null;
  secret: string | null;
  factorId: string | null;
}

export function useTwoFactor() {
  const [state, setState] = useState<TwoFactorState>({
    isEnabled: false,
    isEnrolling: false,
    isVerifying: false,
    isDisabling: false,
    qrCode: null,
    secret: null,
    factorId: null,
  });

  const checkMFAStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totpFactor = data?.totp?.find(f => f.status === 'verified');
      setState(prev => ({
        ...prev,
        isEnabled: !!totpFactor,
        factorId: totpFactor?.id || null,
      }));
      
      return !!totpFactor;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }, []);

  const startEnrollment = useCallback(async () => {
    setState(prev => ({ ...prev, isEnrolling: true }));
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        isEnrolling: false,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
      }));
      
      return data;
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      setState(prev => ({ ...prev, isEnrolling: false }));
      throw error;
    }
  }, []);

  const verifyAndActivate = useCallback(async (code: string) => {
    if (!state.factorId) {
      throw new Error('No factor ID available');
    }
    
    setState(prev => ({ ...prev, isVerifying: true }));
    
    try {
      // First challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: state.factorId,
      });
      
      if (challengeError) throw challengeError;
      
      // Then verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: state.factorId,
        challengeId: challengeData.id,
        code,
      });
      
      if (verifyError) throw verifyError;
      
      setState(prev => ({
        ...prev,
        isVerifying: false,
        isEnabled: true,
        qrCode: null,
        secret: null,
      }));
      
      return true;
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setState(prev => ({ ...prev, isVerifying: false }));
      throw error;
    }
  }, [state.factorId]);

  const disable2FA = useCallback(async () => {
    if (!state.factorId) {
      throw new Error('No factor ID available');
    }
    
    setState(prev => ({ ...prev, isDisabling: true }));
    
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: state.factorId,
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        isDisabling: false,
        isEnabled: false,
        factorId: null,
      }));
      
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      setState(prev => ({ ...prev, isDisabling: false }));
      throw error;
    }
  }, [state.factorId]);

  const cancelEnrollment = useCallback(() => {
    setState(prev => ({
      ...prev,
      qrCode: null,
      secret: null,
      isEnrolling: false,
    }));
  }, []);

  return {
    ...state,
    checkMFAStatus,
    startEnrollment,
    verifyAndActivate,
    disable2FA,
    cancelEnrollment,
  };
}
