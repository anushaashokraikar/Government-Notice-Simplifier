import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/AuthContext';
import { logOut } from '@/lib/firebase';
import { motion } from 'motion/react';
import { User, Mail, Briefcase, MapPin, Globe, LogOut, Settings, Shield, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const infoItems = [
    { icon: Briefcase, label: 'Profession', value: profile?.profession || 'Not set' },
    { icon: MapPin, label: 'Location', value: profile?.state || 'Not set' },
    { icon: Globe, label: 'Language', value: profile?.preferredLanguage || 'English' },
    { icon: Mail, label: 'Email', value: user?.email || 'No email' },
  ];

  return (
    <Layout title="Profile">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Card */}
        <Card className="p-8 border-none bg-white rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-indigo-600" />
          
          <div className="relative z-10 pt-16 flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 border-4 border-white shadow-2xl mb-6">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-4xl font-bold">
                 {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="font-display font-black text-3xl text-slate-900">{profile?.name || 'Citizen'}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{profile?.profession || 'Member'}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
             {infoItems.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <item.icon className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-black tracking-wider">{item.label}</span>
                   </div>
                   <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                </div>
             ))}
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100 space-y-3">
             <Button 
               variant="outline" 
               className="w-full h-14 rounded-2xl border-slate-200 text-slate-700 flex items-center justify-between px-6 hover:bg-slate-50"
             >
                <div className="flex items-center gap-3">
                   <Bell className="w-5 h-5 text-indigo-600" />
                   <span className="font-bold">Notifications</span>
                </div>
                <div className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase">Enabled</div>
             </Button>

             <Button 
               variant="outline" 
               className="w-full h-14 rounded-2xl border-slate-200 text-slate-700 flex items-center justify-between px-6 hover:bg-slate-50"
             >
                <div className="flex items-center gap-3">
                   <Shield className="w-5 h-5 text-indigo-600" />
                   <span className="font-bold">Data Privacy</span>
                </div>
                <Settings className="w-4 h-4 text-slate-300" />
             </Button>

             <Button 
               onClick={handleLogout}
               variant="ghost" 
               className="w-full h-14 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold flex items-center gap-3 justify-center mt-6 transition-all"
             >
                <LogOut className="w-5 h-5" />
                Sign Out
             </Button>
          </div>
        </Card>

        {/* Support Section */}
        <section className="text-center">
            <p className="text-slate-400 text-xs mb-4">Version 1.0.0 (Global Beta)</p>
            <div className="flex justify-center gap-6 opacity-40">
                <Shield className="w-8 h-8" />
                <Settings className="w-8 h-8" />
                <User className="w-8 h-8" />
            </div>
        </section>
      </div>
    </Layout>
  );
}
