import type { Metadata } from "next";
import "@/features/ui/theme/globals.css";
import "@fontsource-variable/exo-2";
import "@fontsource-variable/cabin";
import { SITE_NAME, SITE_DESCRIPTION } from "@/features/site-consts";
import { env } from "@/env";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: `${env.NEXT_PUBLIC_BASE_PATH}/assets/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-body tracking-wide antialiased relative h-screen w-screen overflow-x-hidden"
    >
      <body className="h-full w-full relative p-2 md:p-4">{children}</body>
    </html>
  );
}
