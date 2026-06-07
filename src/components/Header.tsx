import Link from "next/link";
import { Logo } from "./Logo";

interface HeaderProps {
  showLogin?: boolean;
  landing?: boolean;
}

export function Header({ showLogin = true, landing = false }: HeaderProps) {
  return (
    <header
      className={`flex items-center justify-between py-6 max-w-6xl mx-auto w-full ${
        landing ? "px-5" : "px-4"
      }`}
    >
      <Logo />
      {showLogin && (
        <Link href="/auth/login" className="btn-outline text-sm py-2 px-4 whitespace-nowrap">
          Déjà un compte ?
        </Link>
      )}
    </header>
  );
}
