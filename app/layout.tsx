import type { Metadata } from "next";
import "@fontsource-variable/geist-mono";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import "./console.css";
import "./atelier.css";
import "./operations.css";
import "./clarity.css";
import { DashboardProvider } from "@/components/overview/dashboard-provider";
import { OperationsProvider } from "@/components/admin/operations-provider";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenuProvider } from "@/components/layout/command-menu";
import { SiteHeader } from "@/components/layout/site-header";
import { RouteContent } from "@/components/layout/route-content";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "인프라대시 · 인프라의 오늘을 선명하게",
    template: "%s · 인프라대시",
  },
  description:
    "배포 흐름과 연결된 인프라를 한눈에. 우리 팀의 데이터를 연결하는 한글 인프라 운영 대시보드.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full">
      <body className="min-h-full antialiased">
        <a className="skip-to-content" href="#main-content">
          본문으로 건너뛰기
        </a>
        <ThemeProvider>
          <OperationsProvider>
            <DashboardProvider>
              <TooltipProvider>
                <CommandMenuProvider>
                  <SidebarProvider
                    style={
                      {
                        "--sidebar-width": "14rem",
                        "--header-height": "4.5rem",
                      } as React.CSSProperties
                    }
                  >
                    <AppSidebar />
                    <SidebarInset className="min-w-0">
                      <SiteHeader />
                      <div
                        id="main-content"
                        tabIndex={-1}
                        className="flex flex-1 flex-col"
                      >
                        <RouteContent>{children}</RouteContent>
                      </div>
                    </SidebarInset>
                  </SidebarProvider>
                  <Toaster richColors position="top-right" />
                </CommandMenuProvider>
              </TooltipProvider>
            </DashboardProvider>
          </OperationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
