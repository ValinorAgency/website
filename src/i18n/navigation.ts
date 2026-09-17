import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link/usePathname/useRouter "locale-aware": arman/leen rutas ya teniendo en
// cuenta el prefijo de idioma, para no tener que armarlo a mano en cada uso
// (por ejemplo en el switch de idioma del navbar).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
