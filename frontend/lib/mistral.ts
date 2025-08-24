import axios from 'axios';

const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

interface MistralResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Generate a heartfelt message about student achievements
export const generateStudentAchievementMessage = async (
  originalCaption: string,
  studentName: string = ''
): Promise<string> => {
  try {
    const response = await axios.post<MistralResponse>(
      MISTRAL_API_ENDPOINT,
      {
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: `You are a heartfelt newsletter writer for Project REACH, a charity organization helping underserved kindergarten students improve their English proficiency across Hong Kong. Your task is to create impactful, emotional content that highlights student achievements and the positive impact of donations.`
          },
          {
            role: 'user',
            content: `Create a heartfelt, sincere message (about 30 words) about student's achievements based on this caption: "${originalCaption}"${studentName ? ` The student's name is ${studentName}.` : ''} 
            Focus on how donations make a difference in children's lives and create an emotional connection with donors, reminding them of their positive impact on the community.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating content with Mistral:', error);
    return originalCaption;
  }
};

// Generate a general message about the importance of donations
export const generateGeneralDonationMessage = async (): Promise<string> => {
  try {
    const response = await axios.post<MistralResponse>(
      MISTRAL_API_ENDPOINT,
      {
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: `You are a heartfelt newsletter writer for Project REACH, a charity organization helping underserved kindergarten students improve their English proficiency across Hong Kong. Project Reach aims to become part of the kindergarten curriculum for schools in need across Hong Kong. We strive to create the first database tracking English proficiency of underserved K3 students to improve programmes and raise awareness of early childhood poverty. Additionally, we aim to secure funding from primary schools to continue supporting students as they transition into Primary 1.`
          },
          {
            role: 'user',
            content: `Create a heartfelt, sincere general message (40-80 words) for our monthly donor newsletter, explaining how important donations are for our mission. Create an emotional connection with the donors and remind them of their positive impact on the community. Make it sound grateful and sincere.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating content with Mistral:', error);
    return "Your generous donations continue to make a profound difference in the lives of our kindergarten students. Every contribution helps us build a stronger foundation for English proficiency and brighter futures. Thank you for your continued support of Project REACH.";
  }
};

// Generate student of the month description
export const generateStudentOfMonthMessage = async (
  originalCaption: string,
  studentName: string
): Promise<string> => {
  try {
    const response = await axios.post<MistralResponse>(
      MISTRAL_API_ENDPOINT,
      {
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: `You are a heartfelt newsletter writer for Project REACH, a charity organization helping underserved kindergarten students improve their English proficiency across Hong Kong.`
          },
          {
            role: 'user',
            content: `Create a heartfelt "Student of the Month" feature (40-60 words) about ${studentName} based on this caption: "${originalCaption}". Describe their personality, achievements, and progress. Make it sound personal and highlight how donations have specifically helped this student flourish.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating content with Mistral:', error);
    return originalCaption;
  }
};
