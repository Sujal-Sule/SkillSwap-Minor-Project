import { GoogleGenAI, Chat, Type } from "@google/genai";

// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export async function generateLearningPlan(skillName: string): Promise<string> {
  try {
    const prompt = `Create a structured, week-by-week learning plan for a beginner to learn ${skillName}. 
        Include key topics, suggested projects, and resources for each week. 
        The plan should cover 4 weeks. Format the output as Markdown.`;

    // FIX: Use the 'gemini-2.5-flash' model for basic text tasks.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    if (!coachChatSessions[userId]) {
      // FIX: Use ai.chats.create to start a new chat session.
      coachChatSessions[userId] = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are a friendly and encouraging learning coach for the SkillSwap platform. 
                    SkillSwap is a peer-to-peer learning community where users can swap skills.
                    
                    **Key Platform Rules & Features:**
                    1.  **Earning Tokens:** You earn tokens primarily by **hosting teaching sessions** for other users. The more you teach, the more you earn.
                    2.  **Spending Tokens:** You use tokens to **book sessions** with mentors to learn new skills.
                    3.  **Connections:** Use the 'Discover' page to find mentors or students.
                    4.  **Goal:** To foster a collaborative learning environment.
                    
                    Users come to you for advice on learning new skills, platform features (like how to earn tokens), and staying motivated. 
                    Your tone should be supportive, positive, and actionable. Keep responses concise and focused on SkillSwap's peer-to-peer model.`,
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
      model: "gemini-2.5-flash",
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
