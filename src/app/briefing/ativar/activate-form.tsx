"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import { activate, type ActivateState } from "../entrar/actions";
import { inputClass, primaryButtonClass } from "../entrar/styles";

export function ActivateForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ActivateState, FormData>(activate, {});

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">Nova senha
        <input name="password" type="password" autoComplete="new-password" required minLength={8} className={inputClass} placeholder="mínimo 8 caracteres" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-[#54382c]">Confirme a senha
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
      </label>
      {state.error && <p role="alert" className="text-sm text-[#a23e2d]">{state.error}</p>}
      <button type="submit" disabled={pending} className={`mt-2 ${primaryButtonClass}`}>
        {pending ? "Salvando…" : <><LockKeyhole className="size-4" /> Criar senha e entrar</>}
      </button>
    </form>
  );
}
