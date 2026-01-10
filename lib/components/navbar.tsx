"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { ProfileDialog } from "@/lib/components/profile-dialog";
import type { Role } from "@/lib/models/user";
import {
  ClipboardCheck,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  userRole: Role;
  gradingCount?: number;
}

export function Navbar({
  userName,
  userEmail,
  userImage,
  userRole,
  gradingCount = 0,
}: NavbarProps) {
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const userInitials = userName.slice(0, 2).toUpperCase();
  const isTestMaker = userRole === "test_maker";
  const dashboardLink = isTestMaker ? "/maker" : "/taker";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <Link
            href={dashboardLink}
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-foreground truncate hover:text-primary transition-colors"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.svg"
                alt="Quizardlabs Logo"
                className="w-full h-full object-contain"
              />
            </div>
            Quizardlabs
          </Link>
          {isTestMaker && (
            <Link
              href="/maker/grading"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              Grading
              {gradingCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full bg-warning text-warning-foreground">
                  {gradingCount > 99 ? "99+" : gradingCount}
                </span>
              )}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {isTestMaker && (
            <Link
              href="/maker/grading"
              className="sm:hidden relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Grading"
            >
              <ClipboardCheck className="w-5 h-5" />
              {gradingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-medium rounded-full bg-warning text-warning-foreground">
                  {gradingCount > 99 ? "99+" : gradingCount}
                </span>
              )}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userImage || ""} alt={userEmail} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {userName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {isTestMaker ? "Teacher" : "Student"} · {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ProfileDialog
                userName={userName}
                userEmail={userEmail}
                userImage={userImage}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <div className="relative h-4 w-4">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
