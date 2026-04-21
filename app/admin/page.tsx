import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ key?: string }> 
}) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_KEY;

  if (!key || key !== adminKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Access denied</h1>
        </div>
      </main>
    );
  }

  // 1. Basic Counts
  const { count: totalPlans } = await supabase
    .from("plan_requests")
    .select("*", { count: "exact", head: true });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: plansThisWeek } = await supabase
    .from("plan_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  // 2. Fetch all for aggregation (small scale)
  const { data: allRequests } = await supabase
    .from("plan_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (!allRequests) return <div>Error loading data</div>;

  // 3. Fetch Observations & Suggestions
  const { data: observations } = await supabase
    .from("tester_observations")
    .select("*")
    .order("created_at", { ascending: false });

  const unresolvedCount = observations?.filter(o => !o.resolved).length || 0;

  const { data: suggestions } = await supabase
    .from("spot_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: inquiries } = await supabase
    .from("operator_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const totalInquiries = inquiries?.length || 0;
  const unconvertedInquiries = inquiries?.filter(i => !i.converted).length || 0;

  // Aggregations
  const vibeCounts = allRequests.reduce((acc: any, r) => {
    acc[r.vibe] = (acc[r.vibe] || 0) + 1;
    return acc;
  }, {});
  const popularVibe = Object.entries(vibeCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

  const areaCounts = allRequests.reduce((acc: any, r) => {
    acc[r.start_area] = (acc[r.start_area] || 0) + 1;
    return acc;
  }, {});
  const popularArea = Object.entries(areaCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A";

  const budgetRanges = {
    "Under ₦20k": 0,
    "₦20k–₦50k": 0,
    "₦50k–₦100k": 0,
    "Over ₦100k": 0
  };
  allRequests.forEach(r => {
    if (r.budget < 20000) budgetRanges["Under ₦20k"]++;
    else if (r.budget < 50000) budgetRanges["₦20k–₦50k"]++;
    else if (r.budget < 100000) budgetRanges["₦50k–₦100k"]++;
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
          <span className="text-sm font-medium text-gray-400">Admin Mode</span>
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
                {Object.entries(vibeCounts).sort((a: any, b: any) => b[1] - a[1]).map(([v, count]: any) => (
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
                {Object.entries(areaCounts).sort((a: any, b: any) => b[1] - a[1]).map(([area, count]: any) => (
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
                {Object.entries(budgetRanges).map(([range, count]: any) => (
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
                <tr key={r.id} className="text-sm font-medium">
                  <td className="px-6 py-4 text-gray-400">{timeAgo(r.created_at)}</td>
                  <td className="px-6 py-4 capitalize">{r.start_area}</td>
                  <td className="px-6 py-4">{r.vibe}</td>
                  <td className="px-6 py-4">₦{r.budget.toLocaleString()}</td>
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
                    <td className="px-6 py-4 truncate max-w-[150px] text-red-500" title={o.what_frustrated_them}>{o.what_frustrated_them || "—"}</td>
                    <td className="px-6 py-4 truncate max-w-[150px] text-[#008751]" title={o.what_they_wished_existed}>{o.what_they_wished_existed || "—"}</td>
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
                {suggestions?.map((s) => (
                  <tr key={s.id} className={`text-sm font-medium ${!s.reviewed ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 text-gray-400 text-xs">{timeAgo(s.created_at)}</td>
                    <td className="px-6 py-4 font-bold">{s.spot_name}</td>
                    <td className="px-6 py-4">{s.area_name}</td>
                    <td className="px-6 py-4">₦{s.rough_price_per_person?.toLocaleString() || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{s.suggester_whatsapp || "—"}</td>
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
                {inquiries?.map((i) => (
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
                    <td className="px-6 py-4">₦{i.monthly_budget_ngn?.toLocaleString() || "—"}</td>
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
