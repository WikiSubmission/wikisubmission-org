'use client';

import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
    return (
        <main>
            <section className="justify-center text-center">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2"
                >
                    <Image src="/brand-assets/logo-transparent.png"
                        alt="Logo"
                        width={64}
                        height={64}
                        className="rounded-full mx-auto"
                    />
                </Link>
                <p className="text-lg text-muted-foreground">
                    Coming soon
                </p>
            </section>
        </main>
    )
}