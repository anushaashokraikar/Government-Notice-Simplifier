import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, getDoc, collection, onSnapshot, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar, FileText, CheckCircle2, ChevronLeft, AlertCircle, Bookmark, Share2, CornerRightDown, Volume2, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function NoticeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!id || !user) return;
    const fetchNotice = async () => {
      const docRef = doc(db, 'notices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== user.uid) {
          navigate('/dashboard');
          return;
        }
        setNotice({ id: docSnap.id, ...data });
      } else {
        navigate('/dashboard');
      }
      setLoading(false);
    };

    const q = query(
      collection(db, 'notices', id, 'tasks'), 
      orderBy('createdAt', 'asc')
    );
    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    fetchNotice();
    return () => unsubscribeTasks();
  }, [id, navigate, user]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'notices', id, 'tasks', taskId), {
        completed: !currentStatus
      });
      
      if (!currentStatus) {
        toast.success("Task completed!");
        
        setTimeout(() => {
          if (activeStep < tasks.length - 1) {
            setActiveStep(prev => prev + 1);
          }
        }, 800);

        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
        const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
        
        if (allCompleted) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#10b981', '#f59e0b']
          });
          toast("🎉 All tasks completed! You're good to go.", {
            description: "Checklist finished for this notice.",
          });
        }
      } else {
        toast.info("Task marked as pending");
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error("Could not update task status.");
    }
  };

  const [activeStep, setActiveStep] = useState(0);
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const nextStep = () => {
    if (activeStep < tasks.length - 1) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><p>Loading notice details...</p></div></Layout>;
  if (!notice) return null;

  const activeTask = tasks[activeStep];

  return (
    <Layout context={notice ? `Notice Title: ${notice.title}\nAuthority: ${notice.authority}\nAnalysis: ${notice.summary}\nExplanation: ${notice.simplifiedExplanation}` : undefined}>
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
             <Button variant="ghost" className="p-0 hover:bg-transparent text-slate-500 font-bold" onClick={() => navigate('/dashboard')}>
               <ChevronLeft className="w-5 h-5 mr-1" />
               BACK TO DASHBOARD
             </Button>
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-100/50 backdrop-blur-sm text-indigo-700 hover:bg-indigo-100 border-none px-3 font-bold uppercase tracking-widest text-[10px]">{notice.authority}</Badge>
                  {notice.deadline && (
                    <Badge className="bg-orange-100/50 backdrop-blur-sm text-orange-700 hover:bg-orange-100 border-none px-3 flex items-center gap-1 font-bold uppercase tracking-widest text-[10px]">
                      <Calendar className="w-3 h-3" />
                      {notice.deadline}
                    </Badge>
                  )}
                </div>
                <h1 className="font-display font-black text-3xl md:text-5xl text-slate-900 leading-tight tracking-tight">{notice.title}</h1>
             </div>
          </div>
          <div className="flex gap-3 shrink-0">
             <Button size="icon" variant="outline" className="rounded-2xl h-14 w-14 border-white bg-white/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all">
               <Bookmark className="w-6 h-6 text-slate-600" />
             </Button>
             <Button size="icon" variant="outline" className="rounded-2xl h-14 w-14 border-white bg-white/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all">
               <Share2 className="w-6 h-6 text-slate-600" />
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative pb-20">
          <div className="md:col-span-8 space-y-8 md:order-1">
            {/* Quick Summary */}
            <Card className="p-8 border-none bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-black text-2xl flex items-center gap-3">
                      <AlertCircle className="w-8 h-8 opacity-80" />
                      Quick Analysis
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => speak(notice.summary)}
                    >
                      <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse")} />
                    </Button>
                 </div>
                 <p className="text-xl md:text-2xl text-indigo-50 font-black leading-tight tracking-tight">
                    {notice.summary}
                 </p>
               </div>
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <CornerRightDown className="w-48 h-48" />
               </div>
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
            </Card>

            {/* Simplified Explanation */}
            <section className="space-y-6">
              <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                Simplified Explanation
              </h3>
              <Card className="p-10 border-none shadow-xl bg-white/60 backdrop-blur-md rounded-[3rem] leading-relaxed text-slate-700 space-y-8 border border-white">
                 <div className="prose prose-indigo max-w-none">
                    <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed">{notice.simplifiedExplanation}</p>
                 </div>
                 
                 <div className="pt-8 border-t border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                    <h4 className="font-black text-slate-400 mb-4 flex items-center gap-3 uppercase tracking-[0.2em] text-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Who is Eligible?
                    </h4>
                    <p className="text-slate-900 font-bold text-lg leading-tight">{notice.eligibility}</p>
                   </div>
                   <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 px-6 border-slate-200 font-black text-xs tracking-widest uppercase hover:bg-slate-50 shrink-0"
                    onClick={() => speak(`Eligibility: ${notice.eligibility}. Explanation: ${notice.simplifiedExplanation}`)}
                   >
                     <Volume2 className="w-5 h-5 mr-2" />
                     LISTEN
                   </Button>
                 </div>
              </Card>
            </section>

            {/* Required Documents */}
            {notice.requiredDocuments?.length > 0 && (
              <section className="space-y-6">
                <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight">Documents Needed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notice.requiredDocuments.map((doc: string, i: number) => (
                    <Card key={`doc-${i}`} className="p-6 border-none shadow-lg bg-white/40 backdrop-blur-sm rounded-3xl flex items-center gap-4 hover:shadow-xl transition-all hover:-translate-y-1 group">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                         <FileText className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                       </div>
                       <span className="text-sm font-black text-slate-800 uppercase tracking-wide">{doc}</span>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="md:col-span-4 space-y-8 md:order-2">
            {/* Action Checklist Container */}
            <Card className="p-8 border-none shadow-2xl bg-white/90 backdrop-blur-xl rounded-[3rem] md:sticky md:top-24 flex flex-col overflow-hidden border border-white/50 min-h-[450px]">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-2xl tracking-tight">
                    {showFullChecklist ? 'Full List' : 'Step-by-Step'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFullChecklist(!showFullChecklist)}
                    className="font-black text-[10px] tracking-widest uppercase text-indigo-600 hover:text-indigo-700 bg-indigo-50/50"
                  >
                    {showFullChecklist ? 'SHOW SLIDER' : 'SEE ALL'}
                  </Button>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                {!showFullChecklist && tasks.length > 0 && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    STEP {activeStep + 1} OF {tasks.length}
                  </p>
                )}
              </div>

              <div className="flex-1 flex flex-col pt-2">
                {tasks.length > 0 ? (
                  showFullChecklist ? (
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                       <div className="space-y-3 pb-4">
                          {tasks.map((task, i) => (
                            <div 
                              key={task.id}
                              onClick={() => {
                                toggleTask(task.id, task.completed);
                              }}
                              className={cn(
                                "p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all",
                                task.completed ? "bg-slate-50 border-transparent opacity-60" : "bg-white border-slate-100 shadow-sm"
                              )}
                            >
                               <div className={cn(
                                 "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                 task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                               )}>
                                 {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                               </div>
                               <span className={cn(
                                 "text-sm font-bold truncate",
                                 task.completed ? "text-slate-400 line-through" : "text-slate-900"
                               )}>
                                 {task.title}
                               </span>
                            </div>
                          ))}
                       </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={activeStep}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6 flex-1"
                        >
                          {activeTask && (
                            <div className="space-y-4">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                activeTask.completed 
                                  ? "bg-emerald-500 text-white shadow-emerald-200" 
                                  : "bg-indigo-600 text-white shadow-indigo-200"
                              )}>
                                {activeTask.completed ? <CheckCircle2 className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className={cn(
                                  "font-black text-2xl leading-tight transition-all tracking-tight",
                                  activeTask.completed ? "text-slate-400 line-through" : "text-slate-900"
                                )}>
                                  {activeTask.title}
                                </h4>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                  {activeTask.description || "Action required for completion of this notice sequence."}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="rounded-full font-black text-[10px] tracking-widest px-3 border-indigo-100 text-indigo-600 bg-indigo-50/30">
                                   {activeTask.type || 'OFFICIAL'}
                                </Badge>
                                {activeTask.completed && (
                                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none rounded-full font-black text-[10px] tracking-widest px-3">
                                     COMPLETED
                                  </Badge>
                                )}
                              </div>

                              <Button 
                                onClick={() => toggleTask(activeTask.id, activeTask.completed)}
                                className={cn(
                                  "w-full h-16 rounded-[2rem] font-black text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 group",
                                  activeTask.completed 
                                    ? "bg-slate-200 text-slate-500 hover:bg-slate-300 shadow-none" 
                                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                                )}
                              >
                                {activeTask.completed ? 'RESTORE ITEM' : 'COMPLETE THIS STEP'}
                                {!activeTask.completed && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      <div className="flex items-center gap-3 mt-auto pt-6 border-t border-slate-100">
                        <Button 
                          variant="outline" 
                          onClick={prevStep}
                          disabled={activeStep === 0}
                          className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 disabled:opacity-30"
                        >
                          BACK
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={nextStep}
                          disabled={activeStep === tasks.length - 1}
                          className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-[10px] tracking-widest uppercase hover:bg-slate-50 disabled:opacity-30"
                        >
                          NEXT
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                     <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center animate-pulse">
                        <Zap className="w-10 h-10 text-slate-300" />
                     </div>
                     <div>
                        <h4 className="font-black text-lg text-slate-900 mb-1">Processing Actions</h4>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sahaay is extracting steps...</p>
                     </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
