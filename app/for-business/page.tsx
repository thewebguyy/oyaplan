import { Metadata } from 'next';
import { ForBusinessClient } from './ForBusinessClient';

export const metadata: Metadata = {
  title: 'OyaPlan for Business — More Squads. Zero Empty Seats.',
  description: 'Join Lagos’ top lounges and dining spots reaching thousands of weekend planners natively. Planners decide what they will spend before leaving home — make sure they spend it with you.',
};

export default function ForBusinessPage() {
  return <ForBusinessClient />;
}
