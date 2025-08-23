"use client";

import { useState } from "react";
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ShareRowProps {
  canonical: string;
  title?: string;
  description?: string;
  image?: string; // absolute URL
}

export default function ShareRow({ canonical, title = '', description = '', image }: ShareRowProps) {
  const [copied, setCopied] = useState(false);

  async function doCopy() {
    try {
      await navigator.clipboard.writeText(canonical);
      setCopied(true);
      setTimeout(()=> setCopied(false), 2000);
    } catch {}
  }

  async function doShare() {
    // Try native share with metadata
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description || title, url: canonical });
        return;
      } catch { /* user cancelled */ }
    }
    // Fallback: open new window with social networks (prefer FB)
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`;
    window.open(fb, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 relative">
      <button
        type="button"
        onClick={doShare}
        className="inline-flex items-center gap-1 rounded-full border border-[#006e34]/20 bg-white px-4 py-1.5 text-sm font-medium text-[#0f5132] shadow-sm hover:bg-[#f7ffe9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006e34]"
        title="Share"
      >
        <IosShareIcon fontSize="small" /> Share
      </button>
      <button
        type="button"
        onClick={doCopy}
        className="inline-flex items-center gap-1 rounded-full border border-[#006e34]/20 bg-white px-4 py-1.5 text-sm font-medium text-[#0f5132] shadow-sm hover:bg-[#f7ffe9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006e34]"
        title="Copy link"
      >
        <ContentCopyIcon fontSize="small" /> {copied ? 'Copied!' : 'Copy link'}
      </button>
      {/* Hidden preview data for crawlers or future enhancements */}
      {image && (
        <meta property="og:image" content={image} />
      )}
    </div>
  );
}
