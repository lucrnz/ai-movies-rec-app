import type { Metadata } from "next";
import "@/features/ui/theme/globals.css";
import "@fontsource-variable/exo-2";
import "@fontsource-variable/cabin";
import { SITE_NAME, SITE_DESCRIPTION } from "@/features/site-consts";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-body tracking-wide antialiased relative h-screen w-screen"
    >
      <body className="h-full w-full">{children}</body>
    </html>
  );
}
