import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Chrome, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-none relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Button 
             variant="ghost" 
             className="mb-8 -ml-2 text-slate-500 hover:text-slate-900"
             onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="font-display font-black text-4xl mb-2 text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mb-10">Join thousands of citizens simplifying their government interactions.</p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-14 rounded-2xl bg-white text-slate-700 border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-sm"
            >
              <Chrome className="w-6 h-6 text-red-500" />
              Continue with Google
            </Button>
          </motion.div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure 256-bit encryption</span>
          </div>
          
          <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
            Need to use a different account? Just sign out and choose another Google account. <br /><br />
            By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}
