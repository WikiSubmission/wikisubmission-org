import type { Metadata as _Metadata } from "next";

export const Metadata: _Metadata = {
  title: "WikiSubmission",
  description: "Access the Final Testament at WikiSubmission – a free and open source platform for Submission.",
  metadataBase: new URL("https://wikisubmission.org"),
  openGraph: {
    title: "WikiSubmission",
    description: "Access the Final Testament at WikiSubmission – a free and open source platform for Submission.",
    siteName: "WikiSubmission",
    images: [
      {
        url: "/brand-assets/logo-black.png",
        width: 64,
        height: 64,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};