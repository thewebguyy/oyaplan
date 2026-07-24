"use client";

import { useState } from "react";
import { Clock, Tag, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { submitVenueEditRequest } from "@/lib/queries/operator";
import { Venue } from "@/lib/types";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
}

interface ManageVenueClientProps {
  userId: string;
  venue: Venue;
  initialMenuItems: MenuItem[];
}

export default function ManageVenueClient({
  userId,
  venue,
  initialMenuItems,
}: ManageVenueClientProps) {
  const menuItems = initialMenuItems;
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [digitizingFile, setDigitizingFile] = useState(false);
  const [digitizeSuccess, setDigitizeSuccess] = useState(false);

  const handleEditRequest = async (item: MenuItem) => {
    setEditingItem(item);
    setNewPrice(item.price.toString());
    setSuccess(false);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedPrice = parseInt(newPrice.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    setLoading(true);
    const res = await submitVenueEditRequest(
      userId,
      venue.id,
      `menu_item_price_${editingItem.id}`,
      { price: editingItem.price },
      { price: parsedPrice }
    );
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setEditingItem(null);
    }
  };

  const handleDigitizeUpload = async () => {
    setDigitizingFile(true);
    // Simulate uploading menu scan PDF to digitizing pipeline
    setTimeout(() => {
      setDigitizingFile(false);
      setDigitizeSuccess(true);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hours & Config */}
        <div className="bg-white border border-border-default/60 rounded-[24px] p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Opening Hours</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Weekdays:</span>
              <span className="font-bold text-text-primary">10:00 AM - 10:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-text-muted">Weekends:</span>
              <span className="font-bold text-text-primary">12:00 PM - 02:00 AM</span>
            </div>
          </div>
        </div>

        {/* Menu Digitization OCR Box */}
        <div className="bg-white border border-border-default/60 rounded-[24px] p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Digitize Menu Scan</h3>
          </div>
          <p className="text-xs text-text-muted">
            Upload a PDF or Photo of your updated menu. Our AI pipeline digitizes and syncs changes automatically after moderation.
          </p>

          {digitizeSuccess ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold">Uploaded! Digitization processing in background.</p>
            </div>
          ) : (
            <button
              onClick={handleDigitizeUpload}
              disabled={digitizingFile}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {digitizingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Upload Menu PDF / Photo"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Menu List & Price Edits */}
      <div className="bg-white border border-border-default/60 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-lagoon">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#008751]" />
            <h3 className="text-base font-black text-midnight-lagoon">Menu Items</h3>
          </div>
          <span className="text-xs font-bold text-text-muted">{menuItems.length} items</span>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-[#008751] bg-[#F0FBF5] p-3 rounded-lg border border-[#008751]/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-bold">Edit request submitted to moderator queue. Prices update once approved.</p>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {menuItems.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-muted mt-0.5 uppercase tracking-wider font-semibold">
                  Category: {item.category}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-midnight-lagoon text-sm">
                  ₦{item.price.toLocaleString()}
                </span>
                <button
                  onClick={() => handleEditRequest(item)}
                  className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-text-primary text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors"
                >
                  Edit Price
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-default/60 rounded-[24px] p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="space-y-1">
              <h4 className="font-black text-midnight-lagoon text-base">Request Price Change</h4>
              <p className="text-xs text-text-muted">For: {editingItem.name}</p>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  New Price (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">
                    ₦
                  </span>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full h-11 pl-7 pr-4 bg-surface-grey border border-border-default rounded-[10px] text-sm focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 h-10 border border-border-default text-text-primary text-xs font-bold uppercase rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPrice}
                  className="flex-1 h-10 bg-[#008751] hover:bg-[#006b41] disabled:opacity-40 text-white text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
