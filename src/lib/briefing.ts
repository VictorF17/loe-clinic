import "server-only";
import { z } from "zod";

import { env } from "./env";
import { getProjectId, supabaseAdmin } from "./supabase-admin";

const text = (max: number) => z.string().trim().max(max).optional();

export const briefingSchema = z.object({
  brandName: text(120), legalName: text(160), contactName: text(120),
  contactEmail: z.string().trim().email().or(z.literal("")),
  contactPhone: text(40), story: text(6000), offer: text(4000), audience: text(4000),
  desiredFeeling: text(3000), visualReferences: text(3000), avoid: text(3000),
  primaryCta: text(240), domain: text(253), instagram: text(500), facebook: text(500),
  linkedin: text(500), tiktok: text(500), competitors: text(3000), seoKeywords: text(1000),
  timeline: text(240), notes: text(6000),
  selectedPages: z.array(z.string().max(80)).max(12),
  selectedFeatures: z.array(z.string().max(80)).max(12),
  selectedIntegrations: z.array(z.string().max(80)).max(12),
  ready: z.boolean(),
});

export type BriefingInput = z.infer<typeof briefingSchema>;
export type BriefingStatus = "draft" | "submitted" | "reviewed";

export const ATTACHMENT_KINDS = ["logo", "brand_guide", "reference"] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];
export const ATTACHMENTS_BUCKET = "briefing-assets";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export type Attachment = { id: string; kind: AttachmentKind; storage_path: string; file_name: string; mime_type: string; size_bytes: number; created_at: string };
export type Briefing = { id: string; status: BriefingStatus; answers: Partial<BriefingInput>; specification_markdown: string | null; updated_at: string; attachments: Attachment[] };

function line(label: string, content?: string | null) {
  return content ? `- **${label}:** ${content}` : `- **${label}:** não informado`;
}

export function createSpecification(input: BriefingInput) {
  const links = [["Instagram", input.instagram], ["Facebook", input.facebook], ["LinkedIn", input.linkedin], ["TikTok", input.tiktok]]
    .filter(([, url]) => url).map(([network, url]) => `- ${network}: ${url}`).join("\n") || "- Nenhuma rede informada";

  return `# Especificações do cliente — ${input.brandName || "Marca em definição"}

_Atualizado pelo briefing de implantação._

## Marca e contato
${line("Marca", input.brandName)}
${line("Razão social", input.legalName)}
${line("Contato", input.contactName)}
${line("E-mail", input.contactEmail)}
${line("Telefone", input.contactPhone)}
${line("Domínio", input.domain)}

## Direção estratégica
${line("História", input.story)}
${line("Oferta", input.offer)}
${line("Público", input.audience)}
${line("Sensação desejada", input.desiredFeeling)}
${line("CTA principal", input.primaryCta)}

## Design e conteúdo
${line("Referências visuais", input.visualReferences)}
${line("Evitar", input.avoid)}
${line("Concorrentes", input.competitors)}
${line("Palavras-chave", input.seoKeywords)}

## Estrutura e integrações
${line("Páginas", input.selectedPages.join(", "))}
${line("Recursos", input.selectedFeatures.join(", "))}
${line("Integrações", input.selectedIntegrations.join(", "))}

## Redes sociais
${links}

## Planejamento
${line("Prazo", input.timeline)}
${line("Observações", input.notes)}
`;
}

/** Briefing do usuário (1 por usuário: external_submission_id = id do usuário). */
export async function getBriefing(userId: string): Promise<Briefing | null> {
  const { data } = await supabaseAdmin().from("briefings")
    .select("id, status, answers, specification_markdown, updated_at, attachments:briefing_attachments(id, kind, storage_path, file_name, mime_type, size_bytes, created_at)")
    .eq("project_id", await getProjectId()).eq("external_submission_id", userId).maybeSingle();
  if (!data) return null;
  const briefing = data as unknown as Briefing;
  briefing.attachments.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return briefing;
}

/** Garante que existe uma linha de briefing para o usuário e devolve o id. */
export async function ensureBriefing(userId: string) {
  const projectId = await getProjectId();
  const existing = await supabaseAdmin().from("briefings").select("id").eq("project_id", projectId).eq("external_submission_id", userId).maybeSingle();
  if (existing.data) return existing.data.id as string;
  const { data, error } = await supabaseAdmin().from("briefings").insert({ project_id: projectId, external_submission_id: userId }).select("id").single();
  if (error) throw new Error("Não foi possível iniciar o briefing.");
  return data.id as string;
}

export async function upsertBriefing(userId: string, input: BriefingInput) {
  const projectId = await getProjectId();
  const status: BriefingStatus = input.ready ? "submitted" : "draft";
  const { data, error } = await supabaseAdmin().from("briefings").upsert({
    project_id: projectId, external_submission_id: userId, status,
    answers: input, specification_markdown: createSpecification(input),
    submitted_at: status === "submitted" ? new Date().toISOString() : null,
  }, { onConflict: "project_id,external_submission_id" }).select("id").single();
  if (error) throw new Error("Não foi possível salvar o briefing.");
  await logEvent(data.id as string, "briefing.saved", { status, source: env.projectSlug });
  return data.id as string;
}

export async function logEvent(briefingId: string, eventType: string, payload: Record<string, unknown> = {}) {
  await supabaseAdmin().from("briefing_events").insert({ project_id: await getProjectId(), briefing_id: briefingId, event_type: eventType, payload });
}

export async function findOwnedAttachment(userId: string, attachmentId: string) {
  const briefing = await getBriefing(userId);
  return briefing?.attachments.find((attachment) => attachment.id === attachmentId) ?? null;
}
