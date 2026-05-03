import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, User, Bell, Search, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SahaayAssistant from './SahaayAssistant';

export default function Layout({ children, title, showNav = true, context }: { children: React.ReactNode, title?: string, showNav?: boolean, context?: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out");
      navigate('/login');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Upload, label: 'Simplify', path: '/upload' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden md:pl-64">
      {/* Creative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/40 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Government Imagery Backdrop (Subtle) */}
        <div className="absolute inset-0 opacity-[0.03] grayscale mix-blend-overlay">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/d/df/Parliament_House_New_Delhi.jpg" 
            alt="Gov Backdrop"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b p-4 flex items-center justify-between">
        <h1 className="font-display font-black text-xl text-indigo-600">Sahaay</h1>
        <div className="flex gap-4">
          <Search className="w-5 h-5 text-slate-500" />
          <Bell className="w-5 h-5 text-slate-500" />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white/70 backdrop-blur-xl border-r p-6 flex-col z-40">
        <h1 className="font-display font-black text-2xl text-indigo-600 mb-10 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">S</div>
          Sahaay
        </h1>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide",
                location.pathname === item.path 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label.toUpperCase()}
            </Link>
          ))}
        </nav>
        
        <div className="pt-6 border-t mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
          {title && (
            <header className="mb-10">
              <h2 className="font-display font-black text-4xl text-slate-900 tracking-tight">{title}</h2>
            </header>
          )}
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
             className="pb-20 md:pb-0"
          >
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-16 px-6 border-t border-slate-200/50 text-center space-y-8 bg-white/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex gap-8">
              <a href="#" className="hover:text-indigo-600 transition-all hover:-translate-y-0.5">Privacy Policy</a>
              <span className="text-slate-200 hidden md:inline">|</span>
              <a href="#" className="hover:text-indigo-600 transition-all hover:-translate-y-0.5">Terms</a>
              <span className="text-slate-200 hidden md:inline">|</span>
              <a href="#" className="hover:text-indigo-600 transition-all hover:-translate-y-0.5">Help</a>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <span className="text-lg">©</span> 2026 GOVERNMENT OF INDIA
            </p>
            <div className="flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                {/* Simulated Gov Logos */}
                <div className="w-8 h-8 rounded bg-slate-200" />
                <div className="w-8 h-8 rounded bg-slate-200" />
                <div className="w-8 h-8 rounded bg-slate-200" />
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Nav */}
      {showNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t p-2 flex justify-around items-center z-40 pb-safe">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[70px] rounded-xl transition-all",
                location.pathname === item.path ? "text-indigo-600" : "text-slate-400"
              )}
            >
              <item.icon className={cn("w-6 h-6", location.pathname === item.path && "text-indigo-600")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="activeTabOutline"
                  className="absolute -top-px left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>
      )}

      {/* Global AI Assistant */}
      <SahaayAssistant context={context} />
    </div>
  );
}
