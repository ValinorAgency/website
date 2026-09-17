// Validación compartida entre el formulario (cliente) y la Route Handler
// (servidor) de /api/contact. No depende de librerías externas: el cliente
// nunca debe confiar solamente en atributos HTML, y el servidor nunca debe
// confiar solamente en lo que valide el cliente.
//
// Devuelve CÓDIGOS de error, no el texto final: este archivo corre tanto en
// el cliente (FinalCTA.tsx) como en el servidor (api/contact/route.ts), y
// ninguno de los dos debería tener que pasarle una función de traducción a
// una lib compartida. Cada caller mapea el código a texto en su propio
// idioma usando messages/{locale}.json → contactValidation.errors.

export const PROJECT_TYPE_VALUES = [
  "sitio-web",
  "tienda-online",
  "aplicacion-web-dashboard",
  "otro",
] as const;

export type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];

export type ContactPayload = {
  name: string;
  contact: string;
  projectType: ProjectType;
  message: string;
  company: string;
};

export type ContactErrorCode =
  | "name_length"
  | "contact_too_long"
  | "contact_invalid"
  | "project_type_invalid"
  | "message_length";

export type ContactFieldErrors = Partial<
  Record<"name" | "contact" | "projectType" | "message", ContactErrorCode>
>;

export type ContactValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; errors: ContactFieldErrors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_RE = /^[+()\-\s\d]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function isReasonablePhone(value: string): boolean {
  if (!PHONE_CHARS_RE.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidContact(value: string): boolean {
  return isValidEmail(value) || isReasonablePhone(value);
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContactPayload(input: {
  name: unknown;
  contact: unknown;
  projectType: unknown;
  message: unknown;
  company: unknown;
}): ContactValidationResult {
  const name = asTrimmedString(input.name);
  const contact = asTrimmedString(input.contact);
  const projectType = asTrimmedString(input.projectType);
  const message = asTrimmedString(input.message);
  const company = asTrimmedString(input.company);

  const errors: ContactFieldErrors = {};

  if (name.length < 2 || name.length > 120) {
    errors.name = "name_length";
  }

  if (contact.length > 120) {
    errors.contact = "contact_too_long";
  } else if (!isValidContact(contact)) {
    errors.contact = "contact_invalid";
  }

  const isValidProjectType = PROJECT_TYPE_VALUES.some((value) => value === projectType);
  if (!isValidProjectType) {
    errors.projectType = "project_type_invalid";
  }

  if (message.length < 10 || message.length > 2000) {
    errors.message = "message_length";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { name, contact, projectType: projectType as ProjectType, message, company },
  };
}
