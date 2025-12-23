import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/legal/privacy",
        permanent: true
      },
      {
        source: "/terms-of-service",
        destination: "/legal/terms",
        permanent: true
      },
      {
        source: "/proclamation",
        destination: "https://library.wikisubmission.org/file/quran-the-final-testament-proclamation",
        permanent: true,
      },
      {
        source: "/introduction",
        destination: "https://library.wikisubmission.org/file/quran-the-final-testament-introduction",
        permanent: true,
      },
      {
        source: "/index",
        destination: "https://library.wikisubmission.org/file/quran-the-final-testament-index",
        permanent: true,
      },
      {
        source: "/library/:path*",
        destination: "https://library.wikisubmission.org/:path*",
        permanent: true,
      },
      {
        source: "/appendix/0",
        destination:
          "https://library.wikisubmission.org/file/quran-the-final-testament-introduction",
        permanent: true,
      },
      ...Array.from({ length: 38 }, (_, i) => {
        const n = i + 1;
        return [
          {
            source: `/appendix/${n}`,
            destination: `https://library.wikisubmission.org/file/quran-the-final-testament-appendix-${n}`,
            permanent: true,
          },
          {
            source: `/appendix-${n}`,
            destination: `https://library.wikisubmission.org/file/quran-the-final-testament-appendix-${n}`,
            permanent: true,
          },
        ];
      }).flat(),
      // Fallback for invalid appendix numbers or /appendices
      {
        source: "/appendix/:path*",
        destination:
          "https://library.wikisubmission.org/file/quran-the-final-testament-appendices",
        permanent: true,
      },
      {
        source: "/appendix-:path(.*)",
        destination:
          "https://library.wikisubmission.org/file/quran-the-final-testament-appendices",
        permanent: true,
      },
      {
        source: "/dashboard/quran/search/:query*",
        destination: "/quran/:query*",
        permanent: true,
      },
      {
        source: "/dashboard/quran/:query*",
        destination: "/quran/:query*",
        permanent: true,
      },
      {
        source: "/dashboard/:query*",
        destination: "/quran/:query*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
