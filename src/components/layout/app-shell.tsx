"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { EnterpriseProvider } from "@/lib/store/enterprise-store";
import { Toaster } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <EnterpriseProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 transition-all">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </EnterpriseProvider>
  );
}
