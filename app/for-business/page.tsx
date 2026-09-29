import { Metadata } from 'next';
import { ForBusinessClient } from './ForBusinessClient';

export const metadata: Metadata = {
  title: 'OyaPlan for Business — Be There When People Decide Where to Spend',
  description: 'Free marketplace listing for Lagos restaurants, lounges, and venues. Help people calculate outing budgets before leaving home, and turn planning intent into direct reservations.',
  openGraph: {
    title: 'OyaPlan for Business — Be There When People Decide Where to Spend',
    description: 'Free marketplace listing for Lagos restaurants, lounges, and venues. Turn planning intent into direct reservations with 100% direct deposits to your venue.',
    url: 'https://oyaplan.com/for-business',
    siteName: 'OyaPlan for Business',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/og/business',
        width: 1200,
        height: 630,
        alt: 'OyaPlan for Business — Be There When People Decide Where to Spend',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OyaPlan for Business — Be There When People Decide Where to Spend',
    description: 'Free marketplace listing for Lagos restaurants, lounges, and venues. Turn planning intent into direct reservations with 100% direct deposits to your venue.',
    images: ['/og/business'],
  },
};

export default function ForBusinessPage() {
  return <ForBusinessClient />;
}
