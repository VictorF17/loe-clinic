"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { sendEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import {
  ACTIVATION_HOURS, activateUser, createActivationToken, findAuthorizedUser, findUserByActivationToken, normalizeEmail, touchLogin,
} from "@/lib/users";

// Todas as respostas são genéricas de propósito: nunca dizem se um e-mail
// está autorizado, se já tem senha ou se existe — evita enumeração de acessos.
const GENERIC_LOGIN_ERROR = "E-mail ou senha incorretos.";
const GENERIC_FIRST_ACCESS = "Se este e-mail estiver autorizado para o primeiro acesso, enviamos um link para criar a senha. Confira também a caixa de spam.";

export type LoginState = { email?: string; error?: string };
export type FirstAccessState = { email?: string; message?: string; error?: string };
export type ActivateState = { error?: string };

const emailSchema = z.string().trim().email("Informe um e-mail válido.");
const passwordSchema = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.");

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!emailSchema.safeParse(email).success || !password) return { email, error: GENERIC_LOGIN_ERROR };
  if (!checkRateLimit(`login:${email}`)) return { email, error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };

  const user = await findAuthorizedUser(email);
  if (!user?.password_hash || !verifyPassword(password, user.password_hash)) return { email, error: GENERIC_LOGIN_ERROR };

  await touchLogin(user.id);
  await createSession(user.id);
  redirect("/briefing");
}

export async function requestFirstAccess(_prev: FirstAccessState, formData: FormData): Promise<FirstAccessState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };
  if (!checkRateLimit(`first-access:${email}`, 5)) return { email, error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };

  const user = await findAuthorizedUser(email);
  if (user && user.password_hash === null) {
    const token = await createActivationToken(user.id);
    const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://loe-clinic.vercel.app";
    const link = `${origin}/briefing/ativar?token=${token}`;
    const result = await sendEmail({
      to: user.email,
      subject: "Seu acesso ao briefing do site — Loê Clinic",
      text: `Olá${user.name ? `, ${user.name}` : ""}!\n\nPara criar sua senha e acessar o briefing do site, abra o link abaixo (válido por ${ACTIVATION_HOURS} horas):\n\n${link}\n\nSe você não pediu este acesso, ignore esta mensagem.`,
      html: `<p>Olá${user.name ? `, ${user.name}` : ""}!</p><p>Para criar sua senha e acessar o briefing do site, abra o link abaixo (válido por ${ACTIVATION_HOURS} horas):</p><p><a href="${link}">${link}</a></p><p>Se você não pediu este acesso, ignore esta mensagem.</p>`,
    });
    if (!result.ok) console.error("[first-access] falha ao enviar e-mail", result.error);
  }

  return { email, message: GENERIC_FIRST_ACCESS };
}

export async function activate(_prev: ActivateState, formData: FormData): Promise<ActivateState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (password !== confirm) return { error: "As senhas não coincidem." };
  if (!checkRateLimit(`activate:${token.slice(0, 16)}`, 5)) return { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };

  const user = await findUserByActivationToken(token);
  if (!user) return { error: "Este link é inválido ou expirou. Peça um novo em “Primeiro acesso”." };

  await activateUser(user.id, hashPassword(password));
  await createSession(user.id);
  redirect("/briefing");
}
