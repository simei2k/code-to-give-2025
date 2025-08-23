"use client";

import { useState } from "react";
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function ShareRow({ canonical }: { canonical: string }) {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 relative">
      {/* Dummy share (no real posting) */}
      <button
        type="button"
        className="rounded-full border border-[#006e34]/20 bg-white px-3 py-1.5 text-sm text-[#0f5132] shadow-sm hover:bg-[#f7ffe9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006e4]"
        aria-disabled="true"
        title="Coming soon"
      >
        <IosShareIcon />
      </button>

      {/* Copy link (works) */}
      <button
        type="button"
        className="rounded-full border border-[#006e34]/20 bg-white px-3 py-1.5 text-sm text-[#0f5132] shadow-sm hover:bg-[#f7ffe9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006e34]"
      >
        <ContentCopyIcon />
      </button>
    </div>
  );
}
