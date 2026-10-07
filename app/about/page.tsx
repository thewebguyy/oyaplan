import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "The Lagos Manifesto — About OyaPlan",
  description: "Lagos is stressful enough. Your enjoyment shouldn't be. We built OyaPlan to help you hack the soft life, avoid unexpected billing, and confidently plan linkups that match your pocket.",
};

export default function AboutPage() {
  return <AboutClient />;
}
