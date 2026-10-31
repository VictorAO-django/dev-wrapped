import { Space_Grotesk, Inter, Archivo_Black } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "GitHub Wrapped",
  description: "Your GitHub year, wrapped and roasted by AI (Gemma, via the Gemini API).",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${archivoBlack.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
