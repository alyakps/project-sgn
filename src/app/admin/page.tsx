'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

import { getToken, clearAuth } from '@/lib/auth-storage';

/* =======================
   TYPES
======================= */
type ApiRow = {
  tahun: number;
  avg_hard: number | null;
  avg_soft: number | null;
};

type ApiResponse = {
  unit_kerja: string;
  years_available: number[];
  data: ApiRow[];
};

type MetricKey = 'avg_hard' | 'avg_soft';

// ✅ FIX: response master kamu adalah { data: string[] }
type UnitsResponse =
  | { data: string[] }
  | string[]
  | { unit_kerja: string }[]
  | { name: string }[];

/* =======================
   API HELPERS
======================= */
function getApiUrl() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_URL belum di-set. Tambahkan di .env.local lalu restart dev server.'
    );
  }
  return API_URL;
}

function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    clearAuth();
    throw new Error('Token tidak ditemukan, silakan login ulang');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

/* =======================
   API
======================= */
async function fetchCompetencySummary(
  unitKerja: string,
  years: number[]
): Promise<ApiResponse> {
  const API_URL = getApiUrl();
  const headers = getAuthHeaders();

  const params = new URLSearchParams();

  // ✅ kalau All, jangan kirim unit_kerja ke backend
  if (unitKerja !== 'All') {
    params.set('unit_kerja', unitKerja);
  }

  // ✅ years[] cuma untuk All
  if (unitKerja === 'All' && years.length > 0) {
    years.forEach((y) => params.append('years[]', String(y)));
  }

  const qs = params.toString();
  const url = qs
    ? `${API_URL}/api/admin/dashboard/competency-summary?${qs}`
    : `${API_URL}/api/admin/dashboard/competency-summary`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch';
    throw new Error(`Network/CORS error: ${msg}`);
  }

  if (res.status === 401) {
    clearAuth();
    throw new Error('Sesi login kadaluarsa, silakan login ulang');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || 'Gagal memuat dashboard data'}`);
  }

  return res.json();
}

// ✅ parse { data: [...] }
async function fetchUnitKerjaMaster(): Promise<string[]> {
  const API_URL = getApiUrl();
  const headers = getAuthHeaders();

  const res = await fetch(`${API_URL}/api/master/unit-kerja`, {
    method: 'GET',
    headers,
    mode: 'cors',
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error('Sesi login kadaluarsa, silakan login ulang');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || 'Gagal memuat master unit kerja'}`);
  }

  const json: UnitsResponse = await res.json();

  // case 1: { data: string[] }
  if (!Array.isArray(json) && 'data' in json && Array.isArray(json.data)) {
    return json.data;
  }

  // case 2: array string
  if (Array.isArray(json) && typeof json[0] === 'string') return json as string[];

  // case 3: array object {unit_kerja}
  if (Array.isArray(json) && (json[0] as any)?.unit_kerja) {
    return (json as { unit_kerja: string }[]).map((x) => x.unit_kerja);
  }

  // case 4: array object {name}
  if (Array.isArray(json) && (json[0] as any)?.name) {
    return (json as { name: string }[]).map((x) => x.name);
  }

  return [];
}

/* =======================
   CHART
======================= */
function GreenLineChart({ data }: { data: { tahun: number; value: number }[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="tahun" axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#15803d' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* =======================
   CARD
======================= */
function CompetencyCard({
  title,
  metric,
  units,
}: {
  title: string;
  metric: MetricKey;
  units: string[];
}) {
  const [unit, setUnit] = React.useState('All');
  const [years, setYears] = React.useState<number[]>([]);
  const [availableYears, setAvailableYears] = React.useState<number[]>([]);
  const [data, setData] = React.useState<ApiRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const yearFilterDisabled = unit !== 'All';

  // ✅ FIX: jangan pakai ?? 0, filter nilai null biar chart gak “dipaksa”
  const series = React.useMemo(() => {
    return [...data]
      .sort((a, b) => a.tahun - b.tahun)
      .filter((d) => d[metric] !== null && d[metric] !== undefined)
      .map((d) => ({
        tahun: Number(d.tahun),
        value: Number(d[metric] as number),
      }));
  }, [data, metric]);

  // Fetch saat unit berubah
  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetchCompetencySummary(unit, unit === 'All' ? years : []);

        if (cancelled) return;

        setData(res.data || []);
        setAvailableYears((res.years_available || []).map((y) => Number(y)));

        // ✅ set default tahun sekali untuk All
        if (unit === 'All' && years.length === 0) {
          setYears((res.years_available || []).map((y) => Number(y)));
        }

        /**
         * ✅ FIX UTAMA:
         * DULU kamu setYears juga saat unit spesifik.
         * Itu bikin state years berubah → rerender → efek lain ikut jalan/ketimpa,
         * dan akhirnya chart sering jadi kosong.
         *
         * Untuk unit spesifik:
         * - backend sudah tentukan years_available
         * - FE tidak perlu ubah years (years cuma untuk filter All)
         */
        // ❌ HAPUS:
        // if (unit !== 'All') {
        //   setYears((res.years_available || []).map((y) => Number(y)));
        // }
      } catch (e: unknown) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : 'Terjadi error');
        setData([]);
        setAvailableYears([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  // Fetch saat years berubah (hanya All)
  React.useEffect(() => {
    if (unit !== 'All') return;
    if (years.length === 0) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetchCompetencySummary(unit, years);
        if (cancelled) return;

        setData(res.data || []);
        setAvailableYears((res.years_available || []).map((y) => Number(y)));
      } catch (e: unknown) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : 'Terjadi error');
        setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [unit, years]);

  const toggleYear = (y: number) => {
    if (yearFilterDisabled) return;
    setYears((prev) => (prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y]));
  };

  const clearYears = () => setYears(availableYears);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {unit === 'All' ? 'Semua Unit Kerja' : `Unit: ${unit}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={yearFilterDisabled}
                className="rounded-xl"
              >
                <Filter className="mr-2 h-4 w-4" />
                Tahun
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {availableYears.map((y) => (
                <DropdownMenuCheckboxItem
                  key={y}
                  checked={years.includes(y)}
                  onCheckedChange={() => toggleYear(y)}
                >
                  {y}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={clearYears}
              >
                Clear
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : errorMsg ? (
          <div className="rounded-xl border p-3">
            <p className="text-sm font-medium">Gagal memuat data</p>
            <p className="text-sm text-muted-foreground break-words">{errorMsg}</p>
          </div>
        ) : series.length === 0 ? (
          <p className="text-sm text-muted-foreground">Data kosong.</p>
        ) : (
          <GreenLineChart data={series} />
        )}
      </CardContent>
    </Card>
  );
}

/* =======================
   PAGE
======================= */
export default function AdminDashboardPage() {
  const [units, setUnits] = React.useState<string[]>(['All']);
  const [unitsLoading, setUnitsLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setUnitsLoading(true);
      try {
        const masterUnits = await fetchUnitKerjaMaster();
        if (cancelled) return;

        const cleaned = masterUnits.map((x) => String(x).trim()).filter(Boolean);
        const uniq = Array.from(new Set(cleaned));
        setUnits(['All', ...uniq]);
      } catch (e) {
        if (!cancelled) setUnits(['All']);
        console.error('[master unit kerja]', e);
      } finally {
        if (!cancelled) setUnitsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard Admin</h1>
        {unitsLoading ? (
          <p className="text-sm text-muted-foreground">Memuat master unit kerja...</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompetencyCard title="Hard Competency" metric="avg_hard" units={units} />
        <CompetencyCard title="Soft Competency" metric="avg_soft" units={units} />
      </div>
    </div>
  );
}
