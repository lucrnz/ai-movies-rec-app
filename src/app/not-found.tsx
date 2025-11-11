import { DevModeRedirect } from "@/features/landing/dev-mode-redirect";
import { env } from "@/env";
import Link from "next/link";

export default async function NotFound() {
  return (
    <div className="max-w-lg py-4">
      <h4 className="text-4xl font-semibold mb-4">Not Found</h4>
      <p className="mb-4">Could not find requested resource</p>

      <Link href="/" className="btn btn-primary">
        Return Home
      </Link>

      {env.NODE_ENV === "development" && <DevModeRedirect />}
    </div>
  );
}
