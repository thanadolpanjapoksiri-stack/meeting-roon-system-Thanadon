"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useEnterprise } from "@/lib/store/enterprise-store";
import { formatThaiDate, cn } from "@/lib/utils";
import { NotificationType } from "@/types";

export default function NotificationsPage() {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useEnterprise();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case "reminder":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-600" />
            ศูนย์การแจ้งเตือน (Notifications Center)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ประวัติการแจ้งเตือนแบบเรียลไทม์ การอนุมัติ การปฏิเสธ และการแจ้งเตือนล่วงหน้าก่อนเริ่มประชุม
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>ทำเครื่องหมายว่าอ่านแล้วทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 text-xs font-semibold rounded-xl transition-all",
            filter === "all"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          ทั้งหมด ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={cn(
            "px-4 py-2 text-xs font-semibold rounded-xl transition-all",
            filter === "unread"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          ยังไม่ได้อ่าน ({unreadNotificationsCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            ไม่มีรายการแจ้งเตือนในหมวดหมู่นี้
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={cn(
                "p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/80 cursor-pointer",
                !n.is_read ? "bg-sky-50/40" : ""
              )}
            >
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex-shrink-0">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatThaiDate(n.created_at, true)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {n.message}
                </p>

                {n.link_url && (
                  <div className="mt-3">
                    <Link
                      href={n.link_url}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      ดูรายการที่เกี่ยวข้อง <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
