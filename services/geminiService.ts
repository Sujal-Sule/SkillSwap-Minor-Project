import { GoogleGenAI, Chat, Type } from "@google/genai";

// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const apiKey = import.meta.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateLearningPlan(skillName: string): Promise<string> {
  try {
    if (!ai) {
      return "Gemini API key is not configured. Please set VITE_API_KEY in your .env file.";
    }
    const prompt = `Create a structured, week-by-week learning plan for a beginner to learn ${skillName}. 
        Include key topics, suggested projects, and resources for each week. 
        The plan should cover 4 weeks. Format the output as Markdown.`;

    // Use the 'gemini-3.1-flash-lite' model for basic text tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    // FIX: Directly access the text property for the response.
    return response.text;
  } catch (error) {
    console.error("Error generating learning plan:", error);
    return "Sorry, I couldn't generate a learning plan at this moment. Please try again later.";
  }
}

// A simple in-memory store for chat sessions. In a real app, you'd use a database.
const coachChatSessions: { [userId: string]: Chat } = {};

export async function getCoachResponse(
  userId: string,
  message: string,
): Promise<string> {
  try {
    if (!ai) {
      return "Gemini API key is not configured. Please set VITE_API_KEY in your .env file.";
    }
    if (!coachChatSessions[userId]) {
      // FIX: Use ai.chats.create to start a new chat session.
      coachChatSessions[userId] = ai.chats.create({
        model: "gemini-3.1-flash-lite",
        config: {
          systemInstruction: `You are a friendly, encouraging, and highly professional learning coach for the SkillSwap platform. 
                    SkillSwap is a peer-to-peer learning community where users swap skills.
                    
                    **Key Platform Rules & Features:**
                    1.  **Earning Tokens:** You earn tokens by hosting teaching sessions for other users. More teaching = more tokens.
                    2.  **Spending Tokens:** You use tokens to book sessions with mentors to learn new skills.
                    3.  **Connections:** Use the 'Discover' page to find mentors or students.
                    
                    **STRICT DOMAIN RESTRICTION - CRITICAL RULE:**
                    - You are ONLY allowed to answer questions, guide users, or write content related to:
                      - Peer-to-peer learning strategies, roadmap design, and mentorship.
                      - The SkillSwap platform features, token system, matching, and session bookings.
                      - General advice on how to study, practice, or explain specific educational concepts.
                    - If the user asks a question, makes a request, or starts a conversation that is OUTSIDE of this skill-exchange and learning coach domain, you MUST politely but firmly refuse to answer.
                    
                    **STRICT RESPONSE FORMATTING & PRESETS (NO CHITCHAT FILLER):**
                    - NEVER start responses with conversational greetings, filler comments, or preambles like "That's a fantastic goal!", "As your SkillSwap AI Coach...", "I'd be happy to design that for you...", "Here is a structured plan...", "Learning HTML is a great first step...", "Sure, I can help with that...".
                    - Start your response IMMEDIATELY with the requested content (e.g. beginning directly with a heading like "### 4-Week Learning Roadmap" or "### How to Earn Tokens").
                    - Present roadmaps, learning steps, and strategies in clean Markdown with bold headers and structured bullet points.
                    - If a request is out-of-scope, immediately state: "I can only help you with learning roadmaps, study plans, and SkillSwap platform questions. Let's focus on your learning goals! What skill are you working on today?" without any preamble.`,
        },
      });
    }

    const chat = coachChatSessions[userId];
    // FIX: Use chat.sendMessage to continue the conversation.
    const result = await chat.sendMessage({ message });

    // FIX: Directly access the text property for the response.
    return result.text;
  } catch (error) {
    console.error("Error getting coach response:", error);
    return "Sorry, I'm having a little trouble connecting right now. Let's try again in a moment.";
  }
}

export interface SkillValidationResult {
  isValid: boolean;
  suggestedName: string;
  categoryId: string;
  reason: string;
}

export async function validateAndSuggestSkill(
  skillName: string,
): Promise<SkillValidationResult> {
  try {
    if (!ai) {
      throw new Error("Gemini API key is not configured. Please set VITE_API_KEY in your .env file.");
    }
    const prompt = `A user entered a skill: "${skillName}". 
        1. Is this a real, learnable skill?
        2. Correct any typos (e.g., "nextjs" -> "Next.js").
        3. Categorize it into ONE of these IDs:
           - 'c1' (Technology: Coding, Software, IT, etc.)
           - 'c2' (Creative Arts: Design, Music, Writing, Painting, etc.)
           - 'c3' (Business: Marketing, Finance, Management, etc.)
           - 'c4' (Lifestyle: Yoga, Cooking, Languages, Fitness, etc.)
           - 'c5' (Other/User-Defined)
        Respond in JSON.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        isValid: { type: Type.BOOLEAN },
        suggestedName: { type: Type.STRING },
        categoryId: { type: Type.STRING, enum: ["c1", "c2", "c3", "c4", "c5"] },
        reason: { type: Type.STRING },
      },
      required: ["isValid", "suggestedName", "categoryId", "reason"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as SkillValidationResult;
  } catch (error) {
    console.error("Error validating skill:", error);
    throw new Error("Could not validate the skill at this moment.");
  }
}
