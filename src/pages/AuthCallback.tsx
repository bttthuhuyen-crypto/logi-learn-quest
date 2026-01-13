import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== AUTH CALLBACK DEBUG ===');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search params:', window.location.search);

        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Session:', session);
        console.log('Error:', error);

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (session) {
          console.log('Session found, redirecting to home...');
          navigate('/');
        } else {
          console.log('No session, redirecting to auth...');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        navigate('/auth?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-lg text-muted-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
