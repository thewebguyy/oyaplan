import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface WhatsAppSupportButtonProps {
  venueName: string;
}

export function WhatsAppSupportButton({ venueName }: WhatsAppSupportButtonProps) {
  const message = encodeURIComponent(`Hi OyaPlan team, I manage ${venueName}. I'd like help updating our presence.`);
  const whatsappUrl = `https://wa.me/2348000000000?text=${message}`;

  return (
    <div className="bg-[#EAFDF3] border border-[#A3F3C6] rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#008751] text-white flex items-center justify-center shrink-0 shadow-xs">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-black text-midnight-lagoon text-base uppercase">
            Need help? Talk to OyaPlan
          </h4>
          <p className="text-xs text-[#0A7C3F] leading-relaxed max-w-md">
            Our team is available on WhatsApp to assist with menu changes, photo updates, or verification questions.
          </p>
        </div>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-11 px-5 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 transition-all tap-feedback shrink-0 cursor-pointer shadow-sm"
      >
        <span>Message on WhatsApp</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
