import React from 'react';
import { Venue, VenuePhoto } from '@/lib/types';
import { VenueImage } from '@/components/ui/VenueImage';
import { Camera, ShieldCheck } from 'lucide-react';

interface PublicGalleryProps {
  venue: Venue;
  photos?: VenuePhoto[];
}

export function PublicGallery({ venue, photos = [] }: PublicGalleryProps) {
  const approvedPartnerPhotos = photos.filter(p => p.status === 'approved');
  const galleryUrls = venue.gallery_urls || [];
  
  // Aggregate distinct photos
  const allImages: Array<{ url: string; source: 'verified_partner' | 'editorial' }> = [];

  if (venue.cover_url) {
    allImages.push({
      url: venue.cover_url,
      source: venue.partner_state === 'verified_partner' ? 'verified_partner' : 'editorial'
    });
  }

  for (const p of approvedPartnerPhotos) {
    if (!allImages.some(img => img.url === p.url)) {
      allImages.push({ url: p.url, source: 'verified_partner' });
    }
  }

  for (const url of galleryUrls) {
    if (!allImages.some(img => img.url === url)) {
      allImages.push({ url, source: 'editorial' });
    }
  }

  if (allImages.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-green" />
            <span>Venue Photos</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Verified photos of the space, ambiance, and food.
          </p>
        </div>
        <span className="text-xs font-bold text-text-muted">{allImages.length} photos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {allImages.slice(0, 6).map((img, i) => (
          <div
            key={i}
            className="group relative h-40 sm:h-52 rounded-2xl overflow-hidden bg-surface-grey border border-border-default/60 shadow-xs"
          >
            <VenueImage
              src={img.url}
              alt={`${venue.name} photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 300px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="absolute bottom-2 left-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/90 text-midnight-lagoon backdrop-blur-sm shadow-xs">
                {img.source === 'verified_partner' ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5 text-[#008751]" />
                    <span>Partner Verified</span>
                  </>
                ) : (
                  <span>OyaPlan Curated</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
