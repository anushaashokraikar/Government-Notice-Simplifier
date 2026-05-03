import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Shield, FileText, CheckCircle, Languages, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden relative">
      {/* Background Image Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07] grayscale mix-blend-multiply">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/d/df/Parliament_House_New_Delhi.jpg" 
          alt="Parliament House"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-white via-transparent to-white" />

      {/* Hero Section */}
      <header className="relative w-full py-20 px-4 md:px-10 flex flex-col items-center text-center max-w-7xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100"
        >
          <Shield className="w-4 h-4" />
          <span>Official Citizen Support Tool</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tight text-slate-900 mb-6 leading-[0.9]"
        >
          Turning Complex <br /> <span className="text-emerald-600">Notices</span> into Clear <br /> <span className="text-indigo-600">Action.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl text-slate-500 text-lg md:text-xl mb-10"
        >
          Government documents are hard to read. Sahaay extracts deadlines, eligibility, and action steps in seconds using vision intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button 
            size="lg" 
            className="h-14 px-8 rounded-full text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 group"
            onClick={() => navigate('/login')}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg">
            See How It Works
          </Button>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: FileText, title: "Sahaay Analysis", desc: "Upload PDFs or images and get a simple, jargon-free explanation." },
            { icon: CheckCircle, title: "Action Checklists", desc: "Automatically generate a list of documents and steps you need to take." },
            { icon: Bell, title: "Deadline Alerts", desc: "Never miss a government deadline again with personalized reminders." },
            { icon: Languages, title: "Regional Support", desc: "Translate any notice into your native language instantly." },
            { icon: MessageSquare, title: "Chat with Sahaay", desc: "Ask specific questions about any notice and get verified answers." },
            { icon: Shield, title: "Privacy First", desc: "Your documents are processed securely and your data remains private." },
          ].map((feature, i) => (
            <Card key={i} className="p-8 border-none bg-slate-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display font-black text-4xl text-center mb-16 underline decoration-indigo-500 underline-offset-8 decoration-4">Simple as 1-2-3</h2>
          
          <div className="space-y-12 relative">
             <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-200 hidden md:block" />
             
             {[
               { step: "01", title: "Upload your notice", desc: "Take a photo or upload a PDF of the government circular or announcement." },
               { step: "02", title: "AI Analyzes Content", desc: "Our engine extracts the 'Who, What, When' and explains it in plain language." },
               { step: "03", title: "Follow the steps", desc: "Complete your personalized checklist and get things done on time." },
             ].map((item, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="flex gap-8 items-start relative z-10"
               >
                 <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-display font-bold flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                   {item.step}
                 </div>
                 <div>
                   <h4 className="font-display font-bold text-2xl mb-2">{item.title}</h4>
                   <p className="text-slate-500 text-lg">{item.desc}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-12 px-4 text-center text-slate-400">
        <h1 className="font-display font-black text-2xl text-indigo-500 mb-6 uppercase tracking-widest">Sahaay</h1>
        <p className="max-w-md mx-auto mb-8">
          Empowering citizens through information clarity. Sahaay is your personal helper for simple governance.
        </p>
        <div className="flex justify-center gap-6 text-sm mb-8">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Contact Us</a>
        </div>
        <p className="text-xs opacity-50">© 2026 Government Notice Simplifier. All rights reserved.</p>
      </footer>
    </div>
  );
}
