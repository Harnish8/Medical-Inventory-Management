"use client";

import { Bell, Search, Menu, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarProvider";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
            placeholder="Search products, batches, bills..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile search icon */}
        <button className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Search size={20} />
        </button>

        {/* ⚡ Generate New Bill — quick action, visible on every page */}
        <Link
          href="/dashboard/billing/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition-all shadow-sm hover:shadow-md"
          title="Generate New Bill"
        >
          <FileText size={16} />
          <span className="hidden sm:inline">New Bill</span>
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
