import React, { useState, useEffect } from 'react';
import { AnalysisResult, Tutor, QuizData } from '../types';
import { generateQuiz } from '../services/geminiService';
import { Loader2, CheckCircle2, XCircle, Home, X, AlertCircle, Info } from 'lucide-react';

interface QuizInterfaceProps {
  lastContext: AnalysisResult;
  tutors: Tutor[];
  onBackToHome: () => void;
  onBackToChat: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ lastContext, tutors, onBackToHome, onBackToChat }) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await generateQuiz(lastContext, tutors);
        setQuiz(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lastContext, tutors]);

  const handleAnswer = (index: number) => {
    if (selectedOptionIndex !== null) return; 
    setSelectedOptionIndex(index);
    setIsCorrect(index === quiz?.correctAnswerIndex);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-purple-50 space-y-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-purple-600 font-bold animate-pulse">퀴즈 생성 중...</p>
      </div>
    );
  }

  if (!quiz) return <div className="p-4">퀴즈를 불러오지 못했습니다.</div>;

  const tutor = tutors.find(t => t.name === quiz.encouragement.tutorName) || tutors[0];
  const correctOption = quiz.options[quiz.correctAnswerIndex];
  const selectedOption = selectedOptionIndex !== null ? quiz.options[selectedOptionIndex] : null;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between z-10">
        <button onClick={onBackToChat} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
        </button>
        <span className="font-bold text-slate-800">Review Quiz</span>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
        <div className="w-full bg-slate-200 h-2 rounded-full mb-8">
            <div className="w-full bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"></div>
        </div>

        {/* Question Area */}
        <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-slate-800 leading-[3rem] break-keep">
                {quiz.questionParts.map((part, i) => (
                    part.isBlank ? (
                        <span key={i} className="inline-block min-w-[80px] border-b-2 border-purple-500 mx-1 text-purple-600 text-center relative top-1">
                            {selectedOptionIndex !== null ? (isCorrect ? correctOption.text : quiz.options[selectedOptionIndex!].text) : ''}
                        </span>
                    ) : (
                        <span key={i} className="relative inline-block mx-0.5 group">
                           {part.text}
                           <span className="text-xs text-slate-400 font-medium absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap mt-0.5">{part.reading}</span>
                        </span>
                    )
                ))}
            </h2>
            <p className="text-sm text-slate-500 mt-6 bg-slate-100 py-2 px-4 rounded-lg inline-block">
                {quiz.translation}
            </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mt-8">
            {quiz.options.map((option, idx) => {
                let btnClass = "w-full p-4 rounded-xl border-2 transition-all transform active:scale-95 flex items-center justify-between ";
                if (selectedOptionIndex === idx) {
                    if (isCorrect) btnClass += "bg-purple-100 border-purple-500 text-purple-700 shadow-md";
                    else btnClass += "bg-red-50 border-red-400 text-red-600";
                } else if (selectedOptionIndex !== null && idx === quiz.correctAnswerIndex) {
                     btnClass += "bg-green-50 border-green-500 text-green-700";
                } else {
                    btnClass += "bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50";
                }

                return (
                    <button 
                        key={idx} 
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOptionIndex !== null}
                        className={btnClass}
                    >
                        <span className="font-bold text-lg">{option.text}</span>
                        <span className="text-sm text-slate-400 font-medium">{option.reading}</span>
                    </button>
                );
            })}
        </div>

        {/* Feedback / Result */}
        {selectedOptionIndex !== null && (
            <div className={`mt-8 p-5 rounded-2xl animate-fade-in ${isCorrect ? 'bg-purple-600 text-white' : 'bg-white border border-red-100 shadow-lg'}`}>
                {/* Result Title */}
                <div className="flex items-center gap-2 mb-4">
                    {isCorrect ? <CheckCircle2 className="text-white" size={28} /> : <XCircle className="text-red-500" size={28} />}
                    <span className={`text-xl font-bold ${isCorrect ? 'text-white' : 'text-red-500'}`}>
                        {isCorrect ? '정답입니다!' : '아쉬워요!'}
                    </span>
                </div>

                {/* Incorrect Selection Explanation */}
                {!isCorrect && selectedOption && (
                    <div className="mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                        <div className="flex items-start gap-2">
                             <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                             <div>
                                <p className="text-xs font-bold text-red-500 mb-1">선택한 답 ({selectedOption.text}):</p>
                                <p className="text-sm text-slate-700">{selectedOption.explanation}</p>
                             </div>
                        </div>
                    </div>
                )}
                
                {/* Correct Answer Explanation (Show in both cases to reinforce) */}
                <div className={`mb-4 p-3 rounded-xl ${isCorrect ? 'bg-purple-700/50' : 'bg-green-50 border border-green-100'}`}>
                    <div className="flex items-start gap-2">
                            <Info className={`${isCorrect ? 'text-purple-200' : 'text-green-600'} flex-shrink-0 mt-0.5`} size={16} />
                            <div>
                            <p className={`text-xs font-bold mb-1 ${isCorrect ? 'text-purple-200' : 'text-green-600'}`}>
                                {isCorrect ? '해설:' : `정답 (${correctOption.text}):`}
                            </p>
                            <p className={`text-sm ${isCorrect ? 'text-white' : 'text-slate-700'}`}>
                                {correctOption.explanation}
                            </p>
                            </div>
                    </div>
                </div>

                {/* General Note */}
                <p className={`text-xs ${isCorrect ? 'text-purple-200' : 'text-slate-400'} mb-4 px-1`}>
                    💡 {quiz.explanation}
                </p>

                {/* Tutor Encouragement */}
                <div className={`mt-4 pt-4 border-t ${isCorrect ? 'border-purple-500' : 'border-slate-100'} flex items-center gap-3`}>
                     <img 
                        src={tutor?.imageUrl || `https://picsum.photos/seed/${tutor?.avatarSeed}/50/50`} 
                        className={`w-12 h-12 rounded-full border-2 ${isCorrect ? 'border-purple-300' : 'border-purple-100'} object-cover`}
                        alt={tutor?.name}
                    />
                    <div>
                        <p className={`text-xs font-bold ${isCorrect ? 'text-purple-200' : 'text-purple-500'}`}>{tutor?.name}</p>
                        <p className={`font-medium italic ${isCorrect ? 'text-white' : 'text-slate-800'}`}>"{quiz.encouragement.message}"</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
          <button 
            onClick={onBackToHome}
            className="w-full bg-purple-100 text-purple-700 font-bold py-3 rounded-xl hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>처음으로 돌아가기</span>
          </button>
      </div>
    </div>
  );
};

export default QuizInterface;