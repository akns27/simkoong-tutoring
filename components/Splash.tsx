import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashProps {
  onStart: () => void;
}

const Splash: React.FC<SplashProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-violet-600 to-purple-400 text-white p-6 relative overflow-hidden">
      
      {/* Decorative Circles */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-10 right-[-20px] w-60 h-60 bg-indigo-500 rounded-full opacity-30 blur-3xl"></div>

      <div className="z-10 flex flex-col items-center animate-fade-in text-center">
        <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm mb-8 shadow-xl border border-white/30">
            <Sparkles size={64} className="text-yellow-300 drop-shadow-md" />
        </div>
        
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">심쿵과외</h1>
        <p className="text-purple-100 text-lg mb-10 font-medium">최애와 함께하는<br/>심쿵 일본어 과외 💜</p>

        <button 
          onClick={onStart}
          className="group relative flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:bg-purple-50 transition-all duration-300 w-full max-w-xs"
        >
          <span className="mr-2">시작하기</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-6 text-xs text-purple-200 opacity-60">
        by Kangwon Park
      </div>
    </div>
  );
};

export default Splash;