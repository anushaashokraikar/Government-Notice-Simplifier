import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Bell, Calendar, FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const urgentNotices = notices.filter(n => n.deadline || n.status !== 'completed');

  return (
    <Layout title="Your Alerts">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
            <h2 className="font-display font-black text-3xl text-slate-900 flex items-center gap-4 tracking-tight">
                <Bell className="w-8 h-8 text-indigo-600 animate-swing" />
                Action Center
            </h2>
            <p className="text-slate-500 font-medium">Notices requiring your immediate attention or upcoming deadlines.</p>
        </header>

        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200/50 animate-pulse rounded-3xl" />)}
            </div>
        ) : urgentNotices.length === 0 ? (
            <Card className="p-16 border-dashed border-2 bg-white/30 backdrop-blur-sm border-slate-200 flex flex-col items-center text-center rounded-[3rem]">
                <Bell className="w-16 h-16 text-slate-300 mb-6" />
                <h4 className="font-black text-2xl mb-2">All caught up!</h4>
                <p className="text-slate-500 max-w-xs">No pending actions or urgent deadlines detected in your notices.</p>
            </Card>
        ) : (
            <div className="space-y-6">
                {urgentNotices.map((notice, i) => (
                    <motion.div
                        key={notice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link to={`/notice/${notice.id}`}>
                            <Card className={cn(
                                "p-6 border-none shadow-xl hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center gap-6 bg-white/70 backdrop-blur-md rounded-[2.5rem] group border border-white",
                                notice.deadline ? "bg-orange-50/50 border-orange-100" : ""
                            )}>
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform",
                                    notice.deadline ? "bg-orange-500 text-white shadow-orange-500/20" : "bg-indigo-600 text-white shadow-indigo-600/20"
                                )}>
                                    {notice.deadline ? <Calendar className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{notice.title}</h4>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-3 font-bold text-[10px] tracking-widest uppercase">
                                            {notice.authority || 'Government'}
                                        </Badge>
                                        {notice.deadline && (
                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3 font-black text-[10px] tracking-widest uppercase flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                DEADLINE: {notice.deadline}
                                            </Badge>
                                        )}
                                        {notice.status !== 'completed' && (
                                            <Badge className="bg-blue-100 text-blue-700 font-black text-[10px] tracking-widest uppercase">
                                                Processing
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 font-black text-indigo-600 text-xs px-6 py-3 bg-white/50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    VIEW ACTION
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </Layout>
  );
}
