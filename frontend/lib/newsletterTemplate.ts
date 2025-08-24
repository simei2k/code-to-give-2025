// Base newsletter template with placeholder tokens.
// Tokens: {{STUDENT_TITLE}}, {{STUDENT_BODY}}, {{STUDENT_IMAGES}}
//         {{FESTIVE_BLOCK}}, {{EVENT_BLOCK}}, {{GENERAL_BLOCK}}
// Each *_BLOCK placeholder should contain one or more <section> elements.

export const NEWSLETTER_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{{SUBJECT}}</title>
    <style>
      :root { --primary:#0d6efd; --bg:#f4f7fb; --card:#ffffff; --accent:#0d6efd; --radius:22px; }
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:0;background:var(--bg);color:#1c2733;-webkit-font-smoothing:antialiased;}
      .outer{background:linear-gradient(135deg,#e8f1ff 0%,#f4f7fb 55%,#ffffff 100%);padding:46px 14px;}
      .container{max-width:800px;margin:0 auto;background:var(--card);padding:60px 60px 74px;border-radius:var(--radius);box-shadow:0 18px 46px -14px rgba(0,0,0,.14),0 6px 14px -6px rgba(0,0,0,.06);text-align:center;}
      @media (max-width:640px){.container{padding:38px 26px 54px;border-radius:26px;}}
      .header{position:relative;padding-bottom:26px;margin:0 0 52px;text-align:center;}
      .header:after{content:'';position:absolute;left:50%;bottom:0;height:6px;width:170px;transform:translateX(-50%);background:linear-gradient(90deg,var(--primary),#4aa9ff);} 
      h1{font-size:36px;line-height:1.1;margin:0 0 14px;font-weight:700;letter-spacing:.5px;}
      .intro{margin:0;font-size:17px;color:#46576a;}
      .section{margin:0 0 46px;background:#fff;border:1px solid #e0e8f2;padding:40px 42px 46px;border-radius:30px;box-shadow:0 12px 34px -14px rgba(0,0,0,.12),0 4px 10px -4px rgba(0,0,0,.05);text-align:center;}
      .section:last-of-type{margin-bottom:16px;}
      .section h2{font-size:25px;margin:0 0 20px;color:var(--accent);letter-spacing:.55px;}
      .section .body p{margin:0 0 20px;line-height:1.6;font-size:17px;}
  .media-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin:30px 0 8px;}
  .media-grid img{width:260px;max-width:100%;height:200px;object-fit:cover;border-radius:20px;box-shadow:0 10px 26px -12px rgba(0,0,0,.22),0 4px 12px -4px rgba(0,0,0,.08);} 
      .badge{display:inline-block;padding:8px 16px;border-radius:48px;background:var(--primary);color:#fff;font-size:12px;font-weight:600;letter-spacing:.7px;text-transform:uppercase;margin:0 0 18px;box-shadow:0 4px 10px -4px rgba(13,110,253,.55);} 
      p{line-height:1.6;font-size:17px;margin:0 0 20px;text-align:center;}
      strong{font-weight:600;}
      em{font-style:italic;}
      a{color:var(--primary);text-decoration:none;}a:hover{text-decoration:underline;}
      ul{padding-left:20px;margin:0 0 24px;text-align:left;display:inline-block;}li{margin:6px 0;}
      .footer{font-size:12px;color:#5a6b7d;margin-top:70px;text-align:center;line-height:1.55;}
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="container">
        <header class="header">
          <h1>{{SUBJECT}}</h1>
          <p class="intro">Monthly highlights and impact stories from Project REACH.</p>
        </header>
        {{STUDENT_SECTION}}
        {{FESTIVE_BLOCK}}
        {{EVENT_BLOCK}}
        {{GENERAL_BLOCK}}
        {{EXTRA_BLOCK}}
        <div class="footer">You are receiving this because you subscribed to updates from Project REACH.<br/>Thank you for your continued support.</div>
      </div>
    </div>
  </body>
</html>`;

export function injectTemplate(template: string, replacements: Record<string,string>): string {
  return Object.entries(replacements).reduce((acc,[k,v])=>acc.replaceAll(`{{${k}}}`, v ?? ''), template);
}
