import { Metadata } from 'next';
import { ForBusinessClient } from './ForBusinessClient';

export const metadata: Metadata = {
  title: 'OyaPlan for Business — More Squads. Zero Empty Seats.',
  description: 'Join Lagos’ top dining and nightlife venues reaching verified outing planners. Planners know what they will spend before leaving home — make sure they spend it with you.',
  openGraph: {
    title: 'OyaPlan for Business — More Squads. Zero Empty Seats.',
    description: 'Control how your restaurant, lounge, or venue appears when Lagos squads decide where to go and what to spend.',
    url: 'https://oyaplan.com/for-business',
    siteName: 'OyaPlan for Business',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/og/business',
        width: 1200,
        height: 630,
        alt: 'OyaPlan for Business — More Squads. Zero Empty Seats.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OyaPlan for Business — More Squads. Zero Empty Seats.',
    description: 'Control how your restaurant, lounge, or venue appears when Lagos squads decide where to go and what to spend.',
    images: ['/og/business'],
  },
};

export default function ForBusinessPage() {
  return <ForBusinessClient />;
}
