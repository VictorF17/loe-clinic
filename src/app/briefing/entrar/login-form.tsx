"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { login, type LoginState } from "./actions";

const inputClass = "w-full rounded-2xl border border-[#7b5542]/25 bg-white/70 px-4 py-3 text-sm text-[#54382c] outline-none transition placeholder:text-[#a8907f] focus:border-[#a26b50] focus:bg-white";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { step: "login" });
  const activating = state.step === "activate";

  return (
    <form action={action} className="grid gap-4">
      {activating && (
        <p className="rounded-2xl border border-[#a26b50]/30 bg-[#fffaf5] px-4 py-3 text-sm leading-relaxed text-[#76594b]">
          <strong className="font-semibold text-[#54382c]">Primeiro acesso.</strong> Crie a senha que você usará para voltar ao briefing.
        </p>
      )}
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">E-mail
        <input name="email" type="email" autoComplete="email" required defaultValue={state.email ?? ""} readOnly={activating} className={`${inputClass} ${activating ? "opacity-70" : ""}`} placeholder="voce@exemplo.com" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">{activating ? "Nova senha" : "Senha"}
        <input name="password" type="password" autoComplete={activating ? "new-password" : "current-password"} required minLength={8} className={inputClass} placeholder="mínimo 8 caracteres" />
      </label>
      {activating && (
        <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">Confirme a senha
          <input name="confirm" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
        </label>
      )}
      {state.error && <p role="alert" className="text-sm text-[#a23e2d]">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#603d2e] px-6 py-3.5 text-sm font-medium text-[#fffaf5] transition hover:bg-[#7a503d] disabled:opacity-60">
        {activating ? <><LockKeyhole className="size-4" /> Criar senha e entrar</> : <>Entrar <ArrowRight className="size-4" /></>}
      </button>
      <p className="text-xs leading-relaxed text-[#a8907f]">Acesso restrito a e-mails previamente autorizados. Se ainda não tem acesso, fale com quem está conduzindo o projeto do site.</p>
    </form>
  );
}
