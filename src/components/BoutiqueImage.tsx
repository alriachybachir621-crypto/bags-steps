import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface BoutiqueImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function BoutiqueImage({ src, alt, className = '' }: BoutiqueImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F6DDE5]/70 via-[#FAF4EE] to-[#C9A66B]/20 text-[#6B1238]/70 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ShoppingBag className="w-7 h-7 mb-2 stroke-[1.5]" />
        <span className="text-xs font-medium px-4 text-center line-clamp-2 text-[#2A1A20]/70">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
