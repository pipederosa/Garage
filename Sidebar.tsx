"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { href: "/nafta", label: "Nafta", icon: "M4 21V5a2 2 0 012-2h7a2 2 0 012 2v16M4 21h11M7 7h5v4H7zM15 10h2a2 2 0 012 2v5a1.5 1.5 0 003 0V9l-3-3" },
  { href: "/service", label: "Service", icon: "M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z" },
  { href: "/mecanico", label: "Mecánico", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" },
  { href: "/otros", label: "Otros gastos", icon: "M9 14l6-6M9.5 8.5h.01M14.5 13.5h.01M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2-2 2-2-2-2 2-2-2-3 2z" },
  { href: "/autos", label: "Mis autos", icon: "M5 17h14M5 17a2 2 0 11-4 0v-5l2-5h14l2 5h2v5a2 2 0 11-4 0M5 17a2 2 0 104 0m6 0a2 2 0 104 0M3 12h18" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <div className="grid size-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">G</div>
        <span className="text-base font-semibold text-slate-900">Garage</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon d={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="p-5 text-xs text-slate-400">Datos en Google Sheets</p>
    </aside>
  );
}

/** Navegación horizontal para pantallas chicas. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
            isActive(pathname, item.href) ? "bg-blue-50 text-blue-700" : "text-slate-600"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
