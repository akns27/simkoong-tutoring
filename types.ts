export interface Tutor {
  id: string;
  name: string;
  group: string;
  personality: string;
  avatarSeed: number; // For random consistent placeholder images
  imageUrl?: string; // Optional custom uploaded image
}

export interface WordAnalysis {
  word: string;
  reading: string; // Hiragana/Katakana
  romaji: string;
  meaning: string;
  type: string; // e.g., Noun, Verb, Particle
}

export interface DialogueLine {
  tutorId: string; // Matches Tutor ID (or 'narrator')
  tutorName: string;
  tutorAge?: string; // Inferred age of the idol
  text: string;
  reading: string; // Romaji Pronunciation of the full sentence
  translation: string;
}

export interface AnalysisResult {
  words: WordAnalysis[];
  dialogue: DialogueLine[];
  originalText: string;
  nextSuggestion?: { // Recommendation for the next step
      text: string;
      meaning: string;
  };
}

export interface QuizOption {
  text: string;
  reading: string; // Romaji
  explanation: string; // Explanation for why this specific option is correct or incorrect
}

export interface QuizData {
  questionParts: { text: string; reading: string; isBlank: boolean }[]; // Split for UI
  translation: string; // Korean translation of the full sentence
  options: QuizOption[];
  correctAnswerIndex: number;
  explanation: string; // General grammar note
  encouragement: {
    tutorName: string;
    message: string;
  };
}

export interface TTSSettings {
    voiceURI: string;
    rate: number;
    pitch: number;
}

export enum AppStep {
  SPLASH = 'splash',
  SETUP = 'setup',
  COURSE_SELECT = 'course_select',
  CHAT = 'chat',
  QUIZ = 'quiz',
}

export type CourseMode = 'basic' | 'free';