import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In - WikiSubmission",
    description: "Sign in to your WikiSubmission account.",
};

export default function SignInPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-8 w-full max-w-md">
                <Link href="/" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
                    <Image
                        src="/brand-assets/logo-transparent.png"
                        alt="WikiSubmission Logo"
                        width={64}
                        height={64}
                        className="rounded-full shadow-lg"
                    />
                </Link>

                <SignIn
                    path="/auth/sign-in"
                    appearance={{
                        elements: {
                            rootBox: "w-full mx-auto",
                            card: "bg-card text-card-foreground border border-border shadow-xl rounded-xl",
                            headerTitle: "text-foreground font-semibold",
                            headerSubtitle: "text-muted-foreground",
                            socialButtonsBlockButton: "bg-secondary text-secondary-foreground border-border hover:bg-muted transition-colors",
                            socialButtonsBlockButtonText: "font-medium",
                            formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 transition-opacity",
                            formFieldLabel: "text-foreground font-medium",
                            formFieldInput: "bg-background border-border text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent",
                            footerActionText: "text-muted-foreground",
                            footerActionLink: "text-primary hover:underline",
                            identityPreviewText: "text-foreground",
                            identityPreviewEditButtonIcon: "text-muted-foreground hover:text-foreground",
                        }
                    }}
                />
            </div>
        </main>
    );
}