import type { Metadata } from "next";
import "./globals.css";
import "./mobile-hero.css";
import { AppProvider } from "@/components/AppProvider";

export const metadata: Metadata = {
  title: "MYIN — Muslim Youth Internship Network",
  description: "A transparent, safety-first opportunity network connecting Muslim youth with internships, volunteering, mentorship, and community projects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
