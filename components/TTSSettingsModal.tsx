import React, { useState, useEffect } from 'react';
import { X, Play, Save, Volume2 } from 'lucide-react';
import { TTSSettings } from '../types';

interface TTSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: TTSSettings;
  onSave: (settings: TTSSettings) => void;
}

const TTSSettingsModal: React.FC<TTSSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [localSettings, setLocalSettings] = useState<TTSSettings>(currentSettings);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for Japanese voices
      const jaVoices = allVoices.filter(v => v.lang.includes('ja') || v.lang.includes('JP'));
      setVoices(jaVoices);
    };

    loadVoices();
    
    // Chrome requires this event listener to ensure voices are loaded
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Update local state when prop changes or modal opens
  useEffect(() => {
      if (isOpen) {
          setLocalSettings(currentSettings);
      }
  }, [currentSettings, isOpen]);

  const handlePreview = () => {
     const text = "こんにちは。私の声はどうですか？"; // "Hello. How is my voice?"
     window.speechSynthesis.cancel();
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.lang = 'ja-JP';
     utterance.rate = localSettings.rate;
     utterance.pitch = localSettings.pitch;
     
     const selectedVoice = voices.find(v => v.voiceURI === localSettings.voiceURI) || voices[0];
     if (selectedVoice) utterance.voice = selectedVoice;
     
     window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
      onSave(localSettings);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <Volume2 size={20} />
                    <h2 className="font-bold text-lg">목소리 설정</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-purple-500 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
                {/* Voice Selection */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">일본어 목소리 선택</label>
                    <select 
                        value={localSettings.voiceURI}
                        onChange={(e) => setLocalSettings({...localSettings, voiceURI: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    >
                        {voices.length === 0 && <option value="">일본어 음성을 찾을 수 없습니다</option>}
                        {voices.map(v => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                                {v.name} ({v.lang})
                            </option>
                        ))}
                    </select>
                    {voices.length === 0 && (
                         <p className="text-xs text-red-400 mt-1">* 기기 설정에서 일본어 음성 데이터를 확인해주세요.</p>
                    )}
                </div>

                {/* Speed Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">말하기 속도</label>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{localSettings.rate.toFixed(1)}x</span>
                    </div>
                    <input 
                        type="range" min="0.5" max="2" step="0.1"
                        value={localSettings.rate}
                        onChange={(e) => setLocalSettings({...localSettings, rate: parseFloat(e.target.value)})}
                        className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>느리게</span>
                        <span>빠르게</span>
                    </div>
                </div>

                {/* Pitch Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">목소리 높이 (톤)</label>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{localSettings.pitch.toFixed(1)}</span>
                    </div>
                    <input 
                        type="range" min="0.5" max="2" step="0.1"
                        value={localSettings.pitch}
                        onChange={(e) => setLocalSettings({...localSettings, pitch: parseFloat(e.target.value)})}
                        className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>낮음</span>
                        <span>높음</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={handlePreview}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                    >
                        <Play size={16} /> 미리듣기
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors"
                    >
                        <Save size={16} /> 저장하기
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TTSSettingsModal;