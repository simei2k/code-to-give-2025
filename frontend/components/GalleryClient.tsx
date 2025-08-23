'use client';

import React, { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';
import Link from 'next/link';
import type { updatePostEntry } from '@/lib/types';

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith('//') ? `https:${u}` : u) : '';
};

function useIsDesktop(minPx = 1024) {
  const [isDesktop, set] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${minPx}px)`);
    const onChange = () => set(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [minPx]);
  return isDesktop;
}

export default function GalleryClient({ posts }: { posts: updatePostEntry[] }) {
  const isDesktop = useIsDesktop();

  const items = (posts ?? [])
    .map(p => ({
      src: urlFromAsset(p.fields.coverImage),
      alt: p.fields.title || 'Update',
      href: `/stories/${p.fields.slug}`,
    }))
    .filter(i => i.src);

  if (!items.length) return null;

  return (
    <section className="mx-auto flex w-full flex-col py-6 lg:py-12">
      <div className="hidden lg:block">
        <Marquee speed={50} gradient={false} autoFill pauseOnHover={isDesktop}>
          {items.map((it, idx) => (
            <div key={idx} className="mx-4 flex-shrink-0">
              <Link href={it.href} aria-label={it.alt}>
                <Image
                  src={`${it.src}?w=900&h=500&fit=fill&fm=jpg&q=80`}
                  alt={it.alt}
                  width={600}
                  height={320}
                  className="h-56 w-auto rounded-sm border-2 border-white object-cover"
                />
              </Link>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}