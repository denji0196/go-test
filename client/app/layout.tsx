import Navbar from "@/components/Navbar/Navbar";
import "./globals.css";
import { Metadata } from "next";
import Providers from "./provider";
import TodoForm from "@/components/ListItem/TodoCreate";
import { TodoList } from "@/components/ListItem/TodoList";

export const metadata: Metadata = {
  title: "Kira",
  description: "hello world",
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
