import { NextResponse } from "next/server";

import { ATTACHMENTS_BUCKET, findOwnedAttachment } from "@/lib/briefing";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Bucket privado: só o dono do briefing recebe uma URL assinada de curta duração.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const attachment = await findOwnedAttachment(session.userId, id);
  if (!attachment) return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });

  const { data, error } = await supabaseAdmin().storage.from(ATTACHMENTS_BUCKET).createSignedUrl(attachment.storage_path, 60);
  if (error || !data) return NextResponse.json({ error: "Não foi possível gerar o link." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl, 302);
}
