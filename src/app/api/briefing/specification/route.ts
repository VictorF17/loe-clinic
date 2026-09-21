import { NextResponse } from "next/server";

import { getBriefing } from "@/lib/briefing";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const briefing = await getBriefing(session.userId);
  if (!briefing?.specification_markdown) return NextResponse.json({ error: "Briefing ainda não salvo." }, { status: 404 });

  return new NextResponse(briefing.specification_markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": 'attachment; filename="especificacoes-loe-clinic.md"' },
  });
}
