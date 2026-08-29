// Validación compartida entre el formulario (cliente) y la Route Handler
// (servidor) de /api/contact. No depende de librerías externas: el cliente
// nunca debe confiar solamente en atributos HTML, y el servidor nunca debe
// confiar solamente en lo que valide el cliente.

export const PROJECT_TYPES = [
  { value: "sitio-web", label: "Sitio web" },
  { value: "tienda-online", label: "Tienda online" },
  { value: "aplicacion-web-dashboard", label: "Aplicación web / dashboard" },
  { value: "otro", label: "Otro" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];

export type ContactPayload = {
  name: string;
  contact: string;
  projectType: ProjectType;
  message: string;
  company: string;
};

export type ContactFieldErrors = Partial<
  Record<"name" | "contact" | "projectType" | "message", string>
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
    errors.name = "Ingresá tu nombre (entre 2 y 120 caracteres).";
  }

  if (contact.length > 120) {
    errors.contact = "Ese dato es demasiado largo.";
  } else if (!isValidContact(contact)) {
    errors.contact = "Ingresá un email válido o un número de WhatsApp.";
  }

  const isValidProjectType = PROJECT_TYPES.some((type) => type.value === projectType);
  if (!isValidProjectType) {
    errors.projectType = "Seleccioná un tipo de proyecto válido.";
  }

  if (message.length < 10 || message.length > 2000) {
    errors.message = "Contanos un poco más (entre 10 y 2000 caracteres).";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { name, contact, projectType: projectType as ProjectType, message, company },
  };
}
