import Image from "next/image";
import Link from "next/link";
import { About } from "@/constants/about";

export const metadata = {
  title: "Terms of Use - WikiSubmission",
  description: "Terms of Use for WikiSubmission",
  keywords: ["WikiSubmission", "Terms of Use", "WikiSubmission Terms", "WikiSubmission Terms of Use"],
  openGraph: {
    title: "Terms of Use - WikiSubmission",
    description: "Terms of Use for WikiSubmission",
    url: "/legal/terms-of-use",
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

export default function TermsOfService() {
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
          Terms of Use
        </h1>
      </section>

      <section className="max-w-2xl text-left space-y-6">
        <p className="text-sm text-muted-foreground">
          These terms of service (&quot;Terms&quot;) apply to your access and
          use of WikiSubmission (the &quot;Service&quot;). Please read them
          carefully.
        </p>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Accepting these Terms</h2>
            <p className="text-sm text-muted-foreground">
              If you access or use the Service, it means you agree to be bound by
              all of the terms below. So, before you use the Service, please read
              all of the terms. If you don&apos;t agree to all of the terms below,
              please do not use the Service. Also, if a term does not make sense
              to you, please let us know by e-mailing{" "}
              <a
                href={`mailto:${About.email}`}
                className="text-primary hover:underline"
              >
                {About.email}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Changes to these Terms</h2>
            <p className="text-sm text-muted-foreground mb-2">
              We reserve the right to modify these Terms at any time. For
              instance, we may need to change these Terms if we come out with a
              new feature or for some other reason.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Whenever we make changes to these Terms, the changes are effective
              10 years after we post such revised Terms (indicated by revising the
              date at the top of these Terms) or upon your acceptance if we
              provide a mechanism for your immediate acceptance of the revised
              Terms (such as a click-through confirmation or acceptance button).
              It is your responsibility to check our website for changes to these
              Terms.
            </p>
            <p className="text-sm text-muted-foreground">
              If you continue to use the Service after the revised Terms go into
              effect, then you have accepted the changes to these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">
              For information about how we collect and use information about users
              of the Service, please check out our privacy policy available at{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                wikisubmission.org/privacy-policy
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Third-Party Services</h2>
            <p className="text-sm text-muted-foreground">
              From time to time, we may provide you with links to third party
              websites or services that we do not own or control. Your use of the
              Service may also include the use of applications that are developed
              or owned by a third party. Your use of such third party
              applications, websites, and services is governed by that
              party&apos;s own terms of service or privacy policies. We encourage
              you to read the terms and conditions and privacy policy of any third
              party application, website or service that you visit or use.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Creating Accounts</h2>
            <p className="text-sm text-muted-foreground mb-2">
              When you create an account or use another service to log in to the
              Service, you agree to maintain the security of your password and
              accept all risks of unauthorized access to any data or other
              information you provide to the Service.
            </p>
            <p className="text-sm text-muted-foreground">
              If you discover or suspect any Service security breaches, please let
              us know as soon as possible.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Your Content & Conduct</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Our Service allows you and other users to post, link and otherwise
              make available content. You are responsible for the content that you
              make available to the Service, including its legality, reliability,
              and appropriateness.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              When you post, link or otherwise make available content to the
              Service, you grant us the right and license to use, reproduce,
              modify, publicly perform, publicly display and distribute your
              content on or through the Service. We may format your content for
              display throughout the Service, but we will not edit or revise the
              substance of your content itself.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Aside from our limited right to your content, you retain all of your
              rights to the content you post, link and otherwise make available on
              or through the Service.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              You can remove the content that you posted by deleting it. Once you
              delete your content, it will not appear on the Service, but copies
              of your deleted content may remain in our system or backups for some
              period of time. We will retain web server access logs for a maximum
              of 1 year and then delete them.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              You may not post, link and otherwise make available on or through
              the Service any of the following:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground mb-2">
              <li>
                Content that is libelous, defamatory, bigoted, fraudulent or
                deceptive;
              </li>
              <li>
                Content that is illegal or unlawful, that would otherwise create
                liability;
              </li>
              <li>
                Content that may infringe or violate any patent, trademark, trade
                secret, copyright, right of privacy, right of publicity or other
                intellectual or other right of any party;
              </li>
              <li>
                Mass or repeated promotions, political campaigning or commercial
                messages directed at users who do not follow you (SPAM);
              </li>
              <li>
                Private information of any third party (e.g., addresses, phone
                numbers, email addresses, Social Security numbers and credit card
                numbers); and
              </li>
              <li>
                Viruses, corrupted data or other harmful, disruptive or
                destructive files or code.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mb-2">
              Also, you agree that you will not do any of the following in
              connection with the Service or other users:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
              <li>
                Use the Service in any manner that could interfere with, disrupt,
                negatively affect or inhibit other users from fully enjoying the
                Service or that could damage, disable, overburden or impair the
                functioning of the Service;
              </li>
              <li>
                Impersonate or post on behalf of any person or entity or otherwise
                misrepresent your affiliation with a person or entity;
              </li>
              <li>
                Collect any personal information about other users, or intimidate,
                threaten, stalk or otherwise harass other users of the Service;
              </li>
              <li>
                Create an account or post any content if you are not over 13 years
                of age years of age; and
              </li>
              <li>
                Circumvent or attempt to circumvent any filtering, security
                measures, rate limits or other features designed to protect the
                Service, users of the Service, or third parties.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Materials</h2>
            <p className="text-sm text-muted-foreground mb-2">
              We put a lot of effort into creating the Service including, the logo
              and all designs, text, graphics, pictures, information and other
              content (excluding your content). This property is owned by us or
              our licensors and it is protected by U.S. and international
              copyright laws. We grant you the right to use it.
            </p>
            <p className="text-sm text-muted-foreground">
              However, unless we expressly state otherwise, your rights do not
              include: (i) publicly performing or publicly displaying the Service;
              (ii) modifying or otherwise making any derivative uses of the
              Service or any portion thereof; (iii) using any data mining, robots
              or similar data gathering or extraction methods; (iv) downloading
              (other than page caching) of any portion of the Service or any
              information contained therein; (v) reverse engineering or accessing
              the Service in order to build a competitive product or service; or
              (vi) using the Service other than for its intended purposes. If you
              do any of this stuff, we may terminate your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Hyperlinks and Third Party Content
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              You may create a hyperlink to the Service. But, you may not use,
              frame or utilize framing techniques to enclose any of our
              trademarks, logos or other proprietary information without our
              express written consent.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              WikiSubmission makes no claim or representation regarding, and
              accepts no responsibility for third party websites accessible by
              hyperlink from the Service or websites linking to the Service. When
              you leave the Service, you should be aware that these Terms and our
              policies no longer govern.
            </p>
            <p className="text-sm text-muted-foreground">
              If there is any content on the Service from you and others, we
              don&apos;t review, verify or authenticate it, and it may include
              inaccuracies or false information. We make no representations,
              warranties, or guarantees relating to the quality, suitability,
              truth, accuracy or completeness of any content contained in the
              Service. You acknowledge sole responsibility for and assume all risk
              arising from your use of or reliance on any content.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Unavoidable Legal Stuff</h2>
            <p className="uppercase text-sm text-muted-foreground mb-2">
              THE SERVICE AND ANY OTHER SERVICE AND CONTENT INCLUDED ON OR
              OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE ARE PROVIDED TO
              YOU ON AN AS IS OR AS AVAILABLE BASIS WITHOUT ANY REPRESENTATIONS OR
              WARRANTIES OF ANY KIND. WE DISCLAIM ANY AND ALL WARRANTIES AND
              REPRESENTATIONS (EXPRESS OR IMPLIED, ORAL OR WRITTEN) WITH RESPECT
              TO THE SERVICE AND CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE
              TO YOU THROUGH THE SERVICE WHETHER ALLEGED TO ARISE BY OPERATION OF
              LAW, BY REASON OF CUSTOM OR USAGE IN THE TRADE, BY COURSE OF DEALING
              OR OTHERWISE.
            </p>
            <p className="uppercase text-sm text-muted-foreground mb-2">
              IN NO EVENT WILL <strong>WikiSubmission</strong> BE LIABLE TO YOU OR
              ANY THIRD PARTY FOR ANY SPECIAL, INDIRECT, INCIDENTAL, EXEMPLARY OR
              CONSEQUENTIAL DAMAGES OF ANY KIND ARISING OUT OF OR IN CONNECTION
              WITH THE SERVICE OR ANY OTHER SERVICE AND/OR CONTENT INCLUDED ON OR
              OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE, REGARDLESS OF
              THE FORM OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY OR
              OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH
              DAMAGES OR ARE AWARE OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL
              LIABILITY FOR ALL CAUSES OF ACTION AND UNDER ALL THEORIES OF
              LIABILITY WILL BE LIMITED TO THE AMOUNT YOU PAID TO{" "}
              <strong>WikiSubmission</strong>. THIS SECTION WILL BE GIVEN FULL
              EFFECT EVEN IF ANY REMEDY SPECIFIED IN THIS AGREEMENT IS DEEMED TO
              HAVE FAILED OF ITS ESSENTIAL PURPOSE.
            </p>
            <p className="text-sm text-muted-foreground">
              You agree to defend, indemnify and hold us harmless from and against
              any and all costs, damages, liabilities, and expenses (including
              attorneys&apos; fees, costs, penalties, interest and disbursements)
              we incur in relation to, arising from, or for the purpose of
              avoiding, any claim or demand from a third party relating to your
              use of the Service or the use of the Service by any person using
              your account, including any claim that your use of the Service
              violates any applicable law or regulation, or the rights of any
              third party, and/or your violation of these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Copyright Complaints</h2>
            <p className="text-sm text-muted-foreground">
              We take intellectual property rights seriously. In accordance with
              the Digital Millennium Copyright Act (&quot;DMCA&quot;) and other
              applicable law, we have adopted a policy of terminating, in
              appropriate circumstances and, at our sole discretion, access to the
              service for users who are deemed to be repeat infringers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Governing Law</h2>
            <p className="text-sm text-muted-foreground">
              The validity of these Terms and the rights, obligations, and
              relations of the parties under these Terms will be construed and
              determined under and in accordance with the laws of the{" "}
              <strong>Utah</strong>, without regard to conflicts of law
              principles.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Jurisdiction</h2>
            <p className="text-sm text-muted-foreground">
              You expressly agree that exclusive jurisdiction for any dispute with
              the Service or relating to your use of it, resides in the courts of
              the <strong>Utah</strong> and you further agree and expressly
              consent to the exercise of personal jurisdiction in the courts of
              the <strong>Utah</strong> located in <strong>Salt Lake City</strong>{" "}
              in connection with any such dispute including any claim involving
              Service. You further agree that you and Service will not commence
              against the other a class action, class arbitration or other
              representative action or proceeding.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Termination</h2>
            <p className="text-sm text-muted-foreground">
              If you breach any of these Terms, we have the right to suspend or
              disable your access to or use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Entire Agreement</h2>
            <p className="text-sm text-muted-foreground">
              These Terms constitute the entire agreement between you and{" "}
              <strong>WikiSubmission</strong> regarding the use of the Service,
              superseding any prior agreements between you and{" "}
              <strong>WikiSubmission</strong> relating to your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Feedback</h2>
            <p className="text-sm text-muted-foreground">
              Please let us know what you think of the Service, these Terms and,
              in general, <strong>WikiSubmission</strong>. When you provide us
              with any feedback, comments or suggestions about the Service, these
              Terms and, in general, <strong>WikiSubmission</strong>, you
              irrevocably assign to us all of your right, title and interest in
              and to your feedback, comments and suggestions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Questions & Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              Questions or comments about the Service may be directed to us at the
              email address{" "}
              <a
                href={`mailto:${About.email}`}
                className="text-primary hover:underline"
              >
                <strong>{About.email}</strong>
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
