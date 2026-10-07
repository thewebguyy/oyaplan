"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Send, RotateCcw, Play, Pause, Volume2, Sparkles, Flame, ThumbsUp, Laugh, Heart } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "oyaplan";
  text: string;
  timestamp: string;
  isVoiceNote?: boolean;
  vnDuration?: string;
  vnRevealed?: boolean;
  reactions?: string[];
}

interface QuickPrompt {
  id: string;
  label: string;
  userQuery: string;
  replyText: string;
  isVoiceNote?: boolean;
  vnText?: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "accuracy",
    label: "💰 Are these prices real?",
    userQuery: "Are these prices actually real? No surprise billing?",
    replyText:
      "We do the absolute most to make sure they are. We audit physical menus and use live zone-modeling for ride-fares. What you see is the verified baseline. No secret markups, no stories. 🤝",
  },
  {
    id: "cast",
    label: "🚨 What if the spot casts?",
    userQuery: "What if the spot casts? (Like they hike prices at the door)",
    replyText:
      "Lagos can move mad, but we update our data constantly. If a lounge suddenly changes their gate fee or menu by 12 AM, our community flags it so nobody else gets caught off guard. We're all in this together.",
  },
  {
    id: "free",
    label: "💸 Is this app actually free?",
    userQuery: "Wait, is this app actually free?",
    replyText:
      "100% free for you. Save your cash for the actual enjoyment. We just want to make sure you step out with confidence. 💸",
  },
  {
    id: "flexibility",
    label: "🔄 What if the squad changes plans?",
    userQuery: "What if the squad changes their mind mid-plan?",
    replyText:
      "No shaking. You can tweak the headcount, budget, or vibe at any time. Just hit edit on your saved plan and we'll recalculate the math instantly. 🔄",
  },
  {
    id: "voicenote",
    label: "🎙️ VN: Which areas do you cover?",
    userQuery: "Drop VN: Which areas of Lagos do you cover?",
    isVoiceNote: true,
    replyText: "Voice note incoming...",
    vnText:
      "Lol, I could drop a VN, but I know you're probably at work or in traffic. Here's the text version: We cover Ikeja, VI, Yaba, Lekki, Surulere, and Ikoyi. More Mainland and Island gems dropping weekly! 📍",
  },
  {
    id: "squad",
    label: "👥 Can I split the bill with friends?",
    userQuery: "Can I invite my friends to the plan so everyone pays their share?",
    replyText:
      "100%. Generate the link, shoot it into your WhatsApp group, and everyone sees their exact damage per head. No awkward 'who is transferring what' calculations when the POS arrives. 📱",
  },
];

function getFormattedTime() {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${strMinutes} ${ampm}`;
}

/**
 * Lagos Street Pattern Watermark
 * Repeating subtle icons: Keke Napep, Danfo, Naira ₦, Suya skewer, Lekki Bridge, Drink bottle
 */
function LagosChatPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04] select-none"
      style={{
        backgroundImage: `radial-gradient(#111111 1px, transparent 1px), radial-gradient(#111111 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 16px 16px",
      }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lagos-doodle" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Naira Sign */}
            <text x="14" y="32" fontSize="16" fontWeight="bold" fill="#111111">₦</text>
            {/* Suya skewer */}
            <line x1="60" y1="16" x2="90" y2="40" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
            <circle cx="70" cy="24" r="3.5" fill="#111111" />
            <circle cx="80" cy="32" r="3.5" fill="#111111" />
            {/* Lekki Bridge Pylon silhouette */}
            <path d="M 20 100 L 32 70 L 44 100" stroke="#111111" strokeWidth="2" fill="none" />
            <line x1="32" y1="70" x2="16" y2="100" stroke="#111111" strokeWidth="1" />
            <line x1="32" y1="70" x2="48" y2="100" stroke="#111111" strokeWidth="1" />
            {/* Danfo Bus silhouette */}
            <rect x="75" y="80" width="32" height="18" rx="3" stroke="#111111" strokeWidth="2" fill="none" />
            <line x1="75" y1="88" x2="107" y2="88" stroke="#111111" strokeWidth="1.5" />
            <circle cx="83" cy="98" r="3" fill="#111111" />
            <circle cx="99" cy="98" r="3" fill="#111111" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lagos-doodle)" />
      </svg>
    </div>
  );
}

/**
 * Avatar with Lagos Shades & Danfo Yellow Pin
 */
function LagosAvatar() {
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#111111] border-2 border-[#111111] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#111111] overflow-hidden">
      {/* Cool sunglasses avatar */}
      <div className="w-full h-full bg-[#F9E828] flex flex-col items-center justify-center relative">
        {/* Sunglasses */}
        <div className="flex items-center gap-0.5 mt-0.5">
          <div className="w-3.5 h-2.5 bg-[#111111] rounded-sm" />
          <div className="w-1 h-0.5 bg-[#111111]" />
          <div className="w-3.5 h-2.5 bg-[#111111] rounded-sm" />
        </div>
        {/* Smug confident smile */}
        <div className="w-3.5 h-1 border-b-2 border-[#111111] rounded-full mt-1" />
      </div>
      {/* Live Badge dot */}
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#008751] border-2 border-white rounded-full" />
    </div>
  );
}

export default function FAQSection() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial-1",
      sender: "oyaplan",
      text: "Kedu! Welcome to OyaPlan Central. We give you the real cost of outings so you don't suffer unexpected billing. Tap any question below or ask us anything! 🌴",
      timestamp: getFormattedTime(),
      reactions: ["🔥"],
    },
  ]);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [activeVoiceNoteId, setActiveVoiceNoteId] = useState<string | null>(null);
  const [voiceNotePlaying, setVoiceNotePlaying] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat feed to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(15);
      } catch {}
    }
  };

  const handleSelectPrompt = (prompt: QuickPrompt) => {
    if (isTyping) return;

    triggerHaptic();
    const timeNow = getFormattedTime();

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt.userQuery,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Typing delay (1.2 seconds for authentic feel)
    setTimeout(() => {
      triggerHaptic();
      setIsTyping(false);

      if (prompt.isVoiceNote) {
        setMessages((prev) => [
          ...prev,
          {
            id: `oyaplan-${Date.now()}`,
            sender: "oyaplan",
            text: prompt.vnText || prompt.replyText,
            timestamp: getFormattedTime(),
            isVoiceNote: true,
            vnDuration: "0:42",
            vnRevealed: false,
            reactions: ["😂"],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `oyaplan-${Date.now()}`,
            sender: "oyaplan",
            text: prompt.replyText,
            timestamp: getFormattedTime(),
            reactions: [],
          },
        ]);
      }
    }, 1200);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const query = inputValue.trim();
    setInputValue("");
    triggerHaptic();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Smart matching logic for custom user queries
    setTimeout(() => {
      triggerHaptic();
      setIsTyping(false);

      const lower = query.toLowerCase();
      let matchedReply =
        "OyaPlan got you covered! We audit Lagos menus and transport daily so you can step out with confidence. Check our verified breakdowns or shoot us a line at hello@oyaplan.com for custom spot inquiries. 🌴";

      if (lower.includes("price") || lower.includes("cost") || lower.includes("real") || lower.includes("cheap")) {
        matchedReply =
          "We do the absolute most to keep prices real. We audit physical menus and use live zone-modeling for ride-fares. Verified menu baseline + estimated transport corridor. Zero markup, zero stories. 🤝";
      } else if (lower.includes("free") || lower.includes("money") || lower.includes("pay")) {
        matchedReply =
          "100% free for you! Save your cash for the actual enjoyment. We just want to make sure you step out with confidence. 💸";
      } else if (lower.includes("area") || lower.includes("island") || lower.includes("mainland") || lower.includes("ikeja") || lower.includes("vi")) {
        matchedReply =
          "We actively cover Ikeja, VI, Yaba, Lekki, Surulere, and Ikoyi. More Mainland and Island gems dropping every single week! 📍";
      } else if (lower.includes("squad") || lower.includes("friend") || lower.includes("group") || lower.includes("split")) {
        matchedReply =
          "You can plan for 2 to 8+ people. The planner calculates transport and table spend per head, and you can share the link directly to your WhatsApp group. 📱";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `oyaplan-${Date.now()}`,
          sender: "oyaplan",
          text: matchedReply,
          timestamp: getFormattedTime(),
          reactions: ["💯"],
        },
      ]);
    }, 1200);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    triggerHaptic();
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const current = msg.reactions || [];
        const next = current.includes(emoji)
          ? current.filter((r) => r !== emoji)
          : [...current, emoji];
        return { ...msg, reactions: next };
      })
    );
  };

  const handlePlayVoiceNote = (messageId: string) => {
    triggerHaptic();
    setActiveVoiceNoteId(messageId);
    setVoiceNotePlaying(true);

    // After brief playing animation (600ms), reveal the hilarious text fake-out!
    setTimeout(() => {
      setVoiceNotePlaying(false);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, vnRevealed: true } : msg))
      );
    }, 800);
  };

  const handleResetChat = () => {
    triggerHaptic();
    setMessages([
      {
        id: "initial-1",
        sender: "oyaplan",
        text: "Kedu! Welcome to OyaPlan Central. We give you the real cost of outings so you don't suffer unexpected billing. Tap any question below or ask us anything! 🌴",
        timestamp: getFormattedTime(),
        reactions: ["🔥"],
      },
    ]);
  };

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 bg-[#F6F6F2] font-sans selection:bg-[#F9E828] selection:text-[#111111]" aria-labelledby="faq-title">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-[#F9E828] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
            <Sparkles className="w-3.5 h-3.5 fill-[#111111]" />
            <span>THE LAGOS GROUP CHAT (FAQ)</span>
          </div>
          <h2 id="faq-title" className="text-3xl sm:text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-[#111111]">
            Frequently Asked Questions.
          </h2>
          <p className="text-sm sm:text-base text-[#555555] font-medium max-w-xl mx-auto">
            No long talk. No corporate fine print. Ask the questions everyone secretly debates before stepping out.
          </p>
        </div>

        {/* ── 1. THE DANFO-CHAT HYBRID CONTAINER ── */}
        <div className="relative bg-white border-3 border-[#111111] rounded-3xl shadow-[8px_8px_0px_0px_#111111] overflow-hidden flex flex-col h-[650px] sm:h-[700px]">

          {/* Chat Background Doodle Pattern */}
          <LagosChatPattern />

          {/* ── HEADER BAR (Danfo Yellow #F9E828) ── */}
          <div className="relative z-10 bg-[#F9E828] border-b-3 border-[#111111] px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <LagosAvatar />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black font-display text-[#111111] uppercase tracking-tight">
                    OyaPlan Central
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-[#111111] text-[#F9E828] px-2 py-0.5 rounded-full">
                    Gist 📍
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-[#111111]/80">
                    Online • Ready to drop updates
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-2 rounded-xl bg-white/80 hover:bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 text-xs font-mono font-bold tap-feedback"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* ── CHAT MESSAGE STREAM ── */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Encryption / Trust Notice Banner */}
            <div className="flex justify-center my-2">
              <div className="bg-[#FFFEE5] border border-[#111111]/20 rounded-full px-4 py-1 text-[11px] font-mono font-medium text-[#666666] flex items-center gap-2 shadow-xs text-center">
                <span>🔒 Verified outing math. Zero hidden billing. Lagos time: GMT+1</span>
              </div>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%] ${
                    isUser ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`relative p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] transition-all group ${
                      isUser
                        ? "bg-[#111111] text-white rounded-br-xs"
                        : "bg-white text-[#111111] rounded-bl-xs"
                    }`}
                  >
                    {/* Voice Note Simulation */}
                    {msg.isVoiceNote ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-[#F6F6F2] p-2.5 rounded-xl border border-[#111111]/30">
                          <button
                            onClick={() => handlePlayVoiceNote(msg.id)}
                            className="w-9 h-9 rounded-full bg-[#008751] hover:bg-[#007043] text-white flex items-center justify-center shrink-0 border border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                          >
                            {voiceNotePlaying && activeVoiceNoteId === msg.id ? (
                              <Pause className="w-4 h-4 fill-white" />
                            ) : (
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            )}
                          </button>

                          {/* Animated Voice Waveform */}
                          <div className="flex-1 flex items-center gap-1 h-5 overflow-hidden">
                            {[12, 24, 16, 28, 10, 22, 30, 18, 14, 26, 8, 20, 28, 15, 22, 12].map((height, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-300 ${
                                  voiceNotePlaying && activeVoiceNoteId === msg.id
                                    ? "bg-[#008751] animate-pulse"
                                    : "bg-[#777777]"
                                }`}
                                style={{ height: `${height}px` }}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] font-mono font-bold text-[#555555]">
                            {msg.vnDuration}
                          </span>
                        </div>

                        {/* Revealed Fake-out Text */}
                        <AnimatePresence>
                          {msg.vnRevealed && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="pt-1 border-t border-[#111111]/15 text-[#111111] text-xs sm:text-sm font-semibold"
                            >
                              <span className="text-[#008751] font-mono text-[10px] uppercase font-black block mb-1">
                                🎙️ AUDIO TRANSCRIPT (OFFICE MODE)
                              </span>
                              {msg.text}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Metadata: Timestamp & Read Receipts */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-2 pt-1 border-t ${
                        isUser ? "border-white/10 text-white/70" : "border-black/10 text-[#777777]"
                      } text-[10px] font-mono`}
                    >
                      <span>{msg.timestamp}</span>
                      <CheckCheck className={`w-3.5 h-3.5 ${isUser ? "text-[#F9E828]" : "text-[#008751]"}`} />
                    </div>

                    {/* Emoji Reaction Floating Pills */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="absolute -bottom-3 right-3 flex items-center gap-1 bg-white border border-[#111111] rounded-full px-2 py-0.5 shadow-[2px_2px_0px_0px_#111111] text-xs">
                        {msg.reactions.map((emoji, idx) => (
                          <span key={idx}>{emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Selector (Hover or Focus on OyaPlan messages) */}
                  {!isUser && (
                    <div className="flex items-center gap-1 mt-1.5 ml-2 text-xs opacity-75 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-mono font-bold text-[#888888] mr-1">React:</span>
                      {["🔥", "💯", "😂", "❤️"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform p-0.5 cursor-pointer"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 max-w-[120px] bg-white border-2 border-[#111111] p-3 rounded-2xl rounded-bl-xs shadow-[3px_3px_0px_0px_#111111]"
              >
                <span className="text-[10px] font-mono font-bold text-[#555555]">Typing</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#008751] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-[#008751] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-[#008751] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── 2. QUICK REPLIES TRAY (Horizontal Scrollable Pills) ── */}
          <div className="relative z-10 bg-[#FAFAF8] border-t-2 border-[#111111] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#777777]">
                Quick Gist Prompts (Tap to ask):
              </span>
              <span className="text-[10px] font-mono font-bold text-[#008751] hidden sm:inline">
                Scroll right for more →
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  disabled={isTyping}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#111111] hover:bg-[#F9E828] text-white hover:text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 3. CHAT INPUT BAR ── */}
          <form
            onSubmit={handleCustomSend}
            className="relative z-10 bg-white border-t-2 border-[#111111] p-3 sm:p-4 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about prices, areas, squad math..."
              disabled={isTyping}
              className="flex-1 bg-[#F6F6F2] border-2 border-[#111111] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#111111] placeholder:text-[#888888] focus:outline-hidden focus:bg-white focus:border-[#008751] transition-all"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

        </div>

        {/* Bottom Trust Microcopy */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#777777] px-2">
          <span>OyaPlan Technologies Limited • Lagos Outing Intelligence</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#008751]">
              <CheckCheck className="w-4 h-4 stroke-[2.5]" />
              Physical Menus Audited
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[#008751]">
              <CheckCheck className="w-4 h-4 stroke-[2.5]" />
              Zero Hidden Markups
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
