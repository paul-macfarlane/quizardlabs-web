import { ModeToggle } from "@/lib/components/mode-toggle";
import { SignOut } from "@/lib/components/sign-out";

interface NavbarProps {
  userEmail: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  return (
    <nav className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Quizardlabs</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <ModeToggle />
          <SignOut />
        </div>
      </div>
    </nav>
  );
}
