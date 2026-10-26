import localFont from "next/font/local";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// next/font self hosts the fonts with the rest of the site, so there's no
// render blocking request to Google. These are the same variable font files
// Google Fonts serves (latin subset), with font-display: swap.
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
});

const playfair = localFont({
  src: "./fonts/playfair-display-latin-wght-normal.woff2",
  weight: "400 900",
  display: "swap",
  variable: "--font-playfair",
});

export const metadata = {
  title: "L'Oréal | Smart Product Advisor",
  description:
    "Lori, L'Oréal's AI-powered product advisor for skincare, haircare, makeup, and beauty routines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <div className="page-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
