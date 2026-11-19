import { MessageCircle } from 'lucide-react';
import { Lang } from '../types/boutique';
import { getCopy } from '../data/translations';
import { buildWhatsappUrl } from '../lib/whatsapp';

interface FloatingWhatsAppProps {
  lang: Lang;
  whatsappNumber: string;
}

export function FloatingWhatsApp({
  lang,
  whatsappNumber,
}: FloatingWhatsAppProps) {
  const t = getCopy(lang);
  const href = buildWhatsappUrl(whatsappNumber, t.whatsapp.generalGreeting);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.floatingLabel}
      className="fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#6B1238] text-[#FAF4EE] shadow-[0_10px_28px_-6px_rgba(107,18,56,0.55)] border border-[#C9A66B]/40 flex items-center justify-center hover:bg-[#540D2B] hover:scale-105 transition-all"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
