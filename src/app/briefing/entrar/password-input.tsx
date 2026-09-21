"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { inputClass } from "./styles";

/** Campo de senha com o botão de mostrar/ocultar o que foi digitado. */
export function PasswordInput({ name, autoComplete, placeholder }: { name: string; autoComplete: string; placeholder?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={8} placeholder={placeholder} className={`${inputClass} pr-12`} />
      <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible} className="absolute inset-y-0 right-0 flex items-center px-4 text-[#a8907f] transition hover:text-[#603d2e]">
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
