import { ModeToggle } from "@/lib/components/mode-toggle";
import { SignOut } from "@/lib/components/sign-out";
import { ClipboardCheck } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  userEmail: string;
  showGrading?: boolean;
}

export function Navbar({ userEmail, showGrading = true }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <Link
            href="/maker"
            className="text-xl sm:text-2xl font-bold text-foreground truncate hover:text-primary transition-colors"
          >
            Quizardlabs
          </Link>
          {showGrading && (
            <Link
              href="/maker/grading"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              Grading
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {showGrading && (
            <Link
              href="/maker/grading"
              className="sm:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Grading"
            >
              <ClipboardCheck className="w-5 h-5" />
            </Link>
          )}
          <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[200px]">
            {userEmail}
          </span>
          <ModeToggle />
          <SignOut />
        </div>
      </div>
    </nav>
  );
}
