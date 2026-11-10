"use client";

import React, { useState, useMemo, useEffect } from "react";

// Format currency to IDR Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Preset goals for quick simulation
interface GoalPreset {
  id: string;
  name: string;
  icon: string;
  target: number;
  initial: number;
  monthly: number;
  rate: number;
}

const PRESET_GOALS: GoalPreset[] = [
  {
    id: "rumah",
    name: "DP Rumah Impian",
    icon: "🏠",
    target: 100000000,
    initial: 10000000,
    monthly: 3000000,
    rate: 6,
  },
  {
    id: "darurat",
    name: "Dana Darurat (6 Bln)",
    icon: "🛡️",
    target: 30000000,
    initial: 2000000,
    monthly: 1500000,
    rate: 5,
  },
  {
    id: "kendaraan",
    name: "Beli Kendaraan Baru",
    icon: "🚗",
    target: 45000000,
    initial: 5000000,
    monthly: 2000000,
    rate: 5.5,
  },
  {
    id: "liburan",
    name: "Liburan ke Luar Negeri",
    icon: "✈️",
    target: 20000000,
    initial: 1000000,
    monthly: 1200000,
    rate: 4.5,
  },
  {
    id: "gadget",
    name: "Upgrade Laptop & Gadget",
    icon: "💻",
    target: 15000000,
    initial: 1500000,
    monthly: 1000000,
    rate: 4,
  },
  {
    id: "pendidikan",
    name: "Dana Pendidikan / Kursus",
    icon: "🎓",
    target: 25000000,
    initial: 3000000,
    monthly: 1500000,
    rate: 5,
  },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulator State
  const [calcMode, setCalcMode] = useState<"time" | "deposit">("time");
  const [goalName, setGoalName] = useState<string>("DP Rumah Impian");
  const [targetAmount, setTargetAmount] = useState<number>(50000000);
  const [initialSavings, setInitialSavings] = useState<number>(5000000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(2000000);
  const [targetMonths, setTargetMonths] = useState<number>(24);
  const [interestRate, setInterestRate] = useState<number>(5.5);

  // Modal State for "Mulai Sekarang"
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Helper to format future date
  const getProjectedDateString = (months: number) => {
    if (!isMounted) {
      return `${months} bulan dari sekarang`;
    }
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(futureDate);
  };

  // Select preset helper
  const handleSelectPreset = (preset: GoalPreset) => {
    setGoalName(preset.name);
    setTargetAmount(preset.target);
    setInitialSavings(preset.initial);
    setMonthlyDeposit(preset.monthly);
    setInterestRate(preset.rate);
  };

  // Calculations
  const simulationResults = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const target = Math.max(100000, targetAmount);
    const initial = Math.max(0, initialSavings);

    if (calcMode === "time") {
      const deposit = Math.max(10000, monthlyDeposit);

      if (initial >= target) {
        return {
          monthsNeeded: 0,
          totalPrincipal: target,
          totalInterest: 0,
          finalBalance: initial,
          monthlyDepositNeeded: deposit,
        };
      }

      let months = 0;
      let balance = initial;
      let totalDeposit = initial;

      if (monthlyRate === 0) {
        months = Math.ceil((target - initial) / deposit);
        balance = initial + months * deposit;
        totalDeposit = balance;
      } else {
        const numerator = target * monthlyRate + deposit;
        const denominator = initial * monthlyRate + deposit;
        if (numerator > 0 && denominator > 0) {
          const rawMonths = Math.log(numerator / denominator) / Math.log(1 + monthlyRate);
          months = Math.max(1, Math.ceil(rawMonths));
        } else {
          months = 1;
        }

        balance =
          initial * Math.pow(1 + monthlyRate, months) +
          deposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        totalDeposit = initial + months * deposit;
      }

      const totalInterest = Math.max(0, balance - totalDeposit);

      return {
        monthsNeeded: months,
        totalPrincipal: totalDeposit,
        totalInterest,
        finalBalance: balance,
        monthlyDepositNeeded: deposit,
      };
    } else {
      const months = Math.max(1, targetMonths);

      if (initial >= target) {
        return {
          monthsNeeded: months,
          totalPrincipal: target,
          totalInterest: 0,
          finalBalance: initial,
          monthlyDepositNeeded: 0,
        };
      }

      let neededMonthly = 0;
      let balance = initial;
      let totalDeposit = initial;

      if (monthlyRate === 0) {
        neededMonthly = Math.ceil((target - initial) / months);
        totalDeposit = initial + neededMonthly * months;
        balance = totalDeposit;
      } else {
        const factor = Math.pow(1 + monthlyRate, months);
        const numerator = (target - initial * factor) * monthlyRate;
        const denominator = factor - 1;
        neededMonthly = Math.max(0, Math.ceil(numerator / denominator));

        balance =
          initial * factor +
          neededMonthly * ((factor - 1) / monthlyRate);
        totalDeposit = initial + neededMonthly * months;
      }

      const totalInterest = Math.max(0, balance - totalDeposit);

      return {
        monthsNeeded: months,
        totalPrincipal: totalDeposit,
        totalInterest,
        finalBalance: balance,
        monthlyDepositNeeded: neededMonthly,
      };
    }
  }, [calcMode, targetAmount, initialSavings, monthlyDeposit, targetMonths, interestRate]);

  const projectedDateLabel =
    simulationResults.monthsNeeded === 0
      ? "Target sudah tercapai!"
      : getProjectedDateString(simulationResults.monthsNeeded);

  // Copy simulation summary
  const handleCopySummary = () => {
    const summaryText = `Rencana Simulasi Tabungan SLIKU:
- Target: ${goalName} (${formatRupiah(targetAmount)})
- Tabungan Awal: ${formatRupiah(initialSavings)}
- Setoran Rutin: ${formatRupiah(simulationResults.monthlyDepositNeeded)}/bulan
- Waktu yang Dibutuhkan: ${simulationResults.monthsNeeded} bulan (~${(simulationResults.monthsNeeded / 12).toFixed(1)} tahun)
- Estimasi Tercapai: ${projectedDateLabel}
- Total Modal Disimpan: ${formatRupiah(simulationResults.totalPrincipal)}
- Estimasi Bonus Bunga (${interestRate}% p.a.): +${formatRupiah(simulationResults.totalInterest)}
- Total Akumulasi: ${formatRupiah(simulationResults.finalBalance)}

Disimulasikan di SLIKU - Aplikasi Simulasi Tabungan.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 flex flex-col selection:bg-yellow-400 selection:text-black">
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-yellow-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-32 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[70%] -right-32 w-[500px] h-[500px] bg-amber-400/8 rounded-full blur-[130px]" />
      </div>

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/80 border-b border-yellow-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* LOGO */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 p-0.5 shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                {/* Coin Piggy Bank Icon */}
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V18h-2v-1.07A4.002 4.002 0 0 1 8 13h2a2 2 0 0 0 2 2c1.1 0 2-.9 2-2s-.9-2-2-2a4 4 0 0 1-4-4c0-1.85 1.28-3.41 3-3.86V4h2v1.14A4.002 4.002 0 0 1 16 9h-2a2 2 0 0 0-2-2c-1.1 0-2 .9-2 2s.9 2 2 2a4 4 0 0 1 4 4c0 1.85-1.28 3.41-3 3.93z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-wider text-white">
                  SLI<span className="text-yellow-400">KU</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-yellow-400 text-black">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-1 font-medium">
                Simulasi Tabungan Pintar
              </p>
            </div>
          </a>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a
              href="#simulasi"
              className="hover:text-yellow-400 transition-colors"
            >
              Kalkulator Simulasi
            </a>
            <a href="#fitur" className="hover:text-yellow-400 transition-colors">
              Keunggulan
            </a>
            <a
              href="#cara-kerja"
              className="hover:text-yellow-400 transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#perbandingan"
              className="hover:text-yellow-400 transition-colors"
            >
              Perbandingan
            </a>
            <a href="#faq" className="hover:text-yellow-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* HEADER ACTION BUTTON "MULAI" */}
          <div className="flex items-center gap-3">
            <a
              href="#simulasi"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Coba Contoh
            </a>
            <a
              href="#simulasi"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-yellow-400 to-amber-400 text-black shadow-lg shadow-yellow-500/25 hover:shadow-yellow-400/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span>Mulai Sekarang</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 text-xs sm:text-sm font-semibold mb-8 animate-pulse shadow-sm shadow-yellow-500/20">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span>⚡ Simulator Tabungan Finansial Terakurat #1 di Indonesia</span>
            </div>

            {/* HEADLINE */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
              Rencanakan Masa Depan,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-[0_0_35px_rgba(250,204,21,0.3)]">
                Wujudkan Tabungan Impian.
              </span>
            </h1>

            {/* SUBHEADLINE */}
            <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              Ketahui persis berapa lama waktu yang dibutuhkan dan berapa setoran bulanan ideal untuk mencapai target finansialmu. Lengkap dengan perhitungan bunga majemuk secara transparan dan mudah dipahami.
            </p>

            {/* HERO CTA BUTTONS */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <a
                href="#simulasi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-extrabold bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:shadow-[0_0_45px_rgba(250,204,21,0.6)] hover:scale-105 active:scale-95 transition-all"
              >
                <span>Mulai Simulasi Gratis</span>
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>

              <a
                href="#cara-kerja"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border-2 border-yellow-500/30 text-yellow-300 bg-black/60 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all"
              >
                <span>Pelajari Cara Kerja</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </a>
            </div>

            {/* TRUST INDICATORS */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span>100% Gratis Tanpa Biaya</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span>Tanpa Registrasi / Login</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span>Formula Bunga Majemuk Teruji</span>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS STRIP */}
        <section className="border-y border-yellow-500/20 bg-zinc-950/80 backdrop-blur-md py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 tracking-tight">
                  Rp 120 M+
                </div>
                <div className="mt-1 text-xs sm:text-sm text-zinc-400 font-medium">
                  Total Dana Disimulasikan
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 tracking-tight">
                  85.000+
                </div>
                <div className="mt-1 text-xs sm:text-sm text-zinc-400 font-medium">
                  Rencana Tabungan Dibuat
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 tracking-tight">
                  99.8%
                </div>
                <div className="mt-1 text-xs sm:text-sm text-zinc-400 font-medium">
                  Akurasi Kalkulasi Finansial
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 tracking-tight">
                  4.9 / 5.0
                </div>
                <div className="mt-1 text-xs sm:text-sm text-zinc-400 font-medium">
                  Tingkat Kepuasan Pengguna
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIMULATOR SECTION (LIVE INTERACTIVE) */}
        <section id="simulasi" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* SECTION TITLE */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                Kalkulator Interaktif
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                Simulasi Tabunganmu <span className="text-yellow-400">Sekarang</span>
              </h2>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Pilih target impianmu atau atur sendiri nominalnya. Hasil proyeksi langsung diperbarui secara seketika!
              </p>
            </div>

            {/* PRESET CHIPS */}
            <div className="mb-10">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center sm:text-left">
                💡 Pilih Contoh Target Populer:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {PRESET_GOALS.map((preset) => {
                  const isSelected = goalName === preset.name;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-yellow-400 text-black border-yellow-400 font-bold shadow-lg shadow-yellow-400/25 scale-[1.02]"
                          : "bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-yellow-400/50 hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-xl mb-1">{preset.icon}</span>
                      <span className="text-xs truncate w-full">{preset.name}</span>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? "text-black/80 font-bold" : "text-yellow-400/90"
                        }`}
                      >
                        {formatRupiah(preset.target)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CALCULATOR MAIN CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* INPUT PANEL (LEFT 7 COLUMNS) */}
              <div className="lg:col-span-7 bg-zinc-950/90 border-2 border-yellow-500/25 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                {/* CALCULATION MODE TOGGLE */}
                <div className="flex bg-black p-1.5 rounded-2xl border border-zinc-800 mb-8">
                  <button
                    onClick={() => setCalcMode("time")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      calcMode === "time"
                        ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    ⏱️ Hitung Waktu Capai Target
                  </button>
                  <button
                    onClick={() => setCalcMode("deposit")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      calcMode === "deposit"
                        ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    💰 Hitung Setoran yang Diperlukan
                  </button>
                </div>

                <div className="space-y-6">
                  {/* GOAL NAME */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Nama Tujuan / Impian
                    </label>
                    <input
                      type="text"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="Contoh: DP Rumah, Dana Darurat, Pensiun"
                      className="w-full bg-black border border-zinc-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white font-medium text-sm outline-none transition-all"
                    />
                  </div>

                  {/* TARGET AMOUNT */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Target Dana Impian
                      </label>
                      <span className="text-yellow-400 font-extrabold text-base sm:text-lg">
                        {formatRupiah(targetAmount)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5000000"
                      max="500000000"
                      step="5000000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(Number(e.target.value))}
                      className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                      <span>Rp 5 Juta</span>
                      <span>Rp 250 Juta</span>
                      <span>Rp 500 Juta</span>
                    </div>
                  </div>

                  {/* INITIAL SAVINGS */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Tabungan Awal Saat Ini (Modal Awal)
                      </label>
                      <span className="text-white font-bold text-base sm:text-lg">
                        {formatRupiah(initialSavings)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000000"
                      step="1000000"
                      value={initialSavings}
                      onChange={(e) => setInitialSavings(Number(e.target.value))}
                      className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                      <span>Rp 0</span>
                      <span>Rp 50 Juta</span>
                      <span>Rp 100 Juta</span>
                    </div>
                  </div>

                  {/* DYNAMIC FIELD BASED ON MODE */}
                  {calcMode === "time" ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Kemampuan Setoran Rutin / Bulan
                        </label>
                        <span className="text-yellow-400 font-extrabold text-base sm:text-lg">
                          {formatRupiah(monthlyDeposit)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="200000"
                        max="20000000"
                        step="200000"
                        value={monthlyDeposit}
                        onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                        className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                        <span>Rp 200 Rb</span>
                        <span>Rp 10 Juta</span>
                        <span>Rp 20 Juta</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Target Waktu Tercapai (Jangka Waktu)
                        </label>
                        <span className="text-yellow-400 font-extrabold text-base sm:text-lg">
                          {targetMonths} Bulan ({(targetMonths / 12).toFixed(1)} Tahun)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="120"
                        step="1"
                        value={targetMonths}
                        onChange={(e) => setTargetMonths(Number(e.target.value))}
                        className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                        <span>3 Bulan</span>
                        <span>5 Tahun (60 Bln)</span>
                        <span>10 Tahun (120 Bln)</span>
                      </div>
                    </div>
                  )}

                  {/* INTEREST / RETURN RATE */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Estimasi Imbal Hasil / Bunga Majemuk (% per Tahun)
                        </label>
                      </div>
                      <span className="text-yellow-300 font-bold text-base sm:text-lg">
                        {interestRate}% p.a.
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                      <span>0% (Tunai Biasa)</span>
                      <span>5% (Deposito/Reksadana Pasar Uang)</span>
                      <span>15% (Investasi Berkembang)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTPUT CARD PANEL (RIGHT 5 COLUMNS) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900 to-black border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(250,204,21,0.2)] flex flex-col justify-between">
                <div>
                  {/* BADGE */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider mb-6">
                    <span>★ Proyeksi Simulasi Tabungan</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {goalName || "Target Tabungan"}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    Target Finansial:{" "}
                    <span className="text-yellow-400 font-semibold">
                      {formatRupiah(targetAmount)}
                    </span>
                  </p>

                  {/* HERO RESULT STAT */}
                  <div className="p-5 rounded-2xl bg-black border border-yellow-500/30 text-center mb-6">
                    {calcMode === "time" ? (
                      <>
                        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                          Estimasi Waktu yang Dibutuhkan
                        </div>
                        <div className="text-4xl sm:text-5xl font-black text-yellow-400 my-2 tracking-tight">
                          {simulationResults.monthsNeeded} <span className="text-xl text-white">Bulan</span>
                        </div>
                        <div className="text-xs text-zinc-300 font-medium">
                          Setara ± {(simulationResults.monthsNeeded / 12).toFixed(1)} Tahun • Tercapai sekitar{" "}
                          <span className="text-yellow-400 font-bold">
                            {projectedDateLabel}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                          Setoran Wajib Setiap Bulan
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-yellow-400 my-2 tracking-tight">
                          {formatRupiah(simulationResults.monthlyDepositNeeded)}
                        </div>
                        <div className="text-xs text-zinc-300 font-medium">
                          Untuk mencapai target dalam {targetMonths} bulan ({projectedDateLabel})
                        </div>
                      </>
                    )}
                  </div>

                  {/* BREAKDOWN DETAILS */}
                  <div className="space-y-3 text-xs sm:text-sm border-t border-zinc-800 pt-5 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                        Tabungan Awal
                      </span>
                      <span className="font-semibold text-white">
                        {formatRupiah(initialSavings)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        Total Setoran Mandiri
                      </span>
                      <span className="font-semibold text-white">
                        {formatRupiah(simulationResults.totalPrincipal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        Estimasi Keuntungan Bunga
                      </span>
                      <span className="font-bold text-emerald-400">
                        +{formatRupiah(simulationResults.totalInterest)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800 text-sm sm:text-base">
                      <span className="font-bold text-white">Total Saldo Terkumpul</span>
                      <span className="font-extrabold text-yellow-400">
                        {formatRupiah(simulationResults.finalBalance)}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL RATIO BAR */}
                  <div className="mb-6">
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                      <span>Modal Mandiri ({((simulationResults.totalPrincipal / simulationResults.finalBalance) * 100).toFixed(0)}%)</span>
                      <span className="text-yellow-400">
                        Bunga Majemuk ({((simulationResults.totalInterest / simulationResults.finalBalance) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-yellow-400 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (simulationResults.totalPrincipal / simulationResults.finalBalance) * 100
                          )}%`,
                        }}
                      />
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (simulationResults.totalInterest / simulationResults.finalBalance) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* SIMULATOR CTA BUTTON: "MULAI RENCANA INI" */}
                <div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-base bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.35)] hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Mulai Tabungan Ini Sekarang</span>
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                  <p className="text-[11px] text-zinc-400 text-center mt-3">
                    🔒 100% aman • Bebas biaya • Simulasi disimpan di browser Anda
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES / KEUNGGULAN SECTION */}
        <section id="fitur" className="py-20 md:py-28 bg-zinc-950/70 border-t border-yellow-500/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                Fitur Unggulan
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                Mengapa Memilih <span className="text-yellow-400">SLIKU?</span>
              </h2>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Dirancang khusus untuk membantu siapa pun mencapai kebebasan finansial melalui perencanaan tabungan yang terstruktur, matematis, dan realistis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* FEATURE 1 */}
              <div className="p-8 rounded-3xl bg-black border border-yellow-500/20 hover:border-yellow-400/60 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Bunga Majemuk Real-Time
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Hitung efek bola salju (*compound interest*) pada tabungan atau reksadana Anda. Lihat bagaimana uang bekerja melipatgandakan asetmu.
                </p>
              </div>

              {/* FEATURE 2 */}
              <div className="p-8 rounded-3xl bg-black border border-yellow-500/20 hover:border-yellow-400/60 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Kalkulasi Dua Arah Fleksibel
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Tentukan target waktu dan dapatkan besaran setoran bulanan, atau tentukan budget tabungan bulanan untuk mengetahui kapan impianmu tercapai.
                </p>
              </div>

              {/* FEATURE 3 */}
              <div className="p-8 rounded-3xl bg-black border border-yellow-500/20 hover:border-yellow-400/60 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.25 2.25L18 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Visualisasi Rasio Modal vs Bunga
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Pahami secara gamblang porsi dana yang Anda setorkan sendiri dibanding porsi keuntungan imbal hasil yang diperoleh secara gratis.
                </p>
              </div>

              {/* FEATURE 4 */}
              <div className="p-8 rounded-3xl bg-black border border-yellow-500/20 hover:border-yellow-400/60 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Privasi & Keamanan 100%
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Tidak meminta nomor rekening, PIN, atau data rahasia perbankan apa pun. Seluruh kalkulasi murni berjalan di sisi peramban Anda.
                </p>
              </div>

              {/* FEATURE 5 */}
              <div className="p-8 rounded-3xl bg-black border border-yellow-500/20 hover:border-yellow-400/60 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Responsif & Ringan
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Akses lancar dari smartphone, tablet, maupun laptop dengan antarmuka gelap beraksen kuning yang elegan dan hemat baterai.
                </p>
              </div>

              {/* FEATURE 6 */}
              <div className="p-8 rounded-3xl bg-black border border-yellow-500/20 hover:border-yellow-400/60 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m0 0a6 6 0 015.84-7.38v4.8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Preset Berbagai Rencana Finansial
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Tersedia contoh siap pakai mulai dari DP rumah, dana darurat, liburan, pendidikan, kendaraan, hingga modal wirausaha.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (3 LANGKAH MUDAH) */}
        <section id="cara-kerja" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                Langkah Sederhana
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                3 Langkah Mulai Menabung <span className="text-yellow-400">Cerdas</span>
              </h2>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Tidak perlu pusing dengan rumus akuntansi yang rumit. Mulai dalam hitungan menit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* STEP 1 */}
              <div className="relative p-8 rounded-3xl bg-zinc-950 border border-yellow-500/20 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-yellow-400/25 mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Tentukan Target Impian
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Ketik nama tujuan finansialmu dan tentukan total nominal target yang ingin dicapai (misalnya DP rumah Rp 100 Juta).
                </p>
              </div>

              {/* STEP 2 */}
              <div className="relative p-8 rounded-3xl bg-zinc-950 border border-yellow-500/20 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-yellow-400/25 mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Atur Setoran & Jangka Waktu
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Geser slider setoran bulanan sesuai kesiapan finansial Anda saat ini tanpa membebani biaya hidup harian.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="relative p-8 rounded-3xl bg-zinc-950 border border-yellow-500/20 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-yellow-400/25 mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Dapatkan Rencana & Mulai!
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Lihat rincian tanggal pencapaian, eksekusi rencana tabungan otomatis Anda, dan rayakan kesuksesan finansialmu.
                </p>
              </div>
            </div>

            {/* BUTTON MULAI IN STEP SECTION */}
            <div className="mt-12 text-center">
              <a
                href="#simulasi"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-extrabold text-base bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/30 hover:scale-105 transition-all"
              >
                <span>Mulai Rencanakan Sekarang</span>
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section id="perbandingan" className="py-20 md:py-28 bg-zinc-950/70 border-t border-yellow-500/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                Perbandingan Nyata
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                Menabung Biasa vs <span className="text-yellow-400">Menabung Terencana</span>
              </h2>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Lihat perbedaan signifikan antara menabung tanpa arahan dengan menabung terukur menggunakan simulasi SLIKU.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* WITHOUT PLAN */}
              <div className="p-8 rounded-3xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg">
                      ✕
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-300">
                        Menabung Tanpa Simulasi
                      </h3>
                      <p className="text-xs text-zinc-500">Kebiasaan pasif tanpa rencana</p>
                    </div>
                  </div>

                  <ul className="space-y-4 text-sm text-zinc-400">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Tidak tahu pasti kapan target dana akan terkumpul.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Sering terpakai untuk belanja konsumtif karena bercampur di rekening harian.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Kehilangan potensi keuntungan bunga majemuk (*compound interest*).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>Mudah menyerah di tengah jalan karena tidak ada progres visual terarah.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 text-center">
                  Rata-rata butuh waktu 2.5x lebih lama mencapai target
                </div>
              </div>

              {/* WITH SLIKU PLAN */}
              <div className="p-8 rounded-3xl bg-zinc-950 border-2 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg">
                      ✓
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Menabung dengan <span className="text-yellow-400">SLIKU</span>
                      </h3>
                      <p className="text-xs text-yellow-400/90 font-medium">Perencanaan cerdas & terukur</p>
                    </div>
                  </div>

                  <ul className="space-y-4 text-sm text-zinc-200">
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 font-bold">✓</span>
                      <span>Mengetahui pasti bulan dan tahun impianmu tercapai.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 font-bold">✓</span>
                      <span>Setoran teratur dan otomatis sesuai kapasitas finansial riil.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 font-bold">✓</span>
                      <span>Memaksimalkan imbal hasil dengan proyeksi bunga majemuk akurat.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 font-bold">✓</span>
                      <span>Motivasi terjaga tinggi berkat estimasi pencapaian yang transparan.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-300 font-semibold text-center">
                  ⚡ Mencapai tujuan finansial lebih cepat dan penuh ketenangan
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                Tanya Jawab
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                Pertanyaan yang Sering <span className="text-yellow-400">Diajukan</span>
              </h2>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Semua jawaban yang perlu Anda ketahui tentang aplikasi simulasi tabungan SLIKU.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Apakah aplikasi simulasi tabungan SLIKU ini 100% gratis?",
                  a: "Ya, SLIKU sepenuhnya gratis digunakan kapan saja tanpa dipungut biaya langganan, tanpa batasan simulasi, dan tanpa perlu melakukan pendaftaran akun.",
                },
                {
                  q: "Bagaimana cara kerja perhitungan bunga majemuk (compound interest) di sini?",
                  a: "SLIKU menggunakan rumus bunga majemuk standar perbankan dunia. Bunga dihitung setiap akhir bulan berdasarkan akumulasi saldo pokok dan bunga periode sebelumnya, sehingga modal tabungan Anda bertumbuh secara eksponensial.",
                },
                {
                  q: "Apakah data keuangan saya tersimpan di server?",
                  a: "Tidak. Seluruh perhitungan simulasi diproses secara lokal di peramban web (browser) Anda. Kami tidak merekam nomor rekening, data kartu, maupun data identitas pribadi Anda.",
                },
                {
                  q: "Berapa persentase imbal hasil bunga yang ideal untuk disimulasikan?",
                  a: "Untuk tabungan konvensional bank berkisar 0.5% - 2.5%, deposito perbankan 3% - 5%, reksadana pasar uang 4% - 6%, dan reksadana pendapatan tetap / obligasi 6% - 9% per tahun.",
                },
                {
                  q: "Bagaimana cara mulai menabung setelah melakukan simulasi?",
                  a: "Gunakan hasil simulasi ini sebagai acuan: pisahkan rekening tabungan khusus impian Anda, lalu atur fasilitas autodebet bulanan di bank kesayangan Anda tepat di tanggal gajian.",
                },
              ].map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-yellow-500/20 rounded-2xl bg-zinc-950 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left text-base sm:text-lg font-bold text-white hover:text-yellow-400 transition-colors"
                    >
                      <span>{item.q}</span>
                      <span className={`text-yellow-400 text-xl font-black transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm sm:text-base text-zinc-300 leading-relaxed border-t border-zinc-900 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION BANNER */}
        <section className="py-20 md:py-28 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-tr from-yellow-400 via-amber-400 to-yellow-500 text-black overflow-hidden shadow-[0_0_70px_rgba(250,204,21,0.35)]">
              {/* DECORATIVE BACKGROUND ELEMENTS */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/20 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-black text-yellow-400 text-xs font-black uppercase tracking-widest mb-4">
                  Ambil Kendali Finansialmu
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Waktunya Mengubah Angan Jadi Rencana Nyata.
                </h2>
                <p className="mt-4 text-base sm:text-lg text-black/85 font-medium leading-relaxed max-w-2xl mx-auto">
                  Jangan biarkan tahun berganti tanpa ada tabungan yang bertumbuh. Mulai simulasi tabungan pertamamu sekarang juga dalam 60 detik!
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#simulasi"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-black bg-black text-yellow-400 hover:bg-zinc-900 hover:text-yellow-300 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Mulai Sekarang</span>
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </a>
                  <button
                    onClick={() => {
                      const el = document.getElementById("simulasi");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-xl text-base font-bold text-black border-2 border-black/40 hover:bg-black/10 transition-colors"
                  >
                    Atur Target Sendiri
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-yellow-500/20 bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-900">
            {/* BRAND */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black text-lg">
                S
              </div>
              <div>
                <span className="font-black text-xl text-white">
                  SLI<span className="text-yellow-400">KU</span>
                </span>
                <p className="text-xs text-zinc-400">Aplikasi Simulasi Tabungan Pintar</p>
              </div>
            </div>

            {/* FOOTER LINKS */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
              <a href="#simulasi" className="hover:text-yellow-400 transition-colors">
                Kalkulator
              </a>
              <a href="#fitur" className="hover:text-yellow-400 transition-colors">
                Fitur
              </a>
              <a href="#cara-kerja" className="hover:text-yellow-400 transition-colors">
                Cara Kerja
              </a>
              <a href="#perbandingan" className="hover:text-yellow-400 transition-colors">
                Perbandingan
              </a>
              <a href="#faq" className="hover:text-yellow-400 transition-colors">
                FAQ
              </a>
            </div>

            {/* CTA */}
            <div>
              <a
                href="#simulasi"
                className="px-4 py-2 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-xs font-bold hover:bg-yellow-400 hover:text-black transition-all"
              >
                Mulai Simulasi
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <p>© 2026 SLIKU. Seluruh hak cipta dilindungi undang-undang.</p>
            <p>Dibuat untuk memajukan literasi finansial masyarakat Indonesia.</p>
          </div>
        </div>
      </footer>

      {/* MODAL: "LANGKAH MEMULAI TABUNGAN" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(250,204,21,0.25)] text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-xl font-bold w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mb-4 font-black text-xl">
              🎯
            </div>

            <h3 className="text-2xl font-black text-white">
              Langkah Memulai Tabunganmu!
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Rencana untuk:{" "}
              <span className="text-yellow-400 font-bold">
                {goalName} ({formatRupiah(targetAmount)})
              </span>
            </p>

            <div className="mt-6 space-y-3.5 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-black border border-yellow-500/20 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-bold text-white">Buka Rekening Terpisah</div>
                  <div className="text-zinc-400 text-xs">
                    Pisahkan rekening tabungan ini dari rekening operasional belanja harian.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-yellow-500/20 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-bold text-white">
                    Setor Rutin {formatRupiah(simulationResults.monthlyDepositNeeded)} / Bulan
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Aktifkan autodebet setiap tanggal gajian agar disiplin menabung otomatis.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-yellow-500/20 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-bold text-white">
                    Target Tercapai Pada {projectedDateLabel}
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Dalam {simulationResults.monthsNeeded} bulan, impianmu sebesar{" "}
                    {formatRupiah(simulationResults.finalBalance)} akan terwujud!
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopySummary}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-yellow-400 text-black hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"
              >
                <span>{copied ? "✓ Tersalin ke Clipboard!" : "Salin Ringkasan Simulasi"}</span>
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm border border-zinc-700 hover:bg-zinc-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
