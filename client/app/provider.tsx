"use client"; // ✅ ใช้ "use client" เพราะมี React hooks

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: ReactNode;
}
export const BASE_URL = process.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient()); // ✅ สร้าง QueryClient หนึ่งตัว

  return (
    <QueryClientProvider client={queryClient}> {/* ✅ เพิ่ม QueryClientProvider */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
