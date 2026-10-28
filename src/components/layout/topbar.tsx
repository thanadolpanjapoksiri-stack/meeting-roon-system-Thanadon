"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Plus,
  Clock,
  Check,
  CheckCheck,
  ExternalLink,
  Shield,
  Calendar,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { formatThaiDate } from "@/lib/utils";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const router = useRouter();
  const {
    currentUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useEnterprise();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const notifRef = useRef<HTMLDivElement>(null);

  // Live Clock (Asia/Bangkok)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/bookings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      {/* Left section: Hamburger (Mobile) + Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="p-2 text-slate-600 rounded-xl hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาห้องประชุม, หัวข้อ หรือผู้จอง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 placeholder-slate-400"
          />
        </form>
      </div>

      {/* Right section: Live Time, Book Button, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Time display */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>{currentTime || "10:30 น."}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{formatThaiDate(new Date().toISOString())}</span>
        </div>

        {/* Quick Booking Button */}
        <Link
          href="/create-booking"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>จองห้องทันที</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="แจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">การแจ้งเตือน</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                    {unreadNotificationsCount} ใหม่
                  </span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    อ่านทั้งหมด
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.is_read ? "bg-sky-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-xs text-slate-900 leading-snug">
                          {notif.title}
                        </div>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-2">
                        {formatThaiDate(notif.created_at, true)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                <Link
                  href="/bookings"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  ดูรายการจองทั้งหมด <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80"}
            alt={currentUser.full_name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-800 line-clamp-1">
              {currentUser.full_name}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
