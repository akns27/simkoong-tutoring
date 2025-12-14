import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Tutor, AnalysisResult, QuizData } from "../types";

// Use import.meta.env for Vite, fallback to empty string
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// Analysis Schema
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The Japanese word or particle" },
          reading: { type: Type.STRING, description: "Hiragana/Katakana reading" },
          romaji: { type: Type.STRING, description: "Romaji pronunciation" },
          meaning: { type: Type.STRING, description: "Korean meaning" },
          type: { type: Type.STRING, description: "Part of speech in Korean. IMPORTANT: For conjugated forms, use the format 'Form(Pronunciation)'. Example: '동사 (て형(테형), 요청)', '동사 (ます형(마스형))'" },
        },
        required: ["word", "reading", "romaji", "meaning", "type"]
      },
    },
    dialogue: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tutorId: { type: Type.STRING, description: "The Exact ID of the tutor speaking. Use 'narrator' if it's a general explanation." },
          tutorName: { type: Type.STRING, description: "Name of the tutor" },
          tutorAge: { type: Type.STRING, description: "The real age of the idol/character (e.g. '24세'). You MUST calculate the age as of today (2024/2025) if the character is a real person." },
          text: { type: Type.STRING, description: "Japanese dialogue line. MUST BE 100% JAPANESE." },
          reading: { type: Type.STRING, description: "Romaji pronunciation of the full text (e.g., 'Arigatou gozaimasu')." },
          translation: { type: Type.STRING, description: "Korean translation" },
        },
        required: ["tutorId", "tutorName", "text", "reading", "translation"]
      },
      description: "A natural conversation (SKIT/ROLEPLAY) between the idols using the word. They should act as friends talking to each other, NOT teaching the user."
    },
    nextSuggestion: {
        type: Type.OBJECT,
        description: "A suggestion for the NEXT Basic Japanese phrase to learn after this one. It should be related or slightly more advanced.",
        properties: {
            text: { type: Type.STRING, description: "The Japanese phrase" },
            meaning: { type: Type.STRING, description: "Korean meaning" }
        },
        required: ["text", "meaning"]
    }
  },
  required: ["words", "dialogue", "nextSuggestion"],
};

// Quiz Schema
const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questionParts: {
        type: Type.ARRAY,
        description: "Split the sentence into parts to render the quiz. One part must be the blank.",
        items: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                reading: { type: Type.STRING, description: "Romaji pronunciation for this part" },
                isBlank: { type: Type.BOOLEAN, description: "True if this part should be hidden as the quiz target" }
            },
            required: ["text", "reading", "isBlank"]
        }
    },
    translation: { type: Type.STRING, description: "Korean translation of the full question sentence" },
    options: { 
        type: Type.ARRAY, 
        items: { 
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The Japanese word option" },
                reading: { type: Type.STRING, description: "Romaji pronunciation of the option" },
                explanation: { type: Type.STRING, description: "Specific explanation in Korean. If correct, why it fits. If incorrect, why it is wrong (e.g. grammar error, unnatural)." }
            },
            required: ["text", "reading", "explanation"]
        }, 
        description: "4 possible answers" 
    },
    correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct option" },
    explanation: { type: Type.STRING, description: "Brief general grammar note or rule summary in Korean" },
    encouragement: {
      type: Type.OBJECT,
      properties: {
        tutorName: { type: Type.STRING, description: "Name of one of the tutors" },
        message: { type: Type.STRING, description: "A positive reinforcement message if correct, or a gentle encouragement if wrong. MUST match personality." },
      },
      required: ["tutorName", "message"]
    }
  },
  required: ["questionParts", "translation", "options", "correctAnswerIndex", "explanation", "encouragement"],
};


export const analyzeSentence = async (text: string, tutors: Tutor[]): Promise<AnalysisResult> => {
  // Pass IDs explicitly to ensure correct image mapping later
  const tutorContext = tutors.map(t => `ID: "${t.id}", Name: "${t.name}", Group: "${t.group}", Personality: "${t.personality}"`).join('\n');
  
  const prompt = `
    Analyze the Japanese sentence: "${text}".
    
    1. Break it down.
    2. Grammar/Type Formatting Rules:
       - If it's a conjugated form, you MUST include the reading in parentheses.
       - Example 1: Instead of 'Te-form', write 'て형(테형)'.
       - Example 2: Instead of 'Masu-form', write 'ます형(마스형)'.
       - Full Example: '동사 (て형(테형), 요청)', '형용사 (과거형)'
    
    3. Dialogue Rules (MEMBERS TALK):
       - This is a SKIT/ROLEPLAY.
       - The characters already KNOW the phrase.
       - They are using it naturally in a conversation with each other.
       - Do NOT explain the meaning in the dialogue. Just use it.
       - Ensure EVERY character listed below speaks at least once. 
       - Use the EXACT ID provided in the character list for the 'tutorId' field.
       
       - **LANGUAGE STRICTNESS**: 
         - The 'text' field must be **100% Japanese**. 
         - **Do NOT mix Korean or English words into the Japanese text.**
         - Bad Example: "유우 군~ 大好き이야!" (Mixed scripts).
         - Good Example: "ユウ君〜大好きだよ！" (Pure Japanese).
         - If a word is borrowed, use Katakana.

       - **REAL AGE RETRIEVAL**: 
         - The user wants to see the REAL age of the idol.
         - You must use your internal knowledge to infer the age of the character based on their 'Name' and 'Group'.
         - For example, if the character is 'Karina' from 'Aespa', calculate her age based on her birthdate (2000-04-11) and the current date (assume late 2024 or 2025). 
         - Format the 'tutorAge' field as '24세' or '25세'. 
         - If the character is fictional or unknown, estimate a suitable age.

       - **PRONUNCIATION**:
         - Provide the **Romaji** pronunciation for the full sentence in the 'reading' field (e.g. 'Arigatou gozaimasu').
         - Do NOT use Hiragana/Katakana for the dialogue reading field.

       - **CRITICAL PERSONALITY INSTRUCTION**: 
         - You MUST dramatically embody the "Personality" trait defined for each character.
         - If a character is "Savage" or "Fact-bomber", they should be blunt, sarcastic, or teasing.
         - If a character is "Cute/Aegyo", they should use a cutesy tone and emojis.
         - If a character is "Leader/Serious", they should be calm, organizing, or protective.
         - If a character is "4D/Weird", they should say something random or off-beat.
         - **Do NOT** make them all sound polite and generic. Make them sound like close friends/group members teasing or talking to each other.

    4. Next Lesson:
       - Suggest ONE natural follow-up Japanese phrase/word that a student should learn AFTER "${text}".
    
    Characters:
    ${tutorContext}
    
    Output in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const data = JSON.parse(response.text || '{}');
    return {
      words: data.words,
      dialogue: data.dialogue,
      originalText: text,
      nextSuggestion: data.nextSuggestion
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze text.");
  }
};

export const generateQuiz = async (lastContext: AnalysisResult, tutors: Tutor[]): Promise<QuizData> => {
    const tutorContext = tutors.map(t => `Name: ${t.name}, Personality: ${t.personality}`).join('\n');
    
    // Randomly select one tutor to give encouragement
    const randomTutor = tutors[Math.floor(Math.random() * tutors.length)];

    const prompt = `
      Create a Japanese fill-in-the-blank quiz based on: "${lastContext.originalText}".
      
      Requirements:
      1. Provide readings (Romaji) for the question parts AND the options. Do NOT use Hiragana/Katakana.
      2. Provide a Korean translation of the full sentence.
      3. For EACH option, explain WHY it is correct or incorrect in this context (in Korean).
         - **GRAMMAR FORMATTING**: If you mention Japanese conjugation forms (like て형, ます형, etc.) in the explanations, you MUST include the Korean pronunciation in parentheses.
         - Example: "'-ます'형" -> "'-ます'형(마스형)"
         - Example: "'て'형" -> "'て'형(테형)"
      4. Encouragement:
         - Generate an encouragement message from Tutor: "${randomTutor.name}".
         - You MUST use this specific tutor.
         - **PERSONALITY CHECK**: The tutor's message MUST reflect their specific "Personality": "${randomTutor.personality}". 
         - Example: A "Tsundere" character might say "It's not like I'm proud of you or anything, but good job." 
         - Example: A "Savage" character might say "Surprisingly, you got it right."
         - Example: A "Warm" character should be very supportive.

      Context Characters:
      ${tutorContext}

      Output in JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            }
        });

        return JSON.parse(response.text || '{}') as QuizData;
    } catch (error) {
        console.error("Gemini Quiz Error:", error);
        throw new Error("Failed to generate quiz.");
    }
}