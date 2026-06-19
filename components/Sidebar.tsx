"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "./SidebarProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { isOpen, closeSidebar } = useSidebar();

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Batches", href: "/dashboard/batches", icon: Layers },
    { name: "Inventory", href: "/dashboard/inventory", icon: ShoppingCart },
    { name: "Billing", href: "/dashboard/billing", icon: FileText },
    { name: "Dealers", href: "/dashboard/dealers", icon: Users },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const employeeLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Billing", href: "/dashboard/billing", icon: FileText },
    { name: "Inventory", href: "/dashboard/inventory", icon: ShoppingCart },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  ];

  const links = role === "Admin" ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              K
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">Kirtan Medical</h2>
              <p className="text-xs text-gray-500">ERP System v2.0</p>
            </div>
          </div>
          <button 
            onClick={closeSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  // Close sidebar on mobile when a link is clicked
                  if (window.innerWidth < 768) {
                    closeSidebar();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-primary font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{role}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-critical rounded-xl transition-colors"
          >
            <LogOut size={20} className="text-gray-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
