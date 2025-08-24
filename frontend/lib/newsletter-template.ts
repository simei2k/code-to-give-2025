import { ContentfulPost } from './contentful';
import { format } from 'date-fns';

interface NewsletterSection {
  title: string;
  content: string;
  imageUrl?: string;
}

interface NewsletterData {
  month: string;
  year: number;
  generalMessage: string;
  weeklySections: NewsletterSection[];
  studentOfMonth: {
    name: string;
    description: string;
    imageUrl: string;
  };
}

export const generateNewsletterHtml = (data: NewsletterData): string => {
  const {
    month,
    year,
    generalMessage,
    weeklySections,
    studentOfMonth
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project REACH Newsletter - ${month} ${year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
    
    body, html {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
    }
    
    .header {
      background-color: #005f9e;
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .logo {
      max-width: 150px;
      margin-bottom: 10px;
    }
    
    h1, h2, h3 {
      margin: 0;
      line-height: 1.2;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 700;
    }
    
    h2 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #005f9e;
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #005f9e;
    }
    
    .intro {
      padding: 20px;
      background-color: #f9f9f9;
      border-bottom: 1px solid #eaeaea;
    }
    
    .section {
      padding: 20px;
      border-bottom: 1px solid #eaeaea;
    }
    
    .section-content {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    
    .section-image {
      flex: 0 0 200px;
      margin-right: 20px;
    }
    
    .section-image img {
      width: 100%;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .section-text {
      flex: 1;
    }
    
    .student-of-month {
      padding: 20px;
      background-color: #fffdf0;
      border: 1px solid #f0e8c0;
      border-radius: 5px;
      margin: 20px;
    }
    
    .student-image {
      float: right;
      width: 150px;
      margin-left: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .footer {
      padding: 20px;
      background-color: #f0f0f0;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    
    .section:nth-child(odd) .section-content {
      flex-direction: row-reverse;
    }
    
    .section:nth-child(odd) .section-image {
      margin-right: 0;
      margin-left: 20px;
    }
    
    @media (max-width: 600px) {
      .section-content {
        flex-direction: column !important;
      }
      
      .section-image {
        margin: 0 0 15px 0 !important;
        width: 100%;
        max-width: none;
      }
      
      .student-image {
        float: none;
        display: block;
        margin: 0 auto 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://projectreach.org/reachlogo.png" alt="Project REACH Logo" class="logo">
      <h1>Project REACH Newsletter</h1>
      <p>${month} ${year}</p>
    </div>
    
    <div class="intro">
      <p>${generalMessage}</p>
    </div>
    
    ${weeklySections.map((section, index) => `
    <div class="section">
      <h2>${section.title}</h2>
      <div class="section-content">
        <div class="section-image">
          <img src="${section.imageUrl}" alt="${section.title}">
        </div>
        <div class="section-text">
          <p>${section.content}</p>
        </div>
      </div>
    </div>
    `).join('')}
    
    <div class="student-of-month">
      <h2>Student of the Month: ${studentOfMonth.name}</h2>
      <img src="${studentOfMonth.imageUrl}" alt="${studentOfMonth.name}" class="student-image">
      <p>${studentOfMonth.description}</p>
    </div>
    
    <div class="footer">
      <p>Thank you for your continued support of Project REACH.</p>
      <p>For more information, visit <a href="https://projectreach.org">projectreach.org</a></p>
      <p>&copy; ${year} Project REACH. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};
