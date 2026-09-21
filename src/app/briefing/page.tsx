import type { Metadata } from "next";
import { Download } from "lucide-react";

import { getBriefing } from "@/lib/briefing";
import { requireUser } from "@/lib/users";
import { BriefingForm } from "./briefing-form";
import { BriefingShell } from "./shell";

export const metadata: Metadata = { title: "Briefing | Loê Clinic", robots: { index: false, follow: false } };

const statusLabel = { draft: "Rascunho", submitted: "Pronto para implantação", reviewed: "Em revisão" } as const;

export default async function BriefingPage() {
  const user = await requireUser();
  const briefing = await getBriefing(user.id);

  return (
    <BriefingShell userLabel={user.name ?? user.email}>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">Briefing do site</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-[#513427] sm:text-5xl">Vamos transformar sua marca em um site que parece seu.</h1>
          <p className="mt-4 text-[#76594b]">Preencha no seu ritmo. Cada salvamento atualiza a especificação que orientará conteúdo, design e integrações.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {briefing && <span className="rounded-full border border-[#7b5542]/25 bg-white/60 px-3 py-1.5 text-xs font-medium">{statusLabel[briefing.status]}</span>}
          {briefing?.specification_markdown && (
            <a href="/api/briefing/specification" className="inline-flex items-center gap-2 rounded-full border border-[#7b5542]/35 bg-white/35 px-4 py-2 text-xs font-semibold tracking-wide text-[#603d2e] transition hover:border-[#7b5542] hover:bg-white/70"><Download className="size-4" /> Especificações</a>
          )}
        </div>
      </div>

      <div className="mt-10">
        <BriefingForm answers={briefing?.answers ?? {}} status={briefing?.status ?? null} attachments={briefing?.attachments ?? []} />
      </div>
    </BriefingShell>
  );
}
