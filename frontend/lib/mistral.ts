import axios from 'axios';

const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

interface MistralResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Remove an initial greeting like "Dear ..." or "Hi ..." if present
function sanitizeGreeting(text: string): string {
  const trimmed = text.trim();
  // Regex: start, optional quotes, Dear/Hi/Hello, anything up to first sentence end or newline
  const greetingRegex = /^(?:"|')?(?:dear|hi|hello)\b[^\n.!?]*[.!?]?\s+/i;
  if (greetingRegex.test(trimmed)) {
    return trimmed.replace(greetingRegex, '').trimStart();
  }
  return trimmed;
}

// Simple retry wrapper for Mistral API (handles 429 rate limits)
async function callMistral(messages: { role: string; content: string }[], max_tokens: number, temperature = 0.7, retries = 3): Promise<string> {
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  let attempt = 0;
  let lastError: any;
  while (attempt < retries) {
    try {
      const response = await axios.post<MistralResponse>(
        MISTRAL_API_ENDPOINT,
        { model: 'mistral-large-latest', messages, temperature, max_tokens },
        { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' } }
      );
      return response.data.choices[0].message.content.trim();
    } catch (e: any) {
      lastError = e;
      const status = e?.response?.status;
      if (status !== 429 && status !== 503) break; // only retry on rate/service limit
      const backoff = Math.pow(2, attempt) * 500 + Math.random() * 200;
      await delay(backoff);
      attempt++;
    }
  }
  throw lastError;
}

// Generate a heartfelt message about student achievements
export const generateStudentAchievementMessage = async (
  originalCaption: string,
  studentName: string = ''
): Promise<string> => {
  try {
  const raw = await callMistral([
      { role: 'system', content: 'You are a heartfelt newsletter writer for Project REACH, a charity organization helping underserved kindergarten students improve their English proficiency across Hong Kong. Your task is to create impactful, emotional content that highlights student achievements and the positive impact of donations.' },
      { role: 'user', content: `Create a heartfelt, sincere message (about 30 words) about student's achievements based on this caption: "${originalCaption}"${studentName ? ` The student's name is ${studentName}.` : ''} Focus on how donations make a difference and form an emotional connection.` }
    ], 100, 0.7);
  return sanitizeGreeting(raw);
  } catch (error) {
    console.error('Error generating content with Mistral:', error);
    return originalCaption;
  }
};

// Generate a general message about the importance of donations
export const generateGeneralDonationMessage = async (): Promise<string> => {
  try {
  const raw = await callMistral([
      { role: 'system', content: 'You are a heartfelt newsletter writer for Project REACH, a charity organization helping underserved kindergarten students improve their English proficiency across Hong Kong. Project Reach aims to integrate into kindergarten curricula and build a database tracking English proficiency to refine programmes and raise awareness.' },
      { role: 'user', content: 'Create a heartfelt, sincere general message (40-70 words) for our monthly donor newsletter, explaining how important donations are and expressing gratitude. Do not write the donors name' }
    ], 180, 0.7);
  return sanitizeGreeting(raw);
  } catch (error) {
    console.error('Error generating content with Mistral:', error);
    return 'Your generous donations make a profound difference for our kindergarten students. Every contribution builds a stronger foundation for English learning and brighter futures. Thank you for standing with Project REACH.';
  }
};

// Generate student of the month description
export const generateStudentOfMonthMessage = async (originalCaption: string, studentName: string): Promise<string> => {
  try {
  const raw = await callMistral([
      { role: 'system', content: 'You are a heartfelt newsletter writer for Project REACH.' },
      { role: 'user', content: `Create a heartfelt "Student of the Month" feature (40-60 words) about ${studentName} based on this caption: "${originalCaption}". Describe their personality, achievements, progress, and how donations helped.` }
    ], 190, 0.7);
  return sanitizeGreeting(raw);
  } catch (error) {
    console.error('Error generating content with Mistral:', error);
    return originalCaption;
  }
};
