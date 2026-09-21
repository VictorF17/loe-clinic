"use client";

import { useActionState } from "react";
import { Check, Save } from "lucide-react";

import type { Attachment, BriefingInput } from "@/lib/briefing";
import { saveBriefing, type SaveState } from "./actions";
import { Attachments } from "./attachments";

const pageOptions = ["Home / landing page", "Sobre a marca", "Serviços ou procedimentos", "Portfólio / resultados", "Depoimentos", "Blog / conteúdo", "FAQ", "Contato"];
const featureOptions = ["Formulário de contato", "WhatsApp", "Agendamento", "Captação de leads", "Área do cliente", "E-commerce", "Assinaturas", "Orçamento online"];
const integrationOptions = ["Instagram", "Facebook", "Google Business Profile", "Google Analytics", "Meta Pixel", "Google Ads", "CRM", "E-mail marketing", "WhatsApp Business", "Agenda / calendário"];

const inputClass = "w-full rounded-2xl border border-[#7b5542]/25 bg-white/70 px-4 py-3 text-sm text-[#54382c] outline-none transition placeholder:text-[#a8907f] focus:border-[#a26b50] focus:bg-white";
const textareaClass = `${inputClass} min-h-28 resize-y`;

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium text-[#54382c] ${wide ? "sm:col-span-2" : ""}`}>
      <span>{label}{hint && <span className="ml-2 font-normal text-[#a8907f]">{hint}</span>}</span>
      {children}
    </label>
  );
}

function Section({ step, title, description, children, className }: { step: number; title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <section className="rounded-[2rem] border border-[#7b5542]/15 bg-[#fffdfa] p-6 shadow-[0_20px_50px_rgba(93,60,42,0.06)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">Etapa {step}</p>
      <h2 className="mt-2 font-serif text-2xl text-[#513427] sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#76594b]">{description}</p>
      <div className={`mt-7 ${className ?? "grid gap-5 sm:grid-cols-2"}`}>{children}</div>
    </section>
  );
}

function ChoiceGroup({ name, options, selected }: { name: string; options: string[]; selected: string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-3 rounded-2xl border border-[#7b5542]/20 bg-white/60 px-4 py-3 text-sm text-[#54382c] transition hover:border-[#a26b50]">
          <input name={name} value={option} type="checkbox" defaultChecked={selected.includes(option)} className="size-4 accent-[#603d2e]" />{option}
        </label>
      ))}
    </div>
  );
}

export function BriefingForm({ answers, status, attachments }: { answers: Partial<BriefingInput>; status: "draft" | "submitted" | "reviewed" | null; attachments: Attachment[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveBriefing, {});
  const a = answers;

  return (
    <form action={action} className="grid gap-6">
      <Section step={1} title="Marca e responsável" description="Quem é a marca e com quem devemos falar durante o projeto.">
        <Field label="Nome da marca"><input name="brandName" defaultValue={a.brandName ?? ""} className={inputClass} placeholder="Ex.: Loê Clinic" /></Field>
        <Field label="Razão social" hint="opcional"><input name="legalName" defaultValue={a.legalName ?? ""} className={inputClass} /></Field>
        <Field label="Pessoa responsável"><input name="contactName" defaultValue={a.contactName ?? ""} className={inputClass} /></Field>
        <Field label="E-mail de contato"><input name="contactEmail" type="email" defaultValue={a.contactEmail ?? ""} className={inputClass} /></Field>
        <Field label="Telefone / WhatsApp"><input name="contactPhone" defaultValue={a.contactPhone ?? ""} className={inputClass} /></Field>
        <Field label="Domínio desejado" hint="se já tiver"><input name="domain" defaultValue={a.domain ?? ""} className={inputClass} placeholder="suaclinica.com.br" /></Field>
      </Section>

      <Section step={2} title="Essência da marca" description="Estas respostas guiam a linguagem, a hierarquia de conteúdo e o tom visual." className="grid gap-5">
        <Field label="História da marca"><textarea name="story" defaultValue={a.story ?? ""} className={textareaClass} placeholder="Como a marca nasceu, sua trajetória, crenças e o que a torna única." /></Field>
        <Field label="O que você oferece?"><textarea name="offer" defaultValue={a.offer ?? ""} className={textareaClass} placeholder="Serviços, procedimentos, especialidades, diferenciais e faixas de preço se forem relevantes." /></Field>
        <Field label="Quem queremos atrair?"><textarea name="audience" defaultValue={a.audience ?? ""} className={textareaClass} placeholder="Descreva público, momento de vida, necessidades e objeções." /></Field>
        <Field label="O que a pessoa deve ver e sentir ao acessar o site?"><textarea name="desiredFeeling" defaultValue={a.desiredFeeling ?? ""} className={textareaClass} placeholder="Ex.: acolhimento, segurança, sofisticação, clareza, energia." /></Field>
        <Field label="Ação principal desejada"><input name="primaryCta" defaultValue={a.primaryCta ?? ""} className={inputClass} placeholder="Ex.: Agendar uma avaliação pelo WhatsApp" /></Field>
      </Section>

      <Section step={3} title="Direção visual e arquivos" description="Anexe o logo e materiais existentes. Aceitamos PDF, JPG, PNG, WebP e SVG, até 10 MB por arquivo. Os arquivos são enviados na hora, sem precisar salvar." className="grid gap-5">
        <Attachments attachments={attachments} />
        <Field label="Referências visuais"><textarea name="visualReferences" defaultValue={a.visualReferences ?? ""} className={textareaClass} placeholder="Links de sites, perfis, Pinterest ou descrições de estilos que inspiram a marca." /></Field>
        <Field label="O que devemos evitar?"><textarea name="avoid" defaultValue={a.avoid ?? ""} className={textareaClass} placeholder="Cores, estilos, palavras, imagens ou abordagens que não representam a marca." /></Field>
      </Section>

      <Section step={4} title="Estrutura, recursos e integrações" description="Selecione o que fará sentido na primeira versão. Podemos priorizar e detalhar depois." className="grid gap-7">
        <div><p className="mb-3 text-sm font-medium">Páginas desejadas</p><ChoiceGroup name="selectedPages" options={pageOptions} selected={a.selectedPages ?? []} /></div>
        <div><p className="mb-3 text-sm font-medium">Recursos</p><ChoiceGroup name="selectedFeatures" options={featureOptions} selected={a.selectedFeatures ?? []} /></div>
        <div><p className="mb-3 text-sm font-medium">Integrações</p><ChoiceGroup name="selectedIntegrations" options={integrationOptions} selected={a.selectedIntegrations ?? []} /></div>
      </Section>

      <Section step={5} title="Redes, descoberta e planejamento" description="Informações que ajudam a conectar a presença digital existente e medir o sucesso.">
        <Field label="Instagram"><input name="instagram" defaultValue={a.instagram ?? ""} className={inputClass} placeholder="https://instagram.com/..." /></Field>
        <Field label="Facebook"><input name="facebook" defaultValue={a.facebook ?? ""} className={inputClass} placeholder="https://facebook.com/..." /></Field>
        <Field label="LinkedIn"><input name="linkedin" defaultValue={a.linkedin ?? ""} className={inputClass} /></Field>
        <Field label="TikTok"><input name="tiktok" defaultValue={a.tiktok ?? ""} className={inputClass} /></Field>
        <Field label="Concorrentes ou referências de mercado" wide><textarea name="competitors" defaultValue={a.competitors ?? ""} className={textareaClass} placeholder="Links e breve comentário sobre o que funciona ou não funciona." /></Field>
        <Field label="Palavras-chave / como sua marca deve ser encontrada" wide><input name="seoKeywords" defaultValue={a.seoKeywords ?? ""} className={inputClass} placeholder="Ex.: clínica de estética em São Paulo, harmonização facial" /></Field>
        <Field label="Prazo ou data importante"><input name="timeline" defaultValue={a.timeline ?? ""} className={inputClass} placeholder="Ex.: lançamento em novembro" /></Field>
        <Field label="Observações finais"><input name="notes" defaultValue={a.notes ?? ""} className={inputClass} placeholder="Acessos, restrições, expectativas ou dúvidas." /></Field>
      </Section>

      <section className="rounded-[2rem] bg-[#603d2e] p-6 text-[#fffaf5] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-start gap-3 text-sm">
            <input name="ready" type="checkbox" defaultChecked={status === "submitted" || status === "reviewed"} className="mt-0.5 size-4 accent-[#e8c4aa]" />
            <span><strong className="block font-semibold">Briefing pronto para implantação</strong><span className="text-[#e8c4aa]">Marque quando as informações estiverem completas. Você ainda poderá editar depois.</span></span>
          </label>
          <button type="submit" disabled={pending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#fffaf5] px-6 py-3.5 text-sm font-semibold text-[#603d2e] transition hover:bg-[#f0ded1] disabled:opacity-60">
            <Save className="size-4" /> {pending ? "Salvando…" : "Salvar briefing"}
          </button>
        </div>
        <div aria-live="polite" className="mt-4 text-sm">
          {state.ok && !pending && <p className="inline-flex items-center gap-2 text-[#e8c4aa]"><Check className="size-4" /> Briefing salvo. Você pode continuar editando quando quiser.</p>}
          {state.error && !pending && <p role="alert" className="text-[#ffd0c4]">{state.error}</p>}
        </div>
      </section>
    </form>
  );
}
