export default function VerifyLoading() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#f5f8ff] px-4 py-16">
      <div className="w-full max-w-lg rounded-[2rem] border border-white bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#10234a]">
          Preparing verification
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          Please wait while we prepare your email verification page.
        </p>
      </div>
    </main>
  );
}
