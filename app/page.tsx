"use client"

import { useState, useEffect } from "react"
import { Map, LayoutDashboard, Gauge, Radio } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { MapPanel } from "@/components/dashboard/map-panel"
import { RightPanel } from "@/components/dashboard/right-panel"
import { cn } from "@/lib/utils"
import { useDisaster } from "@/src/context/DisasterContext"

type MobileTab = "map" | "overview" | "sliders" | "feed"

const MOBILE_TABS: { id: MobileTab; label: string; Icon: typeof Map }[] = [
  { id: "map", label: "Map", Icon: Map },
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "sliders", label: "AI Sliders", Icon: Gauge },
  { id: "feed", label: "Live Feed", Icon: Radio },
]

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<MobileTab>("map")
  const { visibleIncidents, setActiveRightTab } = useDisaster()
  const criticalCount = visibleIncidents.filter((i) => i.severity === "Critical").length

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab)
    // Keep right panel tab in sync
    if (tab === "sliders") setActiveRightTab("sliders")
    if (tab === "feed") setActiveRightTab("feed")
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#1A1918] text-[#ECEAE6]">
      <DashboardHeader />

      {/* Content area — fills remaining space above bottom tab bar */}
      <div className="relative flex-1 min-h-0 overflow-hidden">

        {/* MAP TAB */}
        <div className={cn("absolute inset-0", activeTab === "map" ? "flex flex-col" : "hidden")}>
          <MapPanel />
        </div>

        {/* OVERVIEW TAB (Sidebar content) */}
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "overview" ? "block" : "hidden")}>
          <DashboardSidebar />
        </div>

        {/* AI SLIDERS + LIVE FEED TAB — rendered via RightPanel but with forced active tab */}
        <div className={cn("absolute inset-0 flex flex-col overflow-hidden", (activeTab === "sliders" || activeTab === "feed") ? "flex" : "hidden")}>
          <RightPanel />
        </div>
      </div>

      {/* Bottom Tab Bar — fixed to bottom, always visible */}
      <div className="shrink-0 flex items-stretch border-t border-white/[0.08] bg-[#1A1918]/95 backdrop-blur-xl pb-safe">
        {MOBILE_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id
          const showBadge = id === "feed" && visibleIncidents.length > 0
          const showCriticalBadge = id === "map" && criticalCount > 0

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-all active:scale-95",
                isActive
                  ? "text-emerald-400 font-semibold"
                  : "text-[#A8A29A] hover:text-[#ECEAE6]"
              )}
            >
              {/* Active indicator line at top */}
              {isActive && (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}

              <span className="relative">
                <Icon className={cn("size-5", isActive ? "text-emerald-400" : "text-[#A8A29A]")} />
                {/* Notification badge */}
                {showBadge && !isActive && (
                  <span className="absolute -right-2 -top-1.5 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black font-mono">
                    {visibleIncidents.length > 9 ? "9+" : visibleIncidents.length}
                  </span>
                )}
                {showCriticalBadge && !isActive && criticalCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white font-mono animate-pulse">
                    {criticalCount}
                  </span>
                )}
              </span>

              <span className={cn("leading-none", isActive ? "text-emerald-400" : "text-[#A8A29A]")}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DesktopLayout() {
  const { showLeftSidebar, showRightPanel } = useDisaster()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#1A1918] text-[#ECEAE6]">
      <DashboardHeader />
      <div className="relative flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={cn(
            "hidden lg:flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-white/[0.08]",
            showLeftSidebar
              ? "w-[255px] xl:w-[275px] opacity-100"
              : "w-0 opacity-0 border-r-0 pointer-events-none"
          )}
        >
          <div className="w-[255px] xl:w-[275px] h-full flex flex-col min-h-0">
            <DashboardSidebar />
          </div>
        </div>

        {/* Center Main Map Area */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-2.5 transition-all duration-300">
          <MapPanel />
        </main>

        {/* Right Panel */}
        <div
          className={cn(
            "hidden lg:flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-l border-white/[0.08]",
            showRightPanel
              ? "w-[310px] xl:w-[335px] opacity-100"
              : "w-0 opacity-0 border-l-0 pointer-events-none"
          )}
        >
          <div className="w-[310px] xl:w-[335px] h-full flex flex-col min-h-0">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  // Initial SSR / hydration fallback
  if (isDesktop === null) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#1A1918] text-[#ECEAE6]">
        <DesktopLayout />
      </div>
    )
  }

  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}
