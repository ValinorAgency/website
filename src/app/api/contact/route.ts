import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  PROJECT_TYPES,
  isValidEmail,
  validateContactPayload,
} from "@/lib/contact-validation";
import { getClientKey, isRateLimited } from "./rate-limit";

// Remitente temporal de pruebas provisto por Resend. Solo entrega a
// destinatarios habilitados por la cuenta hasta verificar un dominio propio.
// El remitente definitivo queda pendiente de comprar y verificar el dominio
// oficial (ver docs/ARCHITECTURE.md).
const FROM_ADDRESS = "Valinor Agency <onboarding@resend.dev>";
const RECIPIENT = "agencyvalinor@gmail.com";

function buildEmailText(data: {
  name: string;
  contact: string;
  projectTypeLabel: string;
  message: string;
}): string {
  return [
    `Nombre: ${data.name}`,
    `Contacto: ${data.contact}`,
    `Tipo de proyecto: ${data.projectTypeLabel}`,
    "",
    data.message,
  ].join("\n");
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const result = validateContactPayload({
    name: input.name,
    contact: input.contact,
    projectType: input.projectType,
    message: input.message,
    company: input.company,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: result.errors },
      { status: 400 },
    );
  }

  const { name, contact, projectType, message, company } = result.data;

  // Honeypot: si un bot completó este campo oculto, respondemos como si
  // hubiera funcionado (sin enviar nada) para no revelar la protección.
  if (company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY no configurada; no se pudo enviar la consulta.");
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  const projectTypeLabel =
    PROJECT_TYPES.find((type) => type.value === projectType)?.label ?? projectType;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: RECIPIENT,
      subject: `Nueva consulta — ${projectTypeLabel}`,
      text: buildEmailText({ name, contact, projectTypeLabel, message }),
      ...(isValidEmail(contact) ? { replyTo: contact } : {}),
    });

    if (error) {
      console.error("[contact] Resend rechazó el envío de la consulta.");
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch {
    console.error("[contact] Error inesperado al enviar la consulta.");
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
