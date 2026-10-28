"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Building2,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, switchRole, isRealtimeConnected } = useEnterprise();

  const navItems = [
    {
      title: "แดชบอร์ด (Dashboard)",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "ปฏิทินการจอง (Calendar)",
      href: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "จองห้องประชุม (Book Room)",
      href: "/create-booking",
      icon: PlusCircle,
      highlight: true,
    },
    {
      title: "จัดการห้องประชุม (Rooms)",
      href: "/rooms",
      icon: Building2,
      roleRequired: ["admin"],
    },
    {
      title: "รายการจอง (Bookings)",
      href: "/bookings",
      icon: ClipboardList,
    },
    {
      title: "รายงานและสถิติ (Reports)",
      href: "/reports",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-navy-900 border-r border-navy-800 text-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-6 border-b border-navy-800/80 bg-navy-950/40">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Smart Room
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Pro
                </span>
              </div>
              <div className="text-xs text-slate-400">ระบบจองห้องประชุมอัจฉริยะ</div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realtime Status Indicator */}
        <div className="px-6 py-2.5 bg-navy-950/20 border-b border-navy-800/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isRealtimeConnected ? "bg-emerald-400" : "bg-amber-400"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isRealtimeConnected ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              {isRealtimeConnected ? "Realtime Online" : "Connecting..."}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Asia/Bangkok (UTC+7)</span>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            เมนูหลัก (Main Menu)
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isRestricted = item.roleRequired && !item.roleRequired.includes(currentUser.role);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative",
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                    : item.highlight
                    ? "text-sky-300 bg-sky-950/40 border border-sky-800/40 hover:bg-sky-900/50 hover:text-white"
                    : "text-slate-300 hover:text-white hover:bg-navy-800/70",
                  isRestricted && "opacity-60"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-white"
                      : item.highlight
                      ? "text-sky-400 group-hover:text-white"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="flex-1 truncate">{item.title}</span>
                {isRestricted && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-800 text-slate-400 font-mono">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Role Persona Switcher (For testing permissions seamlessly) */}
        <div className="p-4 mx-3 mb-4 rounded-2xl bg-navy-950/60 border border-navy-800/90 shadow-inner">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              สิทธิ์ผู้ใช้งานปัจจุบัน
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {currentUser.role}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight mb-3">
            สลับ Persona เพื่อทดสอบสิทธิ์ของแต่ละบทบาท:
          </p>

          <div className="grid grid-cols-3 gap-1.5">
            {(["admin", "approver", "user"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={cn(
                  "py-1.5 text-xs font-medium rounded-lg capitalize transition-all border",
                  currentUser.role === r
                    ? "bg-brand-600 border-brand-500 text-white font-semibold shadow-sm"
                    : "bg-navy-800/80 border-navy-700/60 text-slate-300 hover:text-white hover:bg-navy-700"
                )}
              >
                {r === "admin" ? "Admin" : r === "approver" ? "Approver" : "User"}
              </button>
            ))}
          </div>
        </div>

        {/* User Card Footer */}
        <div className="p-4 border-t border-navy-800/80 bg-navy-950/40 flex items-center gap-3">
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80"}
            alt={currentUser.full_name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.full_name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser.email}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
