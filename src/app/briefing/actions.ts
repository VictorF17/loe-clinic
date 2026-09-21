"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ALLOWED_MIME_TYPES, ATTACHMENTS_BUCKET, ATTACHMENT_KINDS, MAX_FILE_SIZE, briefingSchema, ensureBriefing,
  findOwnedAttachment, logEvent, upsertBriefing, type AttachmentKind, type BriefingInput,
} from "@/lib/briefing";
import { env } from "@/lib/env";
import { deleteSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/users";

export type SaveState = { ok?: boolean; error?: string; savedAt?: string };

function value(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }
function values(formData: FormData, name: string) { return formData.getAll(name).map(String).filter(Boolean); }

function toInput(formData: FormData): BriefingInput {
  return briefingSchema.parse({
    brandName: value(formData, "brandName"), legalName: value(formData, "legalName"),
    contactName: value(formData, "contactName"), contactEmail: value(formData, "contactEmail"),
    contactPhone: value(formData, "contactPhone"), story: value(formData, "story"),
    offer: value(formData, "offer"), audience: value(formData, "audience"),
    desiredFeeling: value(formData, "desiredFeeling"), visualReferences: value(formData, "visualReferences"),
    avoid: value(formData, "avoid"), primaryCta: value(formData, "primaryCta"),
    domain: value(formData, "domain"), instagram: value(formData, "instagram"),
    facebook: value(formData, "facebook"), linkedin: value(formData, "linkedin"), tiktok: value(formData, "tiktok"),
    competitors: value(formData, "competitors"), seoKeywords: value(formData, "seoKeywords"),
    timeline: value(formData, "timeline"), notes: value(formData, "notes"),
    selectedPages: values(formData, "selectedPages"), selectedFeatures: values(formData, "selectedFeatures"),
    selectedIntegrations: values(formData, "selectedIntegrations"), ready: formData.get("ready") === "on",
  });
}

export async function saveBriefing(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  let input: BriefingInput;
  try {
    input = toInput(formData);
  } catch {
    return { error: "Revise os campos: algum valor é inválido ou longo demais." };
  }
  try {
    await upsertBriefing(user.id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar o briefing." };
  }
  revalidatePath("/briefing");
  return { ok: true, savedAt: new Date().toISOString() };
}

// --- Anexos: upload direto do navegador para o Storage via URL assinada ---

type UploadRequest = { kind: AttachmentKind; fileName: string; mimeType: string; size: number };

function safeFileName(name: string) {
  return name.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "arquivo";
}

export async function createUploadTarget(request: UploadRequest) {
  const user = await requireUser();
  if (!ATTACHMENT_KINDS.includes(request.kind)) throw new Error("Tipo de anexo inválido.");
  if (!ALLOWED_MIME_TYPES.includes(request.mimeType)) throw new Error(`${request.fileName} precisa ser PDF, JPG, PNG, WebP ou SVG.`);
  if (!(request.size > 0 && request.size <= MAX_FILE_SIZE)) throw new Error(`${request.fileName} ultrapassa o limite de 10 MB.`);

  const briefingId = await ensureBriefing(user.id);
  const path = `${env.projectSlug}/${briefingId}/${randomUUID()}-${safeFileName(request.fileName)}`;
  const { data, error } = await supabaseAdmin().storage.from(ATTACHMENTS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error("Não foi possível preparar o envio do arquivo.");
  return { briefingId, path, signedUrl: data.signedUrl };
}

export async function confirmAttachment(request: UploadRequest & { briefingId: string; path: string }) {
  const user = await requireUser();
  const briefingId = await ensureBriefing(user.id);
  if (briefingId !== request.briefingId || !request.path.startsWith(`${env.projectSlug}/${briefingId}/`)) throw new Error("Anexo não pertence a este briefing.");

  const folder = request.path.slice(0, request.path.lastIndexOf("/"));
  const objectName = request.path.slice(folder.length + 1);
  const { data: objects } = await supabaseAdmin().storage.from(ATTACHMENTS_BUCKET).list(folder, { search: objectName });
  if (!objects?.some((object) => object.name === objectName)) throw new Error("O arquivo não chegou ao armazenamento.");

  const { error } = await supabaseAdmin().from("briefing_attachments").insert({
    briefing_id: briefingId, kind: request.kind, storage_path: request.path,
    file_name: request.fileName.slice(0, 255), mime_type: request.mimeType, size_bytes: request.size,
  });
  if (error) throw new Error("Não foi possível registrar o anexo.");
  await logEvent(briefingId, "attachment.added", { kind: request.kind, fileName: request.fileName });
  revalidatePath("/briefing");
}

export async function deleteAttachment(attachmentId: string) {
  const user = await requireUser();
  const attachment = await findOwnedAttachment(user.id, attachmentId);
  if (!attachment) return;
  await supabaseAdmin().storage.from(ATTACHMENTS_BUCKET).remove([attachment.storage_path]);
  await supabaseAdmin().from("briefing_attachments").delete().eq("id", attachment.id);
  revalidatePath("/briefing");
}

export async function signOut() {
  await deleteSession();
  redirect("/briefing/entrar");
}
