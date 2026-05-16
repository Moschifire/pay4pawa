export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-24">
      <div className="z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-4xl font-bold text-brand-700">Pay4Pawa</h1>
        <p className="text-gray-500 mt-2">Enterprise Electricity Management</p>
        <div className="mt-8">
          <button className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-all">
            Secure Login
          </button>
        </div>
      </div>
    </main>
  );
}