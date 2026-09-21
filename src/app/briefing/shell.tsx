import Link from "next/link";

import { signOut } from "./actions";

/** Cabeçalho/rodapé enxutos da área de briefing, na identidade da Loê. */
export function BriefingShell({ children, userLabel }: { children: React.ReactNode; userLabel?: string }) {
  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#54382c]">
      <header className="border-b border-[#7b5542]/10 bg-[#f7f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-10">
          <Link href="/" aria-label="Loê Clinic — início" className="flex items-center gap-3">
            <span className="font-serif text-3xl italic tracking-tight">Loê</span>
            <span className="border-l border-[#7b5542]/40 pl-3 text-[0.6rem] font-medium tracking-[0.28em] uppercase">Clinic</span>
          </Link>
          {userLabel && (
            <form action={signOut} className="flex items-center gap-4 text-sm text-[#76594b]">
              <span className="hidden truncate sm:inline">{userLabel}</span>
              <button type="submit" className="rounded-full border border-[#7b5542]/35 bg-white/35 px-4 py-2 text-xs font-semibold tracking-wide text-[#603d2e] transition hover:border-[#7b5542] hover:bg-white/70">Sair</button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-10 sm:py-16">{children}</main>
      <footer className="mx-auto max-w-5xl px-5 pb-10 text-center text-xs text-[#a8907f] sm:px-10">Área reservada ao briefing do site. Seus dados ficam vinculados ao seu acesso.</footer>
    </div>
  );
}
