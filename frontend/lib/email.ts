import nodemailer from 'nodemailer';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Get donor emails from Firestore
export const getDonorEmails = async (): Promise<string[]> => {
  try {
    const donorsRef = collection(db, 'donors');
    // Optionally filter donors who have opted in to newsletters
    const donorQuery = query(donorsRef, where('subscribeNewsletter', '==', true));
    const donorsSnapshot = await getDocs(donorQuery);
    
    const emails: string[] = [];
    donorsSnapshot.forEach((doc) => {
      const donorData = doc.data();
      if (donorData.email) {
        emails.push(donorData.email);
      }
    });
    
    return emails;
  } catch (error) {
    console.error('Error fetching donor emails:', error);
    return [];
  }
};

// Send newsletter to donors
export const sendNewsletterToDonors = async (
  subject: string,
  htmlContent: string,
  pdfBuffer: Buffer
): Promise<{ success: boolean; count?: number; error?: any }> => {
  try {
    // Get donor emails
    const donorEmails = await getDonorEmails();
    
    if (donorEmails.length === 0) {
      return { success: false, error: 'No donor emails found' };
    }
    
    // For testing, you can use a single email
    // const testEmails = ['your-test-email@example.com'];
    
    // Send email to each donor or use BCC for a single email to all
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      bcc: donorEmails, // Use BCC to hide recipients from each other
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Project_REACH_Newsletter_${new Date().toISOString().slice(0, 10)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    
    return { success: true, count: donorEmails.length };
  } catch (error) {
    console.error('Error sending newsletter emails:', error);
    return { success: false, error };
  }
};
