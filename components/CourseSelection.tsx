import React from 'react';
import { CourseMode } from '../types';
import { BookOpen, MessageCircle, Sparkles, ChevronRight } from 'lucide-react';

interface CourseSelectionProps {
  onSelect: (mode: CourseMode) => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 animate-fade-in">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">학습 코스 선택</h1>
        <p className="text-slate-500">원하는 학습 방식을 선택해주세요</p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Basic Course Card */}
        <button 
          onClick={() => onSelect('basic')}
          className="w-full bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-purple-200 transition-all group text-left"
        >
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 mb-1">왕초보 기초 코스</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                "잘 자", "다녀오겠습니다" 등<br/>
                실생활 필수 표현부터 차근차근 배워요.
              </p>
            </div>
            <ChevronRight className="text-slate-300 mt-2" />
          </div>
        </button>

        {/* Free Talking Card */}
        <button 
          onClick={() => onSelect('free')}
          className="w-full bg-white p-6 rounded-3xl shadow-sm border-2 border-transparent hover:border-purple-200 transition-all group text-left"
        >
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
              <MessageCircle size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 mb-1">자율 회화 코스</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                원하는 문장을 자유롭게 입력하면<br/>
                튜터들이 맞춤형으로 알려줘요.
              </p>
            </div>
            <ChevronRight className="text-slate-300 mt-2" />
          </div>
        </button>
      </div>

      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">
            <Sparkles size={14} />
            <span>언제든지 코스를 변경할 수 있어요!</span>
        </div>
      </div>
    </div>
  );
};

export default CourseSelection;