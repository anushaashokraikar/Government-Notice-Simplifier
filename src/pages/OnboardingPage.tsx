import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, ArrowLeft, User, Briefcase, MapPin, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const steps = [
  { id: 'basics', title: 'The Basics', desc: 'Tell us a bit about yourself.', icon: User },
  { id: 'profession', title: 'Profession', desc: 'This helps us tailor explanations.', icon: Briefcase },
  { id: 'location', title: 'Location', desc: 'Where do you live?', icon: MapPin },
  { id: 'language', title: 'Language', desc: 'Preferred language for notices.', icon: Globe },
];

const professions = [
  "Student", "Farmer", "Government Employee", "Small Business Owner", 
  "Senior Citizen", "Homemaker", "Job Seeker", "General Citizen", "Lawyer", "Doctor"
];

const languages = [
  "English", "Hindi", "Kannada", "Tamil", "Telugu", "Marathi", "Bengali", "Malayalam", "Gujarati"
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    profession: '',
    state: '',
    preferredLanguage: 'English',
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const finishOnboarding = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        onboarded: true,
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="w-full max-w-lg relative z-10">
        <div className="mb-12 flex justify-between items-center">
            {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 mx-1 rounded-full bg-white transition-opacity ${i <= currentStep ? 'opacity-100' : 'opacity-20'}`} 
                />
            ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center mb-6 shadow-xl">
                    <StepIcon className="w-10 h-10" />
                </div>
                <h2 className="font-display font-black text-4xl mb-2">{steps[currentStep].title}</h2>
                <p className="opacity-80 text-lg">{steps[currentStep].desc}</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl">
                {currentStep === 0 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Full Name</label>
                            <Input 
                                placeholder="e.g. John Doe" 
                                className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-indigo-500" 
                                value={formData.name}
                                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">Your Age</label>
                            <Input 
                                placeholder="Years" 
                                type="number"
                                className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-indigo-500" 
                                value={formData.age}
                                onChange={(e) => setFormData(f => ({ ...f, age: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="grid grid-cols-2 gap-3">
                        {professions.map((p) => (
                            <button
                                key={p}
                                onClick={() => setFormData(f => ({ ...f, profession: p }))}
                                className={`p-4 rounded-2xl border-2 transition-all text-sm font-bold ${
                                    formData.profession === p 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block">State or Union Territory</label>
                        <Select onValueChange={(val: string) => setFormData(f => ({ ...f, state: val }))}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-6">
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-xl">
                            {["Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Uttar Pradesh", "West Bengal"].map(s => (
                                <SelectItem key={s} value={s} className="rounded-xl focus:bg-indigo-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="grid grid-cols-2 gap-3">
                        {languages.map((l) => (
                            <button
                                key={l}
                                onClick={() => setFormData(f => ({ ...f, preferredLanguage: l }))}
                                className={`p-4 rounded-2xl border-2 transition-all text-sm font-bold ${
                                    formData.preferredLanguage === l 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex gap-4">
                    <Button 
                        disabled={currentStep === 0}
                        onClick={handleBack}
                        variant="outline"
                        className="h-14 rounded-2xl flex-1 bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Button>
                    <Button 
                        onClick={handleNext}
                        className="h-14 rounded-2xl flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
                        disabled={
                            (currentStep === 0 && (!formData.name || !formData.age)) ||
                            (currentStep === 1 && !formData.profession) ||
                            (currentStep === 2 && !formData.state) ||
                            (currentStep === 3 && !formData.preferredLanguage)
                        }
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
