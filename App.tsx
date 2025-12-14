import React, { useState } from 'react';
import { AppStep, Tutor, AnalysisResult, CourseMode } from './types';
import Splash from './components/Splash';
import TutorSetup from './components/TutorSetup';
import CourseSelection from './components/CourseSelection';
import ChatInterface from './components/ChatInterface';
import QuizInterface from './components/QuizInterface';

const TUTOR_STORAGE_KEY = 'simkung_tutors_data';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SPLASH);
  
  // Initialize tutors from local storage (empty by default)
  const [tutors, setTutors] = useState<Tutor[]>(() => {
    try {
      const saved = localStorage.getItem(TUTOR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure it's an array and not corrupted data
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error("Failed to load tutors from storage", e);
      // Clear corrupted data
      localStorage.removeItem(TUTOR_STORAGE_KEY);
      return [];
    }
  });

  const [courseMode, setCourseMode] = useState<CourseMode>('free');
  const [chatHistory, setChatHistory] = useState<AnalysisResult[]>([]);

  const handleTutorSetupComplete = (newTutors: Tutor[]) => {
    setTutors(newTutors);
    // Save to local storage
    try {
        localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(newTutors));
    } catch (e) {
        console.error("Failed to save tutors to storage", e);
    }

    // If coming from CHAT (manage tutors), go back to chat. Otherwise go to course select.
    if (chatHistory.length > 0) {
        setCurrentStep(AppStep.CHAT);
    } else {
        setCurrentStep(AppStep.COURSE_SELECT);
    }
  };

  const handleCourseSelect = (mode: CourseMode) => {
      setCourseMode(mode);
      setCurrentStep(AppStep.CHAT);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setChatHistory([...chatHistory, result]);
  };

  const resetApp = () => {
    setChatHistory([]);
    setCurrentStep(AppStep.SPLASH);
  };

  const handleManageTutors = () => {
      setCurrentStep(AppStep.SETUP);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md h-[100dvh] md:h-[850px] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {currentStep === AppStep.SPLASH && (
          <Splash onStart={() => setCurrentStep(AppStep.SETUP)} />
        )}

        {currentStep === AppStep.SETUP && (
          <TutorSetup 
            onComplete={handleTutorSetupComplete} 
            initialTutors={tutors} 
          />
        )}

        {currentStep === AppStep.COURSE_SELECT && (
            <CourseSelection onSelect={handleCourseSelect} />
        )}

        {currentStep === AppStep.CHAT && (
          <ChatInterface 
            tutors={tutors}
            mode={courseMode}
            history={chatHistory}
            onAnalysisComplete={handleAnalysisComplete}
            onGoToQuiz={() => setCurrentStep(AppStep.QUIZ)}
            onManageTutors={handleManageTutors}
          />
        )}

        {currentStep === AppStep.QUIZ && chatHistory.length > 0 && (
          <QuizInterface 
            lastContext={chatHistory[chatHistory.length - 1]}
            tutors={tutors}
            onBackToChat={() => setCurrentStep(AppStep.CHAT)}
            onBackToHome={resetApp}
          />
        )}

      </div>
    </div>
  );
};

export default App;