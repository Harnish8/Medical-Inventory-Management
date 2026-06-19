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
  Bell
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
          K
        </div>
        <div>
          <h2 className="font-bold text-gray-900 leading-tight">Kirtan Medical</h2>
          <p className="text-xs text-gray-500">ERP System v2.0</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link
              key={link.name}
              href={link.href}
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
  );
}
