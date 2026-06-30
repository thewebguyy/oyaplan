import { createServerClient } from "@/lib/supabase-server";
import { captureServerException } from "@/lib/sentry";
import { getAllPlanRequests, getPlanCount, getPlanCountSince } from "@/lib/queries/plans";
import { getStaleSpotsForAdmin } from "@/lib/queries/spots";
import { getTesterObservations, getSpotSuggestions, getOperatorInquiries } from "@/lib/queries/admin";
import { signOutAdmin } from "@/lib/actions/adminAuth";
import { redirect } from "next/navigation";
import PageError from "@/components/PageError";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Fetch all dashboard data — allRequests is critical for aggregations; others degrade to empty
  let adminFetchError = false;
  let totalPlans = 0;
  let plansThisWeek = 0;
  let allRequests: Array<Record<string, string | number>> = [];
  let observations: Array<{ id: string; resolved: boolean; created_at: string; tester_name: string; device_and_network: string; what_they_tried: string; what_frustrated_them: string | null; what_they_wished_existed: string | null }> = [];
  let suggestions: Array<{ id: string; created_at: string; reviewed: boolean; spot_name: string; area_name: string; rough_price_per_person: number | null; suggester_whatsapp: string | null }> = [];
  let inquiries: Array<{ id: string; created_at: string; converted: boolean; contacted: boolean; business_name: string; owner_name: string; whatsapp_number: string; area_slug: string; listing_tier: string; monthly_budget_ngn: number | null }> = [];
  let staleSpots: Array<{ id: string; name: string; price_updated_at: string; verified_by: string | null; active: boolean }> = [];

  try {
    const [
      totalPlansResult,
      plansThisWeekResult,
      allRequestsResult,
      observationsResult,
      suggestionsResult,
      inquiriesResult,
      staleSpotsResult,
    ] = await Promise.all([
      getPlanCount(),
      getPlanCountSince(sevenDaysAgo.toISOString()),
      getAllPlanRequests(),
      getTesterObservations(),
      getSpotSuggestions(),
      getOperatorInquiries(),
      getStaleSpotsForAdmin(sixtyDaysAgo.toISOString()),
    ]);

    if (!allRequestsResult.error) {
      totalPlans = totalPlansResult.data;
      plansThisWeek = plansThisWeekResult.data;
      allRequests = (allRequestsResult.data || []) as typeof allRequests;
      observations = (observationsResult.data || []) as typeof observations;
      suggestions = (suggestionsResult.data || []) as typeof suggestions;
      inquiries = (inquiriesResult.data || []) as typeof inquiries;
      staleSpots = (staleSpotsResult.data || []) as typeof staleSpots;
    } else {
      adminFetchError = true;
    }
  } catch (e) {
    captureServerException(e);
    adminFetchError = true;
  }

  if (adminFetchError) {
    return <PageError message="Could not load admin dashboard data. Please try again." href="/admin" linkLabel="Retry" />;
  }

  const unresolvedCount = observations.filter(o => !o.resolved).length;
  const totalInquiries = inquiries.length;
  const unconvertedInquiries = inquiries.filter(i => !i.converted).length;

  // Aggregations
  const vibeCounts = allRequests.reduce<Record<string, number>>((acc, r) => {
    const vibe = String(r.vibe || "");
    acc[vibe] = (acc[vibe] || 0) + 1;
    return acc;
  }, {});
  const popularVibe = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const areaCounts = allRequests.reduce<Record<string, number>>((acc, r) => {
    const area = String(r.start_area || "");
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});
  const popularArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const budgetRanges = {
    "Under ₦20k": 0,
    "₦20k–₦50k": 0,
    "₦50k–₦100k": 0,
    "Over ₦100k": 0
  };
  allRequests.forEach(r => {
    const b = Number(r.budget);
    if (b < 20000) budgetRanges["Under ₦20k"]++;
    else if (b < 50000) budgetRanges["₦20k–₦50k"]++;
    else if (b < 100000) budgetRanges["₦50k–₦100k"]++;
    else budgetRanges["Over ₦100k"]++;
  });

  const recentRequests = allRequests.slice(0, 10);

  function timeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter text-[#008751]">
            OyaPlan Intelligence
          </h1>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          </form>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Plans", value: totalPlans },
            { label: "Plans This Week", value: plansThisWeek },
            { label: "Top Vibe", value: popularVibe },
            { label: "Top Area", value: popularArea }
          ].map(c => (
            <div key={c.label} className="p-6 bg-white border border-gray-200 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
              <p className="text-2xl font-black text-[#008751]">{c.value?.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Price Freshness Monitoring */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">Price Freshness Monitoring</h2>
            <span className={`px-3 py-1 text-xs font-black uppercase rounded-full ${
              (staleSpots?.length || 0) > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            }`}>
              {staleSpots?.length || 0} spots need verification
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Spot Name</th>
                  <th className="px-6 py-3">Last Verified</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staleSpots?.map((s) => (
                  <tr key={s.id} className="text-sm font-medium">
                    <td className="px-6 py-4 font-bold">{s.name}</td>
                    <td className="px-6 py-4 text-gray-400">{timeAgo(s.price_updated_at)}</td>
                    <td className="px-6 py-4 text-xs">{s.verified_by || "manual"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-black uppercase">
                        STALE
                      </span>
                    </td>
                  </tr>
                ))}
                {(!staleSpots || staleSpots.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                      All spot prices are fresh (verified within last 60 days).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vibe Breakdown */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <h2 className="p-6 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
              Vibe Breakdown
            </h2>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Vibe</th>
                  <th className="px-6 py-3">Count</th>
                  <th className="px-6 py-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(vibeCounts).sort((a, b) => b[1] - a[1]).map(([v, count]) => (
                  <tr key={v} className="text-sm font-medium">
                    <td className="px-6 py-4">{v}</td>
                    <td className="px-6 py-4">{count}</td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      {((count / (totalPlans || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Area Demand */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <h2 className="p-6 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
              Area Demand
            </h2>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Area</th>
                  <th className="px-6 py-3 text-right">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).map(([area, count]) => (
                  <tr key={area} className="text-sm font-medium">
                    <td className="px-6 py-4 capitalize">{area}</td>
                    <td className="px-6 py-4 text-right font-black">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Budget Distribution */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <h2 className="p-6 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
              Budget Distribution
            </h2>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Range</th>
                  <th className="px-6 py-3 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(budgetRanges).map(([range, count]) => (
                  <tr key={range} className="text-sm font-medium">
                    <td className="px-6 py-4">{range}</td>
                    <td className="px-6 py-4 text-right font-black">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <h2 className="p-6 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
            Recent 10 Requests
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Area</th>
                <th className="px-6 py-3">Vibe</th>
                <th className="px-6 py-3">Budget</th>
                <th className="px-6 py-3">Squad</th>
                <th className="px-6 py-3 text-right">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRequests.map((r) => (
                <tr key={String(r.id)} className="text-sm font-medium">
                  <td className="px-6 py-4 text-gray-400">{timeAgo(String(r.created_at))}</td>
                  <td className="px-6 py-4 capitalize">{r.start_area}</td>
                  <td className="px-6 py-4">{r.vibe}</td>
                  <td className="px-6 py-4">₦{Number(r.budget).toLocaleString()}</td>
                  <td className="px-6 py-4">{r.squad_size}</td>
                  <td className="px-6 py-4 text-right">{r.results_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tester Observations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">Tester Observations</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase rounded-full">
              {unresolvedCount} unresolved
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Tester</th>
                  <th className="px-6 py-3">Device</th>
                  <th className="px-6 py-3">What they tried</th>
                  <th className="px-6 py-3">Frustration</th>
                  <th className="px-6 py-3">Wish List</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {observations?.map((o) => (
                  <tr key={o.id} className={`text-sm font-medium ${!o.resolved ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(o.created_at)}</td>
                    <td className="px-6 py-4 font-bold">{o.tester_name}</td>
                    <td className="px-6 py-4 text-xs">{o.device_and_network}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]" title={o.what_they_tried}>{o.what_they_tried}</td>
                    <td className="px-6 py-4 truncate max-w-[150px] text-red-500" title={o.what_frustrated_them ?? undefined}>{o.what_frustrated_them ?? "—"}</td>
                    <td className="px-6 py-4 truncate max-w-[150px] text-[#008751]" title={o.what_they_wished_existed ?? undefined}>{o.what_they_wished_existed ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spot Suggestions */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900">Spot Suggestions</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Spot Name</th>
                  <th className="px-6 py-3">Area</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {suggestions.map((s) => (
                  <tr key={s.id} className={`text-sm font-medium ${!s.reviewed ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(s.created_at)}</td>
                    <td className="px-6 py-4 font-bold">{s.spot_name}</td>
                    <td className="px-6 py-4">{s.area_name}</td>
                    <td className="px-6 py-4">₦{s.rough_price_per_person?.toLocaleString() ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{s.suggester_whatsapp ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operator Inquiries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">Operator Inquiries</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-[#008751] text-xs font-black uppercase rounded-full">
                {totalInquiries} total
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase rounded-full">
                {unconvertedInquiries} unconverted
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Business Name</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">WhatsApp</th>
                  <th className="px-6 py-3">Area</th>
                  <th className="px-6 py-3">Tier</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3">Contacted</th>
                  <th className="px-6 py-3">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inquiries.map((i) => (
                  <tr key={i.id} className={`text-sm font-medium ${!i.contacted ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(i.created_at)}</td>
                    <td className="px-6 py-4 font-bold">{i.business_name}</td>
                    <td className="px-6 py-4">{i.owner_name}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{i.whatsapp_number}</td>
                    <td className="px-6 py-4 capitalize">{i.area_slug}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        i.listing_tier === 'Premium' ? 'bg-purple-100 text-purple-700' :
                        i.listing_tier === 'Featured' ? 'bg-green-100 text-[#008751]' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {i.listing_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">₦{i.monthly_budget_ngn?.toLocaleString() ?? "—"}</td>
                    <td className="px-6 py-4">{i.contacted ? "✅" : "❌"}</td>
                    <td className="px-6 py-4">{i.converted ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
