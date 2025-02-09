import Navbar from "@/components/Navbar/Navbar";
import "./globals.css";
import { Metadata } from "next";
import Providers from "./provider";

export const metadata: Metadata = {
  title: "SECRET_PROJECT",
  description: "SECRET_PROJECT",
  keywords: ["Next.js"],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="container">
            {children}
          
          
          </main>

        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
