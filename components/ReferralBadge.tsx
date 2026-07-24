"use client";

import { useState, useEffect } from "react";
import { Users, Copy, Check, Gift } from "lucide-react";

interface ReferralBadgeProps {
  userId: string;
}

export default function ReferralBadge({ userId }: ReferralBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ referralsCount: 0, creditsNgn: 0 });

  useEffect(() => {
    // Simulate reading referrals schema
    // Generate static values for demo placeholder flow
    setStats({
      referralsCount: 3,
      creditsNgn: 6000,
    });
  }, [userId]);

  const referralLink = `https://oyaplan.com/r/${userId.slice(0, 6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#FAF5FF] border border-purple-200 rounded-[24px] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          🎁
        </div>
        <div>
          <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">Bring A Friend</h3>
          <p className="text-xs text-text-muted mt-0.5">Invite squad members. Get ₦2,000 for each one who plans.</p>
        </div>
      </div>

      {/* Tally Metrics */}
      <div className="grid grid-cols-2 gap-4 bg-white/60 p-3 rounded-xl border border-purple-100">
        <div className="text-center">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Friends Joined</p>
          <p className="text-lg font-black text-purple-700">{stats.referralsCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Credits Earned</p>
          <p className="text-lg font-black text-[#008751]">₦{stats.creditsNgn.toLocaleString()}</p>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
          Your Shareable Invite Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 h-10 px-3 bg-white border border-purple-200 rounded-lg text-xs focus:outline-none text-purple-800 font-mono select-all"
          />
          <button
            onClick={handleCopy}
            className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 tap-feedback"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
