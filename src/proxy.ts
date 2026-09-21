import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session-cookie";

// Checagem otimista: só olha se o cookie existe. A validação real da sessão
// acontece nas páginas/actions (requireUser).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // A página de login decide sozinha (valida a sessão de verdade); redirecionar
  // daqui só pela presença do cookie causaria loop com um cookie inválido.
  const isPublic = ["/briefing/entrar", "/briefing/primeiro-acesso", "/briefing/ativar"].includes(pathname);
  if (isPublic || hasCookie) return NextResponse.next();
  return NextResponse.redirect(new URL("/briefing/entrar", request.url));
}

export const config = { matcher: ["/briefing/:path*", "/api/briefing/:path*"] };
