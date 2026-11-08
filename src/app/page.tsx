import Link from "next/link";
import LimitedClosetGame from "@/components/game/LimitedClosetGame";

export default function Home() {
  return (
    <main className="min-h-screen py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start bg-[#F2EFE9]">
      {/* Desktop Helper Utility Bar */}
      <header className="w-full max-w-[430px] flex items-center justify-between pb-3 px-1 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-stone-700" />
          <span className="text-stone-800 font-semibold tracking-tight">Hot Takes</span>
          <span className="text-stone-400">/</span>
          <span>Consumer Prototype</span>
        </div>

        <Link
          href="/question-lab"
          className="text-[11px] font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors"
        >
          Question Lab →
        </Link>
      </header>

      {/* Primary Mobile Game Experience */}
      <LimitedClosetGame defaultStatedOrder="after" />
    </main>
  );
}
