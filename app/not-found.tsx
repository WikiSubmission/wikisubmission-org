"use client";

import { Button } from "@/components/ui/button";
import { About } from "@/constants/about";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  return (
    <div>
      <main className="flex flex-col min-h-screen items-center justify-center space-y-8">
        <div className="flex gap-4">
          <Image
            src="/brand-assets/logo-black.png"
            alt="WikiSubmission Logo"
            width={72}
            height={72}
            className="rounded-full"
          />
        </div>
        <p className="w-xs text-center">
          Sorry, we couldn&apos;t find what you were looking for.
        </p>
        <div className="flex gap-4 w-xs">
          <Button variant="default" onClick={() => router.back()} className="cursor-pointer">
            ← Return to previous page
          </Button>
          <a href={`mailto:${About.email}`}>
            <Button variant="outline" className="cursor-pointer">
              Contact
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
}
