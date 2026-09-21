"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Send } from "lucide-react";

import { requestFirstAccess, type FirstAccessState } from "../entrar/actions";
import { inputClass, primaryButtonClass } from "../entrar/styles";

export function FirstAccessForm() {
  const [state, action, pending] = useActionState<FirstAccessState, FormData>(requestFirstAccess, {});

  if (state.message) {
    return (
      <div className="grid gap-4">
        <p className="inline-flex items-start gap-2 text-sm leading-relaxed text-[#54382c]"><Check className="mt-0.5 size-4 shrink-0 text-[#a26b50]" /> {state.message}</p>
        <Link href="/briefing/entrar" className="inline-flex items-center gap-2 text-sm text-[#76594b] hover:underline"><ArrowLeft className="size-4" /> Voltar para o login</Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">E-mail autorizado
        <input name="email" type="email" autoComplete="email" required defaultValue={state.email ?? ""} className={inputClass} placeholder="voce@exemplo.com" />
      </label>
      {state.error && <p role="alert" className="text-sm text-[#a23e2d]">{state.error}</p>}
      <button type="submit" disabled={pending} className={`mt-2 ${primaryButtonClass}`}>
        {pending ? "Enviando…" : <><Send className="size-4" /> Receber link para criar a senha</>}
      </button>
      <p className="text-xs leading-relaxed text-[#a8907f]">Você receberá por e-mail um link para definir a senha. Se ainda não tem acesso, fale com quem está conduzindo o projeto do site.</p>
      <Link href="/briefing/entrar" className="inline-flex items-center gap-2 text-sm text-[#76594b] hover:underline"><ArrowLeft className="size-4" /> Voltar para o login</Link>
    </form>
  );
}
