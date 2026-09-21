"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPassword, verifyPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { findAuthorizedUser, normalizeEmail, setPassword, touchLogin } from "@/lib/users";

export type LoginState = {
  step: "login" | "activate";
  email?: string;
  error?: string;
};

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  confirm: z.string().optional(),
});

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"), password: formData.get("password"),
    confirm: formData.has("confirm") ? String(formData.get("confirm") ?? "") : undefined,
  });
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!parsed.success) return { step: formData.has("confirm") ? "activate" : "login", email, error: parsed.error.issues[0].message };

  if (!checkRateLimit(`login:${email}`)) return { step: "login", email, error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };

  const user = await findAuthorizedUser(email);
  if (!user) return { step: "login", email, error: "Este e-mail não está autorizado. Fale com quem está conduzindo o projeto." };

  if (user.password_hash === null) {
    // Primeiro acesso: pede confirmação antes de gravar a senha.
    if (parsed.data.confirm === undefined) return { step: "activate", email };
    if (parsed.data.confirm !== parsed.data.password) return { step: "activate", email, error: "As senhas não coincidem." };
    await setPassword(user.id, hashPassword(parsed.data.password));
  } else if (verifyPassword(parsed.data.password, user.password_hash)) {
    await touchLogin(user.id);
  } else {
    return { step: "login", email, error: "Senha incorreta." };
  }

  await createSession(user.id);
  redirect("/briefing");
}
