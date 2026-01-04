'use client';

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { StarIcon } from "lucide-react";

export default function Dashboard() {

    const { user, isLoaded } = useUser();

    if (user && isLoaded) {
        return (
            <main className="space-y-4">
                <section>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                    >
                        <Image src="/brand-assets/logo-transparent.png"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="rounded-full"
                        />
                        <p className="text-lg text-muted-foreground">
                            Welcome, <strong>{user.firstName || user.emailAddresses?.[0].emailAddress?.split("@")[0] || "user"}</strong>.
                        </p>
                    </Link>
                </section>

                <section className="space-y-2">
                    <h1 className="text-xs text-muted-foreground tracking-wider flex items-center gap-2">
                        <StarIcon className="size-4" />
                        YOUR GROUPS
                    </h1>
                    <div className="flex flex-wrap gap-1">
                        {user.organizationMemberships.map((membership) => (
                            <div key={membership.id} className="text-xs text-violet-600 p-2 bg-muted/50 rounded-full">
                                <p>{membership.organization.name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        )
    }
}