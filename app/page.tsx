import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kirtan Medical Store</h1>
        <p className="text-gray-500 mb-8">Enterprise Inventory & Billing System</p>
        
        <Link href="/login" className="block w-full py-3 px-4 bg-primary hover:bg-blue-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          Login to Dashboard
        </Link>
      </div>
      
      <div className="mt-8 text-sm text-gray-400">
        Version 2.0.0 &bull; Secure Access Only
      </div>
    </main>
  );
}
