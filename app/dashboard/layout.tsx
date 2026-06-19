import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      <div className="print:hidden h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-6 relative print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
