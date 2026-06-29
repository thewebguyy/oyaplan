import { signInAdmin } from '@/lib/actions/adminAuth';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            OyaPlan Admin
          </h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
        </div>

        {error === 'invalid_credentials' && (
          <p className="text-sm text-red-600 font-medium">
            Incorrect email or password.
          </p>
        )}

        <form action={signInAdmin} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="type-label text-gray-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="type-label text-gray-600">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#008751] text-white text-sm font-black rounded-lg hover:bg-[#006e42] transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
