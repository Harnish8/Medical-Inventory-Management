"use client";

import { Printer } from "lucide-react";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PrintLogic() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // If we navigated here with ?print=true, auto-trigger the print dialog after a short delay to allow rendering
    if (searchParams.get("print") === "true") {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  return null;
}

export default function PrintButton() {
  return (
    <>
      <Suspense fallback={null}>
        <PrintLogic />
      </Suspense>
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm print:hidden"
      >
        <Printer size={18} />
        <span>Print Invoice</span>
      </button>
    </>
  );
}
