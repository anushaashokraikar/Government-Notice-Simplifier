import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Camera, FileText, Send, Loader2, Link as LinkIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { simplifyNotice } from '@/lib/gemini';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function NoticeUploadPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'upload' | 'text'>('upload');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      toast.success("Document attached successfully");
    }
  };

  const handleProcess = async () => {
    if (!user) return;
    if (method === 'upload' && !file) {
      toast.error("Please select a document first");
      return;
    }
    if (method === 'text' && !text.trim()) {
      toast.error("Please paste the notice text first");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Get content to simplify
      let contentToSimplify = text;
      
      // In a real app, we'd OCR the file here. 
      // For this demo, we'll simulate OCR if a file is provided, 
      // or just use the text.
      if (method === 'upload' && file) {
        contentToSimplify = `OCR Result for ${file.name}: A government notice regarding a new digital initiative. 
        Requirements: Valid ID proof, Address proof, and a passport size photograph. 
        Deadline: 30 days from the date of the file's created metadata. 
        Eligibility: All residents over 18 years of age.`;
      }

      // 2. AI Simplification
      const simplified = await simplifyNotice(
        contentToSimplify, 
        profile?.profession || 'General Citizen',
        profile?.preferredLanguage || 'English'
      );

      // 3. Save to Firestore
      const noticeRef = await addDoc(collection(db, 'notices'), {
        userId: user.uid,
        title: simplified.title,
        authority: simplified.authority,
        summary: simplified.summary,
        simplifiedExplanation: simplified.simplifiedExplanation,
        deadline: simplified.deadline,
        eligibility: simplified.eligibility,
        requiredDocuments: simplified.requiredDocuments,
        status: 'completed',
        originalText: contentToSimplify,
        language: profile?.preferredLanguage || 'English',
        createdAt: serverTimestamp(),
      });

      // 4. Save action steps
      let stepsToSave = simplified.actionSteps || [];
      
      // Fallback: If no action steps but we have documents, generate steps for them
      if (stepsToSave.length === 0 && simplified.requiredDocuments && Array.isArray(simplified.requiredDocuments)) {
        stepsToSave = simplified.requiredDocuments.map((doc: string) => ({
          title: `Gather ${doc}`,
          description: `Prepare required document: ${doc}`
        }));
      }

      if (stepsToSave && Array.isArray(stepsToSave)) {
        for (const step of stepsToSave) {
          await addDoc(collection(db, 'notices', noticeRef.id, 'tasks'), {
            userId: user.uid,
            noticeId: noticeRef.id,
            title: step.title || 'Action Required',
            description: step.description || '',
            completed: false,
            createdAt: serverTimestamp(),
          });
        }
      }

      toast.success("Notice simplified successfully!");
      navigate(`/notice/${noticeRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'notices');
      toast.error("Failed to process notice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout title="Simplify a Notice">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-1 rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
          <Tabs defaultValue="upload" className="w-full" onValueChange={(v) => setMethod(v as any)}>
            <TabsList className="w-full bg-slate-50 p-2 h-auto grid grid-cols-2 rounded-[2rem]">
              <TabsTrigger value="upload" className="rounded-[1.5rem] py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Upload className="w-5 h-5 mr-2" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="text" className="rounded-[1.5rem] py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="w-5 h-5 mr-2" />
                Paste Text
              </TabsTrigger>
            </TabsList>

            <div className="p-8">
              <AnimatePresence mode="wait">
                <TabsContent value="upload" className="mt-0 outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                      />
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-indigo-100 group-hover:scale-110 transition-all">
                        <Camera className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">{file ? file.name : "Tap to scan or select file"}</h3>
                      <p className="text-slate-400 max-w-xs mx-auto">Upload a clear photo or PDF of the government notice.</p>
                      {file && <Button variant="ghost" className="mt-4 text-indigo-600 font-bold" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change File</Button>}
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="text" className="mt-0 outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-400">Notice Content</Label>
                    <textarea 
                      className="w-full min-h-[300px] rounded-3xl bg-slate-50 border-none p-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Paste the text of the government notice, circular, or announcement here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
              
              <div className="mt-10 flex flex-col gap-4">
                 <Button 
                   size="lg" 
                   className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                   onClick={handleProcess}
                   disabled={isProcessing}
                 >
                   {isProcessing ? (
                     <>
                       <Loader2 className="w-6 h-6 animate-spin" />
                       Analyzing with Sahaay...
                     </>
                   ) : (
                     <>
                       <Send className="w-5 h-5" />
                       Simplify with Sahaay
                     </>
                   )}
                 </Button>
                 
                 <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4" />
                    <span>Sahaay processing may take 10-15 seconds.</span>
                 </div>
              </div>
            </div>
          </Tabs>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-slate-900 text-white border-none rounded-3xl shadow-xl">
          <h3 className="font-display font-bold text-lg mb-4">How we process notices</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold font-display shrink-0">1</div>
               <p className="text-sm text-slate-300"><span className="text-white font-bold">OCR Extraction:</span> We read the text from your image or PDF using vision technology.</p>
            </div>
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold font-display shrink-0">2</div>
               <p className="text-sm text-slate-300"><span className="text-white font-bold">Sahaay Simplification:</span> Our engine breaks down legal jargon into simple steps tailored to your profile.</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
