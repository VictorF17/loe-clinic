"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Paperclip, Trash2, Upload } from "lucide-react";

import type { Attachment, AttachmentKind } from "@/lib/briefing";
import { confirmAttachment, createUploadTarget, deleteAttachment } from "./actions";

const kindLabel: Record<AttachmentKind, string> = { logo: "Logo", brand_guide: "Manual de identidade visual", reference: "Outras referências" };
const accept = ".pdf,image/jpeg,image/png,image/webp,image/svg+xml";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Envia o arquivo direto ao Storage (URL assinada emitida pelo servidor) e registra o anexo. */
async function upload(kind: AttachmentKind, file: File) {
  const meta = { kind, fileName: file.name, mimeType: file.type, size: file.size };
  const target = await createUploadTarget(meta);
  const response = await fetch(target.signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!response.ok) throw new Error(`Falha ao enviar ${file.name}.`);
  await confirmAttachment({ ...meta, briefingId: target.briefingId, path: target.path });
}

function UploadField({ kind, multiple, onUpload, busy }: { kind: AttachmentKind; multiple?: boolean; busy: boolean; onUpload: (kind: AttachmentKind, files: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-1.5 text-sm font-medium text-[#54382c]">
      <span>{kindLabel[kind]}{multiple && <span className="ml-2 font-normal text-[#a8907f]">pode selecionar vários</span>}</span>
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#7b5542]/35 bg-white/50 px-4 py-3 text-sm font-normal text-[#76594b] transition hover:border-[#a26b50] hover:bg-white disabled:opacity-60">
        <Upload className="size-4" /> Escolher arquivo{multiple ? "s" : ""}
      </button>
      <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (files.length) onUpload(kind, files);
      }} />
    </div>
  );
}

export function Attachments({ attachments }: { attachments: Attachment[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const busy = pending || uploading.length > 0;

  function handleUpload(kind: AttachmentKind, files: File[]) {
    setError(null);
    setUploading((current) => [...current, ...files.map((file) => file.name)]);
    startTransition(async () => {
      for (const file of files) {
        try {
          await upload(kind, file);
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : `Falha ao enviar ${file.name}.`);
        } finally {
          setUploading((current) => current.filter((name) => name !== file.name));
        }
      }
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      await deleteAttachment(id);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <UploadField kind="logo" busy={busy} onUpload={handleUpload} />
        <UploadField kind="brand_guide" busy={busy} onUpload={handleUpload} />
        <UploadField kind="reference" multiple busy={busy} onUpload={handleUpload} />
      </div>
      {(attachments.length > 0 || uploading.length > 0) && (
        <ul className="grid gap-2 rounded-2xl border border-[#7b5542]/15 bg-white/50 p-4 text-sm">
          {uploading.map((name) => <li key={`up-${name}`} className="flex items-center gap-2 text-[#a8907f]"><Loader2 className="size-4 animate-spin" /> Enviando {name}…</li>)}
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between gap-3">
              <a href={`/api/briefing/attachments/${attachment.id}`} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-[#54382c] hover:underline">
                <Paperclip className="size-4 shrink-0 text-[#a26b50]" /><span className="truncate">{attachment.file_name}</span>
                <span className="shrink-0 text-xs text-[#a8907f]">{kindLabel[attachment.kind]} · {formatSize(attachment.size_bytes)}</span>
              </a>
              <button type="button" disabled={busy} onClick={() => handleDelete(attachment.id)} aria-label={`Remover ${attachment.file_name}`} className="shrink-0 rounded-full p-1.5 text-[#a8907f] transition hover:bg-[#f0ded1] hover:text-[#a23e2d] disabled:opacity-60"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="text-sm text-[#a23e2d]">{error}</p>}
    </div>
  );
}
