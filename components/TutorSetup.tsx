import React, { useState, useRef, useEffect } from 'react';
import { Tutor } from '../types';
import { Plus, Trash2, User, Users, Smile, ChevronRight, Camera, Image as ImageIcon } from 'lucide-react';

interface TutorSetupProps {
  onComplete: (tutors: Tutor[]) => void;
  initialTutors: Tutor[];
}

const TutorSetup: React.FC<TutorSetupProps> = ({ onComplete, initialTutors }) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTutor, setNewTutor] = useState<Partial<Tutor>>({
    name: '', group: '', personality: ''
  });
  const [newTutorImage, setNewTutorImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial tutors if available (persisted state)
  // Only load if initialTutors is a non-empty array
  useEffect(() => {
    if (Array.isArray(initialTutors) && initialTutors.length > 0) {
      setTutors(initialTutors);
    } else {
      // Ensure empty state if no tutors
      setTutors([]);
    }
  }, [initialTutors]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTutorImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTutor = () => {
    if (newTutor.name && newTutor.group && newTutor.personality) {
      setTutors([...tutors, {
        id: Date.now().toString(),
        name: newTutor.name,
        group: newTutor.group,
        personality: newTutor.personality,
        avatarSeed: Math.floor(Math.random() * 1000),
        imageUrl: newTutorImage || undefined
      } as Tutor]);
      
      // Reset form
      setNewTutor({ name: '', group: '', personality: '' });
      setNewTutorImage(null);
      setIsAdding(false);
    }
  };

  const removeTutor = (id: string) => {
    setTutors(tutors.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="p-6 pb-2 bg-white shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800">튜터 설정</h2>
        <p className="text-sm text-slate-500">함께 공부할 아이돌 멤버를 등록하세요 (최대 8명)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tutors.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-70">
            <Users size={48} className="mb-2" />
            <p>등록된 튜터가 없습니다.<br/>새 튜터를 추가해주세요!</p>
          </div>
        )}

        {tutors.map((tutor) => (
          <div key={tutor.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 animate-fade-in">
            <img 
              src={tutor.imageUrl || `https://picsum.photos/seed/${tutor.avatarSeed}/100/100`} 
              alt={tutor.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-100 shadow-sm"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg">{tutor.name} <span className="text-xs font-normal text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{tutor.group}</span></h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tutor.personality}</p>
            </div>
            <button onClick={() => removeTutor(tutor.id)} className="text-slate-300 hover:text-red-400 p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 animate-fade-in">
            <div className="space-y-4">
              {/* Image Upload Area */}
              <div className="flex justify-center">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-purple-300 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:bg-slate-50 transition-colors shadow-sm"
                >
                    {newTutorImage ? (
                        <img src={newTutorImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-purple-300">
                            <Camera size={24} />
                            <span className="text-[10px] font-bold mt-1">사진 추가</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ImageIcon className="text-white" size={20} />
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                />
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-100">
                    <User size={16} className="text-purple-400" />
                    <input 
                    value={newTutor.name}
                    onChange={(e) => setNewTutor({...newTutor, name: e.target.value})}
                    placeholder="이름 (예: 사나)"
                    className="w-full bg-transparent outline-none text-sm text-black"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-100">
                    <Users size={16} className="text-purple-400" />
                    <input 
                    value={newTutor.group}
                    onChange={(e) => setNewTutor({...newTutor, group: e.target.value})}
                    placeholder="그룹 (예: 트와이스)"
                    className="w-full bg-transparent outline-none text-sm text-black"
                    />
                </div>
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-purple-100">
                    <Smile size={16} className="text-purple-400 mt-1" />
                    <textarea 
                    value={newTutor.personality}
                    onChange={(e) => setNewTutor({...newTutor, personality: e.target.value})}
                    placeholder="성격 (예: 애교쟁이, 엉뚱함, 다람쥐)"
                    className="w-full bg-transparent outline-none text-sm resize-none h-16 text-black"
                    />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                 <button 
                    onClick={() => {
                        setIsAdding(false);
                        setNewTutorImage(null);
                        setNewTutor({ name: '', group: '', personality: '' });
                    }} 
                    className="flex-1 py-3 text-sm text-slate-500 font-bold bg-white rounded-xl border border-slate-200 hover:bg-slate-50"
                 >
                    취소
                 </button>
                 <button 
                    onClick={handleAddTutor} 
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-purple-700 transition-colors"
                 >
                    추가 완료
                 </button>
              </div>
            </div>
          </div>
        ) : (
          tutors.length < 8 && (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-purple-200 rounded-2xl text-purple-400 flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
            >
              <Plus size={20} />
              <span className="font-semibold">새 튜터 추가하기</span>
            </button>
          )
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <button 
          onClick={() => onComplete(tutors)}
          disabled={tutors.length === 0 || isAdding}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <span>학습 시작하기</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TutorSetup;