import React, { useState, useRef, useEffect } from 'react';
import { Tutor, AnalysisResult, CourseMode, TTSSettings } from '../types';
import { analyzeSentence } from '../services/geminiService';
import { Send, BookOpen, Volume2, Sparkles, Brain, Loader2, UserPlus, GraduationCap, ArrowRight, HelpCircle, Settings } from 'lucide-react';
import TTSSettingsModal from './TTSSettingsModal';

interface ChatInterfaceProps {
  tutors: Tutor[];
  mode: CourseMode;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onGoToQuiz: () => void;
  onManageTutors: () => void;
  history: AnalysisResult[];
}

const BASIC_COURSES = [
  { text: "おはよう", label: "안녕 (아침 인사)" },
  { text: "おやすみ", label: "잘 자 (밤 인사)" },
  { text: "いってきます", label: "다녀오겠습니다" },
  { text: "ただいま", label: "다녀왔습니다" },
  { text: "ありがとう", label: "고마워 (감사)" },
  { text: "すみません", label: "죄송합니다 / 저기요" },
  { text: "これください", label: "이거 주세요 (주문)" },
  { text: "わかりました", label: "알겠습니다 (이해)" }
];

const TTS_STORAGE_KEY = 'simkung_tts_settings';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ tutors, mode, onAnalysisComplete, onGoToQuiz, onManageTutors, history }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>(() => {
    try {
        const saved = localStorage.getItem(TTS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch(e) {
        console.error("Failed to load TTS settings", e);
    }
    return { voiceURI: '', rate: 1.0, pitch: 1.0 };
  });

  const handleSaveSettings = (settings: TTSSettings) => {
    setTtsSettings(settings);
    try {
        localStorage.setItem(TTS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save TTS settings", e);
    }
  };

  const handleAnalyze = async (text: string = inputText) => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const result = await analyzeSentence(text, tutors);
      onAnalysisComplete(result);
      setInputText('');
    } catch (e) {
      alert("분석에 실패했어요. 다시 시도해주세요!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = ttsSettings.rate;
        utterance.pitch = ttsSettings.pitch;
        
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find the user selected voice
        let selectedVoice = voices.find(v => v.voiceURI === ttsSettings.voiceURI);
        
        // Fallback 1: Try to find the exact same voice by name if URI changed (sometimes happens)
        if (!selectedVoice && ttsSettings.voiceURI) {
             const voiceName = voices.find(v => v.name === ttsSettings.voiceURI); // Assuming user saved name implicitly? No, URI is safer, but fallback to any JA if missing.
        }
        
        // Fallback 2: Any Japanese voice
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.includes('ja') || voice.lang.includes('JP'));
        }

        if (selectedVoice) utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const getTutorById = (id: string) => {
      return tutors.find(t => t.id === id) || tutors.find(t => t.name === id);
  };

  const isLastMessage = (idx: number) => idx === history.length - 1;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Settings Modal */}
      <TTSSettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={ttsSettings}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${mode === 'basic' ? 'bg-green-100' : 'bg-purple-100'}`}>
                {mode === 'basic' ? <GraduationCap size={20} className="text-green-600"/> : <Brain size={20} className="text-purple-600"/>}
            </div>
            <div>
                <h1 className="font-bold text-slate-800">{mode === 'basic' ? '기초 코스' : '자율 학습'}</h1>
                <p className="text-xs text-slate-500">{tutors.length}명의 튜터와 함께</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title="목소리 설정"
            >
                <Settings size={20} />
            </button>
            <button 
                onClick={onManageTutors}
                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title="튜터 관리"
            >
                <UserPlus size={20} />
            </button>
            <button 
                onClick={onGoToQuiz}
                disabled={history.length === 0}
                className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-md hover:opacity-90 disabled:opacity-50"
            >
                퀴즈 풀기
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-70">
            {mode === 'basic' ? (
                <div className="w-full max-w-sm px-4">
                    <p className="text-center mb-6 font-bold text-slate-500">학습할 표현을 선택해주세요</p>
                    <div className="grid grid-cols-2 gap-3">
                        {BASIC_COURSES.map((course, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleAnalyze(course.text)}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-green-400 hover:text-green-600 text-left transition-all group"
                            >
                                <span className="block font-bold text-lg text-slate-800 group-hover:text-green-600">{course.text}</span>
                                <span className="text-xs text-slate-500">{course.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <BookOpen size={48} />
                    <p className="text-center font-medium">일본어 문장이나 단어를 입력해보세요!<br/>튜터들이 친절하게 알려줄 거예요.</p>
                </>
            )}
          </div>
        )}

        {history.map((item, idx) => (
          <div key={idx} className="space-y-6 animate-fade-in">
            {/* User Input Bubble */}
            <div className="flex justify-end">
                <div className="bg-purple-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md max-w-[85%]">
                    <p className="text-lg font-medium">{item.originalText}</p>
                </div>
            </div>

            {/* Analysis Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-50 overflow-hidden">
                <div className="bg-purple-50 px-4 py-2 border-b border-purple-100 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    <span className="text-sm font-bold text-purple-700">단어 분석</span>
                </div>
                <div className="p-2 grid gap-2">
                    {item.words.map((word, wIdx) => (
                        <div key={wIdx} className="flex items-center bg-white p-2 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
                            <div className="w-20 text-center flex-shrink-0">
                                <span className="block text-[10px] text-slate-500 leading-tight mb-1">{word.type}</span>
                                <span className="block text-lg font-bold text-slate-800 break-words">{word.word}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100 mx-3"></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-purple-600">{word.reading}</span>
                                    <span className="text-xs text-slate-400">[{word.romaji}]</span>
                                </div>
                                <p className="text-sm text-slate-600 truncate">{word.meaning}</p>
                            </div>
                            <button 
                                onClick={() => handleSpeak(word.word)}
                                className="p-2 text-slate-300 hover:text-purple-500 active:scale-90 transition-transform flex-shrink-0"
                                title="듣기"
                            >
                                <Volume2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tutor Roleplay */}
            <div className="space-y-3 pl-2">
                <p className="text-xs font-bold text-slate-400 ml-2 mb-1">MEMBERS TALK</p>
                {item.dialogue.map((line, dIdx) => {
                    const tutor = getTutorById(line.tutorId);
                    return (
                        <div key={dIdx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                {tutor ? (
                                     <img 
                                        src={tutor.imageUrl || `https://picsum.photos/seed/${tutor.avatarSeed}/50/50`} 
                                        className="w-10 h-10 rounded-full border border-slate-200 shadow-sm object-cover" 
                                        alt={line.tutorName} 
                                     />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">?</div>
                                )}
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%]">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <p className="text-sm font-bold text-purple-700">{line.tutorName}</p>
                                    {line.tutorAge && (
                                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium">{line.tutorAge}</span>
                                    )}
                                </div>
                                {/* Japanese Text */}
                                <p className="text-slate-900 font-bold text-lg mb-1 leading-snug">{line.text}</p>
                                {/* Pronunciation Reading */}
                                <p className="text-purple-500 text-xs mb-2 font-medium">{line.reading}</p>
                                {/* Translation */}
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <p className="text-slate-600 text-sm">{line.translation}</p>
                                </div>
                                <button 
                                    onClick={() => handleSpeak(line.text)}
                                    className="mt-2 text-slate-300 hover:text-purple-500 flex items-center gap-1 text-[10px] bg-white border border-slate-100 px-2 py-1 rounded-full w-fit transition-colors"
                                >
                                    <Volume2 size={12} />
                                    <span>듣기</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Next Step Options */}
            {isLastMessage(idx) && mode === 'basic' && !isLoading && (
                <div className="flex flex-col gap-2 mt-4 animate-fade-in">
                    <p className="text-center text-xs text-slate-400 mb-1">학습이 끝났습니다. 무엇을 할까요?</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => inputRef.current?.focus()}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                            <HelpCircle size={16} />
                            <span>궁금한 점 물어보기</span>
                        </button>
                        
                        {item.nextSuggestion ? (
                            <button 
                                onClick={() => handleAnalyze(item.nextSuggestion!.text)}
                                className="flex-1 bg-green-500 text-white py-3 px-2 rounded-xl font-bold text-sm shadow-md hover:bg-green-600 flex items-center justify-between gap-2 text-left"
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="truncate">다음: {item.nextSuggestion.text}</span>
                                    <span className="text-[10px] text-green-100 font-normal truncate">({item.nextSuggestion.meaning})</span>
                                </div>
                                <ArrowRight size={16} className="flex-shrink-0" />
                            </button>
                        ) : (
                           // Fallback to random basic if AI fails to suggest (should rarely happen)
                           <button 
                                onClick={() => handleAnalyze(BASIC_COURSES[Math.floor(Math.random() * BASIC_COURSES.length)].text)}
                                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-green-600 flex items-center justify-center gap-2"
                            >
                                <span>다음 문장 추천받기</span>
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            <div className="w-full h-px bg-slate-200 my-4"></div>
          </div>
        ))}
        
        {isLoading && (
             <div className="flex justify-center items-center py-6">
                <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                    <Loader2 className="animate-spin text-purple-500" size={20} />
                    <span className="text-sm font-medium text-slate-600">튜터들이 생각중입니다...</span>
                </div>
             </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
            <input 
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleAnalyze(inputText)}
                placeholder="질문이나 일본어 문장을 입력하세요..."
                className="w-full bg-slate-100 text-black pl-4 pr-12 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            />
            <button 
                onClick={() => handleAnalyze(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-2 bg-purple-600 text-white rounded-xl shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;