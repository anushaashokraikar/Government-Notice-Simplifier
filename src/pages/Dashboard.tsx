import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { FileText, Calendar, ArrowRight, Plus, AlertCircle, Clock, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notices'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredNotices = notices.filter(n => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.authority?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingDeadlines = notices
    .filter(n => n.deadline && n.status === 'completed')
    .slice(0, 3);

  const pendingActionsCount = notices.filter(n => n.status !== 'completed').length;

  return (
    <Layout title={`Namaste, ${profile?.name?.split(' ')[0] || 'Citizen'}`}>
      <div className="relative">
        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 border-none shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="md:col-span-2 space-y-6">
          <section className="grid grid-cols-2 gap-4">
            <Card className="p-6 border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden relative group rounded-[2rem]">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <FileText className="w-16 h-16 text-indigo-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Notices</p>
                <p className="text-4xl font-black text-slate-900 leading-none">{notices.length}</p>
            </Card>
            <Card className="p-6 border-none shadow-xl bg-indigo-600/90 backdrop-blur-md text-white overflow-hidden relative group rounded-[2rem]">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-16 h-16" />
                </div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">Actions Pending</p>
                <p className="text-4xl font-black text-white leading-none">{pendingActionsCount}</p>
            </Card>
          </section>

          {/* Recent Notices */}
          <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight">Your Notices</h3>
                <Link to="/upload" className="bg-white/50 backdrop-blur-md border border-slate-100 px-4 py-2 rounded-xl text-indigo-600 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center shadow-sm">
                    SIMULATE NEW <Plus className="w-4 h-4 ml-2" />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200/50 animate-pulse rounded-3xl" />)}
                </div>
            ) : filteredNotices.length === 0 ? (
                <Card className="p-10 border-dashed border-2 bg-white/30 backdrop-blur-sm border-slate-200 flex flex-col items-center text-center rounded-[3rem]">
                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                    <h4 className="font-bold text-lg mb-2">No results found</h4>
                    <p className="text-slate-500 mb-6">Try searching for something else or upload a new notice.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredNotices.map((notice, i) => (
                        <motion.div
                            key={`notice-${notice.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link to={`/notice/${notice.id}`}>
                                <Card className="p-5 border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-4 bg-white/70 backdrop-blur-md rounded-[2rem] group">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-900 truncate text-lg tracking-tight">{notice.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                            <span className="text-indigo-600">{notice.authority || 'Government'}</span>
                                            <span className="text-slate-200">•</span>
                                            <span>{notice.createdAt?.toDate ? format(notice.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}</span>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                      "rounded-full px-4 py-1 font-black text-[10px] tracking-widest border-none shadow-lg shadow-indigo-600/10 transition-all",
                                      notice.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-orange-400 text-white'
                                    )}>
                                        {notice.status?.toUpperCase()}
                                    </Badge>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
            <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[2.5rem]">
                <h3 className="font-display font-black text-xl mb-6 flex items-center gap-3 tracking-tight">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    Deadlines
                </h3>
                <div className="space-y-5">
                    {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((item) => (
                        <div key={item.id} className="flex gap-4 items-start pb-5 border-b border-slate-100 last:border-0 last:pb-0 group cursor-pointer" onClick={() => navigate(`/notice/${item.id}`)}>
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center text-[10px] font-black shrink-0 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all">
                                <Calendar className="w-5 h-5 mb-0.5" />
                                <span>SOON</span>
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-sm text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                <p className="text-[10px] text-orange-600 font-black mt-1 uppercase tracking-widest">{item.deadline}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center py-6 italic">No urgent deadlines detected.</p>
                    )}
                </div>
            </Card>

            <Card className="p-8 border-none shadow-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white relative overflow-hidden rounded-[2.5rem] group">
                <div className="relative z-10">
                    <h3 className="font-display font-black text-xl mb-3 tracking-tight">Pro Tip</h3>
                    <p className="text-sm text-indigo-50 leading-relaxed font-medium">
                        Need help understanding a scheme? Ask Sahaay! Click the chat icon in the corner to start a conversation.
                    </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            </Card>

            <Card className="p-8 border-none shadow-xl bg-indigo-50/50 backdrop-blur-sm rounded-[2.5rem]">
                <h3 className="font-display font-black text-xl mb-4 text-indigo-900 tracking-tight">Handbook</h3>
                <ul className="space-y-4">
                  {[
                    "How to verify notices",
                    "Right to Information (RTI)",
                    "Digital India Services",
                    "Grievance Redressal"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-700 cursor-pointer hover:bg-white/80 p-3 rounded-2xl transition-all shadow-sm border border-indigo-100/20">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
            </Card>
        </div>
      </div>
    </div>
    </Layout>
  );
}
