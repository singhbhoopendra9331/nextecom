import { Suspense } from "react";

import LoginPageClient from "./page.client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
