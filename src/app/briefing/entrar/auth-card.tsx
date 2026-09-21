import { BriefingShell } from "../shell";

/** Moldura das telas de acesso: eyebrow, título, texto e o cartão com o formulário. */
export function AuthCard({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <BriefingShell>
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#513427] sm:text-5xl">{title}</h1>
        <p className="mt-4 text-[#76594b]">{description}</p>
        <div className="mt-8 rounded-[2rem] border border-[#7b5542]/15 bg-[#fffdfa] p-6 shadow-[0_20px_50px_rgba(93,60,42,0.08)] sm:p-8">{children}</div>
      </div>
    </BriefingShell>
  );
}
