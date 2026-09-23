'use client';

import React, { useState } from 'react';
import { Venue, MenuItem, VenuePhoto, SpotCategory } from '@/lib/types';
import { OnboardingStepIndicator } from '@/components/partner/OnboardingStepIndicator';
import { saveOnboardingStepAction, submitForVerificationAction, uploadVenuePhotoAction } from '@/lib/actions/partnerOnboardingActions';
import { 
  Building2, 
  Receipt, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PartnerOnboardingClientProps {
  venue: Venue;
  initialMenuItems: MenuItem[];
  initialPhotos: VenuePhoto[];
}

const CATEGORIES: { value: SpotCategory; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'rooftop', label: 'Rooftop Bar / Lounge' },
  { value: 'cafe', label: 'Café & Bakery' },
  { value: 'beach', label: 'Beach Club / Resort' },
  { value: 'arts_culture', label: 'Arts & Culture' },
  { value: 'activity', label: 'Activity / Games' },
  { value: 'club', label: 'Nightclub / Late Lounge' },
  { value: 'cinema', label: 'Cinema / Screen' },
  { value: 'spa', label: 'Spa & Wellness' },
];

const OCCASIONS = [
  'Date night',
  'Dinner',
  'Brunch',
  'Birthday',
  'Group hangout',
  'Casual meal',
  'Coffee',
  'Work/social',
  'Nightlife',
  'Recreation',
];

const AUDIENCES = [
  'Couples',
  'Friends',
  'Small groups',
  'Large groups',
  'Solo',
  'Families',
  'Professionals',
];

export function PartnerOnboardingClient({
  venue,
  initialMenuItems,
  initialPhotos,
}: PartnerOnboardingClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(venue.partner_state === 'verification_pending');

  // Step 1: Business info
  const [name, setName] = useState(venue.name || '');
  const [category, setCategory] = useState<SpotCategory>(venue.category || 'restaurant');
  const [description, setDescription] = useState(venue.description || '');
  const [address, setAddress] = useState(venue.address || '');
  const [contactNumber, setContactNumber] = useState(venue.contact_number || '');
  const [contactEmail, setContactEmail] = useState(venue.contact_email || '');
  const [instagramHandle, setInstagramHandle] = useState(venue.instagram_handle || '');
  const [hasParking, setHasParking] = useState(venue.has_parking ?? true);
  const [dressCode, setDressCode] = useState(venue.dress_code || 'Casual');
  const [indoorOutdoor, setIndoorOutdoor] = useState(venue.indoor_outdoor || 'both');

  // Step 2: Charges & Taxing
  const [vatPct, setVatPct] = useState(venue.vat_pct ?? 7.5);
  const [serviceChargePct, setServiceChargePct] = useState(venue.service_charge_pct ?? 10);
  const [minimumSpend, setMinimumSpend] = useState(venue.minimum_spend ?? 0);
  const [corkageFee, setCorkageFee] = useState(venue.corkage_fee ?? 0);
  const [entranceFee, setEntranceFee] = useState(venue.entrance_fee ?? 0);
  const [weekendPricingNotes, setWeekendPricingNotes] = useState(venue.weekend_pricing_notes || '');

  // Step 3: Experience Fit
  const [vibeTags, setVibeTags] = useState<string[]>(venue.vibe_tags || []);
  const [audienceTags, setAudienceTags] = useState<string[]>(venue.audience_tags || []);
  const [groupMin, setGroupMin] = useState(venue.group_suitability_min ? String(venue.group_suitability_min) : '1');
  const [groupMax, setGroupMax] = useState(venue.group_suitability_max ? String(venue.group_suitability_max) : '20');

  // Step 4: Photos
  const [coverUrl, setCoverUrl] = useState(venue.cover_url || '');
  const [photos, setPhotos] = useState<VenuePhoto[]>(initialPhotos);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoType, setNewPhotoType] = useState<'interior' | 'exterior' | 'food' | 'experience'>('food');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const toggleOccasion = (item: string) => {
    setVibeTags(prev => 
      prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]
    );
  };

  const toggleAudience = (item: string) => {
    setAudienceTags(prev => 
      prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]
    );
  };

  const handleSaveAndNext = async (targetNextStep: number) => {
    setIsSaving(true);
    setErrorMessage(null);

    let stepData: Record<string, any> = {};

    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMessage('Venue name is required');
        setIsSaving(false);
        return;
      }
      if (!address.trim()) {
        setErrorMessage('Address is required');
        setIsSaving(false);
        return;
      }
      stepData = {
        name,
        category,
        description,
        address,
        contact_number: contactNumber,
        contact_email: contactEmail,
        instagram_handle: instagramHandle,
        has_parking: hasParking,
        dress_code: dressCode,
        indoor_outdoor: indoorOutdoor,
      };
    } else if (currentStep === 2) {
      stepData = {
        vat_pct: Number(vatPct),
        service_charge_pct: Number(serviceChargePct),
        minimum_spend: Number(minimumSpend),
        corkage_fee: Number(corkageFee),
        entrance_fee: Number(entranceFee),
        weekend_pricing_notes: weekendPricingNotes,
      };
    } else if (currentStep === 3) {
      stepData = {
        vibe_tags: vibeTags,
        audience_tags: audienceTags,
        group_suitability_min: groupMin ? parseInt(groupMin, 10) : 1,
        group_suitability_max: groupMax ? parseInt(groupMax, 10) : 20,
      };
    } else if (currentStep === 4) {
      stepData = {
        cover_url: coverUrl,
      };
    }

    if (currentStep <= 4) {
      const res = await saveOnboardingStepAction({
        venueId: venue.id,
        step: currentStep as 1 | 2 | 3 | 4,
        data: stepData,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to save changes');
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setCurrentStep(targetNextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    setUploadingPhoto(true);
    setErrorMessage(null);

    const res = await uploadVenuePhotoAction({
      venueId: venue.id,
      url: newPhotoUrl.trim(),
      photoType: newPhotoType,
      caption: newPhotoCaption.trim() || undefined,
    });

    if (res.success && res.photoId) {
      const addedPhoto: VenuePhoto = {
        id: res.photoId,
        venue_id: venue.id,
        url: newPhotoUrl.trim(),
        photo_type: newPhotoType,
        caption: newPhotoCaption.trim() || null,
        status: 'uploaded',
        is_primary: false,
        submitted_by: null,
        verified_by: null,
        created_at: new Date().toISOString(),
      };
      setPhotos(prev => [addedPhoto, ...prev]);
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    } else {
      setErrorMessage(res.error || 'Failed to submit photo');
    }
    setUploadingPhoto(false);
  };

  const handleSubmitVerification = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const res = await submitForVerificationAction(venue.id);
    setIsSaving(false);

    if (res.success) {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(res.error || 'Failed to submit for verification');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#008751]/10 text-[#008751] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#010528] mb-2">Submitted for Review</h1>
          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            Thank you! OyaPlan will review your listing details, photos, and mandatory charges before marking them verified.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left mb-6 text-xs text-stone-600 space-y-2">
            <div className="font-semibold text-stone-800">What happens now?</div>
            <p>• Your venue remains visible to users with its updated baseline info.</p>
            <p>• Verification badges will be applied once our team cross-checks menu evidence.</p>
            <p>• You can update prices or report temporary closures any time from Partner Home.</p>
          </div>

          <Link
            href={`/partner/${venue.id}`}
            className="inline-flex items-center justify-center w-full bg-[#010528] hover:bg-[#008751] text-white py-3.5 px-6 rounded-xl font-medium transition-colors text-sm"
          >
            Return to Partner Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* Top sticky progress */}
      <OnboardingStepIndicator
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) {
            setCurrentStep(step);
          } else {
            handleSaveAndNext(step);
          }
        }}
      />

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Header message */}
        <div className="mb-6">
          <Link
            href={`/partner/${venue.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#010528] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Partner Home
          </Link>
          <h1 className="text-2xl font-bold text-[#010528] tracking-tight">
            Let's make your OyaPlan listing accurate
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            This information helps us show customers what they can realistically expect to spend at your venue.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Unable to proceed</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* STEP 1: BUSINESS */}
        {currentStep === 1 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Building2 className="w-5 h-5 text-[#008751]" />
              <h2 className="font-semibold text-stone-900">Step 1: Business Information & Operations</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  placeholder="e.g. The House Lagos"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SpotCategory)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Environment
                  </label>
                  <select
                    value={indoorOutdoor}
                    onChange={(e) => setIndoorOutdoor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    <option value="indoor">Indoor Only</option>
                    <option value="outdoor">Outdoor Only</option>
                    <option value="both">Both Indoor & Outdoor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Concise Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  placeholder="Tell planners what kind of experience and hospitality to expect..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Full Street Address & Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  placeholder="e.g. 4 AJ Marinho Drive, Victoria Island, Lagos"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Contact Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="e.g. +234 801 234 5678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="manager@venue.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="@thehouselagos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Parking Access
                  </label>
                  <select
                    value={hasParking ? 'yes' : 'no'}
                    onChange={(e) => setHasParking(e.target.value === 'yes')}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    <option value="yes">Dedicated Parking / Valet available</option>
                    <option value="no">Street Parking Only / Limited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Dress Code
                  </label>
                  <select
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Smart Casual">Smart Casual</option>
                    <option value="Elegant / High Fashion">Elegant / Upscale</option>
                    <option value="Beachwear / Resort">Beachwear / Relaxed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveAndNext(2)}
                disabled={isSaving}
                className="bg-[#010528] hover:bg-[#008751] text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & Continue to Pricing <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING */}
        {currentStep === 2 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Receipt className="w-5 h-5 text-[#008751]" />
              <h2 className="font-semibold text-stone-900">Step 2: Transparent Pricing & Mandatory Charges</h2>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#008751]" /> OyaPlan Total Cost Principle
              </div>
              Customers use OyaPlan specifically to avoid unexpected bills. Disclose VAT, service charge, and cover fees accurately so your visitors are prepared.
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    VAT Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={vatPct}
                    onChange={(e) => setVatPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="7.5"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Lagos standard is 7.5%</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={serviceChargePct}
                    onChange={(e) => setServiceChargePct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="10"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Commonly 10% in high-end venues</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Minimum Spend (₦)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={minimumSpend}
                    onChange={(e) => setMinimumSpend(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">0 if none required</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Corkage Fee (₦)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={corkageFee}
                    onChange={(e) => setCorkageFee(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Per bottle brought</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Entrance / Gate Fee (₦)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={entranceFee}
                    onChange={(e) => setEntranceFee(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Per person on entry</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Weekend / Special Event Pricing Notes
                </label>
                <input
                  type="text"
                  value={weekendPricingNotes}
                  onChange={(e) => setWeekendPricingNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  placeholder="e.g. Minimum spend of ₦50k applies to VIP cabanas on Sunday nights"
                />
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-stone-900">
                    Menu Items ({initialMenuItems.length} listed)
                  </div>
                  <div className="text-xs text-stone-500">
                    You can manage individual item prices on the dedicated pricing screen at any time.
                  </div>
                </div>
                <Link
                  href={`/partner/${venue.id}/pricing`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#008751] hover:underline"
                >
                  Manage Menu <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-stone-600 hover:text-stone-900 py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => handleSaveAndNext(3)}
                disabled={isSaving}
                className="bg-[#010528] hover:bg-[#008751] text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & Continue to Experience <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EXPERIENCE */}
        {currentStep === 3 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Sparkles className="w-5 h-5 text-[#008751]" />
              <h2 className="font-semibold text-stone-900">Step 3: Experience Fit & Suitability</h2>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Help OyaPlan's recommendation engine match your venue to people planning the right kind of outing. Select all that fit naturally.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Best For Occasions
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((tag) => {
                    const isSelected = vibeTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleOccasion(tag)}
                        className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                          isSelected
                            ? 'bg-[#008751] text-white shadow-sm'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {tag} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Suitable For Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map((tag) => {
                    const isSelected = audienceTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleAudience(tag)}
                        className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                          isSelected
                            ? 'bg-[#010528] text-white shadow-sm'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {tag} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Typical Min Group Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={groupMin}
                    onChange={(e) => setGroupMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Typical Max Group Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={groupMax}
                    onChange={(e) => setGroupMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    placeholder="20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-stone-600 hover:text-stone-900 py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => handleSaveAndNext(4)}
                disabled={isSaving}
                className="bg-[#010528] hover:bg-[#008751] text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & Continue to Photos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTOS */}
        {currentStep === 4 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Camera className="w-5 h-5 text-[#008751]" />
              <h2 className="font-semibold text-stone-900">Step 4: Photography & Atmosphere</h2>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-700 space-y-1">
              <div className="font-semibold text-[#010528]">Verification Notice:</div>
              <p>Photos you submit are reviewed by OyaPlan before appearing as approved partner photos.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Primary Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  placeholder="https://images.unsplash.com/..."
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  High-resolution landscape image showing the atmosphere of the venue.
                </span>
              </div>

              {/* Add new photo form */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                <div className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                  Submit Additional Photo
                </div>
                <form onSubmit={handleAddPhoto} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="Photo image URL..."
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    />
                    <select
                      value={newPhotoType}
                      onChange={(e) => setNewPhotoType(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    >
                      <option value="interior">Interior</option>
                      <option value="exterior">Exterior</option>
                      <option value="food">Food & Drinks</option>
                      <option value="experience">Experience / Crowd</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Caption (optional, e.g. Sunday Sunset Terrace)"
                      className="flex-1 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                    />
                    <button
                      type="submit"
                      disabled={uploadingPhoto || !newPhotoUrl.trim()}
                      className="bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Photos list */}
              {photos.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Submitted Photos ({photos.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((p) => (
                      <div key={p.id} className="relative rounded-xl overflow-hidden border border-stone-200 aspect-video bg-stone-100 group">
                        <img
                          src={p.url}
                          alt={p.caption || 'Venue photo'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            p.status === 'approved' ? 'bg-[#008751] text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {p.status === 'approved' ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-stone-600 hover:text-stone-900 py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => handleSaveAndNext(5)}
                disabled={isSaving}
                className="bg-[#010528] hover:bg-[#008751] text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Review & Submit <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {currentStep === 5 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-[#008751]" />
              <h2 className="font-semibold text-stone-900">Step 5: Review & Submit for Verification</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 divide-y divide-stone-200">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                    <span className="text-sm font-semibold text-stone-800">Business Information</span>
                  </div>
                  <span className="text-xs text-stone-600">{name} · {category}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                    <span className="text-sm font-semibold text-stone-800">Pricing & Mandatory Charges</span>
                  </div>
                  <span className="text-xs text-stone-600">VAT {vatPct}% · Service {serviceChargePct}%</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                    <span className="text-sm font-semibold text-stone-800">Experience Fit</span>
                  </div>
                  <span className="text-xs text-stone-600">{vibeTags.length} occasion tags selected</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                    <span className="text-sm font-semibold text-stone-800">Photography</span>
                  </div>
                  <span className="text-xs text-stone-600">{photos.length + (coverUrl ? 1 : 0)} photo(s) submitted</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> What happens next
                </div>
                <p>
                  Our operations team reviews the information and cross-references your pricing details before applying the Verified Partner badge.
                </p>
                <p className="text-amber-800">
                  You can update any detail or adjust prices at any time after submitting.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-stone-600 hover:text-stone-900 py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Photos
              </button>
              <button
                type="button"
                onClick={handleSubmitVerification}
                disabled={isSaving}
                className="bg-[#008751] hover:bg-[#007043] text-white py-3.5 px-8 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit for Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
