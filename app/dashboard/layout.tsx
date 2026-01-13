import { ThemeToggle } from '@/components/toggles/theme-toggle';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
import { DashboardSidebar } from './sidebar';
import { DashboardBreadcrumbs } from './breadcrumbs';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* Sidebar (left space) */}
            <DashboardSidebar />
            <SidebarInset>
                {/* Header */}
                <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger
                            className="-ml-1 bg-secondary/50 rounded-full p-4 hover:bg-secondary/70 cursor-pointer"
                        />
                        <Separator orientation="vertical" className="mr-2 h-4 hidden lg:block" />
                        <DashboardBreadcrumbs />
                    </div>
                    <div className="flex items-center p-4 gap-2 border-muted">
                        <SignedOut>
                            <SignInButton>
                                <Button variant="secondary">
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton>
                                <Button>
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <ThemeToggle />
                            <UserButton />
                        </SignedIn>
                    </div>
                </header>
                {/* Main content */}
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}