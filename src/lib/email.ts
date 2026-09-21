import "server-only";

// Interface fina de envio de e-mail, no mesmo desenho do Sistema Jurídico:
// o fluxo (primeiro acesso) não sabe como o e-mail sai. Provider escolhido por
// EMAIL_PROVIDER: "noop" (padrão — só registra no log, não envia) ou "resend".
// Quando o Amazon SES for liberado, basta adicionar o case aqui.
export type SendEmailInput = { to: string; subject: string; html: string; text: string };
export type SendEmailResult = { ok: true; provider: string } | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const provider = process.env.EMAIL_PROVIDER ?? "noop";

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) return { ok: false, error: "RESEND_API_KEY/EMAIL_FROM ausentes." };
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
    });
    if (!response.ok) return { ok: false, error: `Resend respondeu ${response.status}.` };
    return { ok: true, provider };
  }

  console.info("[email:noop] enviaria e-mail", { to: input.to, subject: input.subject, text: input.text });
  return { ok: true, provider: "noop" };
}
