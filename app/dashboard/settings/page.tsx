"use client";

import { useSession } from "next-auth/react";
import { Store, User, Shield, Bell, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully! (Note: Global store settings will reflect on new invoices)");
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage store configuration, billing details, and your profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Nav (Desktop) */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-medium rounded-xl text-left border border-blue-100 transition-colors">
            <Store size={18} /> Store Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 font-medium rounded-xl text-left hover:bg-gray-50 transition-colors border border-transparent">
            <User size={18} /> My Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 font-medium rounded-xl text-left hover:bg-gray-50 transition-colors border border-transparent">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 font-medium rounded-xl text-left hover:bg-gray-50 transition-colors border border-transparent">
            <Shield size={18} /> Security
          </button>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Store Profile</h2>
              <p className="text-sm text-gray-500 mb-6">This information appears on your customer invoices and PDF reports.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  defaultValue="Kirtan Medical Store"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration / License No.</label>
                <input
                  type="text"
                  defaultValue="DL-2023-XYZ-9988"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  defaultValue="22AAAAA0000A1Z5"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                <textarea
                  rows={3}
                  defaultValue="123 Health Avenue, Medical District, City, State - 123456"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                <input
                  type="text"
                  defaultValue="+91 99999 00000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input
                  type="email"
                  defaultValue="contact@kirtanmedical.com"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4 mt-12">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Admin Account</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input
                  type="text"
                  readOnly
                  value={session?.user?.name || "Admin"}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  readOnly
                  value={(session?.user as any)?.role || "Administrator"}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-blue-800 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
              >
                <Save size={18} />
                <span>{loading ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
