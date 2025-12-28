import Image from "next/image";
import Link from "next/link";
import { About } from "@/constants/about";

export const metadata = {
  title: "Privacy Policy - WikiSubmission",
  description: "Privacy Policy for WikiSubmission",
  keywords: ["WikiSubmission", "Privacy Policy", "WikiSubmission Privacy", "WikiSubmission Privacy Policy"],
  openGraph: {
    title: "Privacy Policy - WikiSubmission",
    description: "Privacy Policy for WikiSubmission",
    url: "/legal/privacy-policy",
    images: [
      {
        url: "/brand-assets/logo-black.png",
        width: 64,
        height: 64,
        alt: "WikiSubmission Logo",
      },
    ],
  },
}

export default function PrivacyPolicy() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-8 md:p-24 p-4">
      <Link href="/">
        <Image
          src="/brand-assets/logo-transparent.png"
          alt="WikiSubmission Logo"
          width={72}
          height={72}
          className="rounded-full"
        />
      </Link>

      <section className="max-w-sm flex gap-4 max-w-md items-center">
        <h1 className="text-3xl font-semibold">
          Privacy Policy
        </h1>
      </section>

      <section className="max-w-2xl text-left space-y-6">
        <p className="text-sm text-muted-foreground">
          WikiSubmission takes your privacy seriously. To better protect your
          privacy we provide this privacy policy notice explaining the way
          your personal information is collected and used.
        </p>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Collection of Routine Information
            </h2>
            <p className="text-sm text-muted-foreground">
              This website and our services track basic information about their
              users. This information includes, but is not limited to, IP
              addresses, browser or app details, timestamps and referring pages.
              None of this information can personally identify specific user to
              this website and our services. The information is tracked for
              routine administration and maintenance purposes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cookies</h2>
            <p className="text-sm text-muted-foreground">
              Where necessary, this website and our services uses cookies to store
              information about a visitor&apos;s preferences and history in order
              to better serve the user and/or present the user with customized
              content.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Advertisement and Other Third Parties
            </h2>
            <p className="text-sm text-muted-foreground">
              Advertising partners and other third parties may use cookies,
              scripts and/or web beacons to track user activities on this website
              and our services in order to display advertisements and other useful
              information. Such tracking is done directly by the third parties
              through their own servers and is subject to their own privacy
              policies. This website and our services has no access or control
              over these cookies, scripts and/or web beacons that may be used by
              third parties. Learn how to{" "}
              <a
                href="http://www.google.com/privacy_ads.html"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                opt out of Google&apos;s cookie usage
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Links to Third Party Websites</h2>
            <p className="text-sm text-muted-foreground">
              We have included links on this website and our services for your use
              and reference. We are not responsible for the privacy policies on
              these websites. You should be aware that the privacy policies of
              these websites may differ from our own.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Security</h2>
            <p className="text-sm text-muted-foreground">
              The security of your personal information is important to us, but
              remember that no method of transmission over the Internet, or method
              of electronic storage, is 100% secure. While we strive to use
              commercially acceptable means to protect your personal information,
              we cannot guarantee its absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Changes To This Privacy Policy</h2>
            <p className="text-sm text-muted-foreground mb-2">
              This Privacy Policy is effective as of July 28, 2024 and will remain
              in effect except with respect to any changes in its provisions in
              the future, which will be in effect immediately after being posted
              on this page.
            </p>
            <p className="text-sm text-muted-foreground">
              We reserve the right to update or change our Privacy Policy at any
              time and you should check this Privacy Policy periodically. If we
              make any material changes to this Privacy Policy, we will notify you
              either through the email address you have provided us, or by placing
              a prominent notice on our website and our services.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              For any questions or concerns regarding the privacy policy, please
              send us an email at{" "}
              <a
                href={`mailto:${About.email}`}
                className="text-primary hover:underline"
              >
                {About.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-md flex flex-wrap gap-2 text-sm [&>a]:text-muted-foreground [&>a]:hover:text-violet-600 [&>a]:transition-colors">
        <Link href="/">
          Home
        </Link>
      </section>
    </main>
  );
}
