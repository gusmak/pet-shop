import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Các helper điều hướng nhận biết locale — tự động thêm tiền tố /vi hay /en.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);