import { ModeToggle } from "@/lib/components/mode-toggle";
import { SignOut } from "@/lib/components/sign-out";

interface NavbarProps {
  userEmail: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  return (
    <nav className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
          Quizardlabs
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
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
