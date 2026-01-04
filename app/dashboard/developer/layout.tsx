'use client';

import { AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {

    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return null;
    }

    if (!user?.organizationMemberships
        .find((membership) => membership.organization.name === "Staff")
    ) {
        return !user ? (
            <div className="text-xs p-4 bg-muted/50 rounded-2xl gap-1 flex items-center justify-center w-fit text-muted-foreground">
                <AlertCircle className="size-4 text-violet-600" />
                <p>You must be <Link href="/auth/sign-in?redirectUrl=/dashboard/developer/overview" className="text-violet-600 hover:text-violet-500 cursor-pointer">signed in</Link> to view this page.</p>
            </div>
        ) : (
            <div className="text-xs p-4 bg-muted/50 rounded-2xl gap-1 flex items-center justify-center w-fit text-muted-foreground">
                <AlertCircle className="size-4 text-violet-600" />
                <p>You are not authorized to view this page.</p>
            </div>
        )
    }

    return <div>{children}</div>;
}