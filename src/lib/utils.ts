import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BookingStatus, RoomStatus, UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Thai Month Names
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

/**
 * Format ISO date string into Thai localized readable format
 */
export function formatThaiDate(isoString: string, includeTime: boolean = false): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";

    const day = d.getDate();
    const month = THAI_MONTHS_SHORT[d.getMonth()];
    const year = d.getFullYear() + 543; // Buddhist Era

    if (includeTime) {
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      return `${day} ${month} ${year} ${hours}:${minutes} น.`;
    }

    return `${day} ${month} ${year}`;
  } catch {
    return "-";
  }
}

/**
 * Format Time Range like "13:00 - 15:30 น."
 */
export function formatTimeRange(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const sH = s.getHours().toString().padStart(2, "0");
    const sM = s.getMinutes().toString().padStart(2, "0");
    const eH = e.getHours().toString().padStart(2, "0");
    const eM = e.getMinutes().toString().padStart(2, "0");

    return `${sH}:${sM} - ${eH}:${eM} น.`;
  } catch {
    return "-";
  }
}

/**
 * Format Status Labels in Thai
 */
export function getStatusLabel(status: BookingStatus | RoomStatus | UserRole): string {
  switch (status) {
    // Booking Status
    case "approved":
      return "อนุมัติแล้ว";
    case "pending":
      return "รออนุมัติ";
    case "rejected":
      return "ไม่อนุมัติ";
    case "cancelled":
      return "ยกเลิกแล้ว";

    // Room Status
    case "available":
      return "พร้อมใช้งาน";
    case "maintenance":
      return "ปิดปรับปรุง";
    case "inactive":
      return "ปิดการใช้งาน";

    // Role
    case "admin":
      return "ผู้ดูแลระบบ (Admin)";
    case "approver":
      return "ผู้อนุมัติ (Approver)";
    case "user":
      return "ผู้ใช้งานทั่วไป (User)";

    default:
      return status;
  }
}

/**
 * Status Badge Styling (Tailwind class string)
 */
export function getStatusBadgeClass(status: BookingStatus | RoomStatus): string {
  switch (status) {
    case "approved":
    case "available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-600/20";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-600/20";
    case "rejected":
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-600/20";
    case "maintenance":
      return "bg-slate-100 text-slate-700 border-slate-300 ring-slate-500/20";
    case "inactive":
      return "bg-gray-100 text-gray-500 border-gray-300 ring-gray-400/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

/**
 * Export data to CSV download file
 */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || !rows.length) return;

  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    "\uFEFF" + // UTF-8 BOM for Excel Thai language support
    keys.join(separator) +
    "\n" +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            const raw = row[k];
            let val =
              raw === null || raw === undefined
                ? ""
                : raw instanceof Date
                ? raw.toLocaleString()
                : String(raw);
            val = val.replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) {
              val = `"${val}"`;
            }
            return val;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
