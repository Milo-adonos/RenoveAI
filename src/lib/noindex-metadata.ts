import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: getSiteUrl(),
  },
};
