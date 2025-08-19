// This file follows the recommended Next.js App Router pattern.
// 1. The default export `BuilderPage` is a Server Component.
//    - It is responsible for server-side tasks. In this case, it just renders the client wrapper.
// 2. The `BuilderClientPage` is the Client Component (marked with 'use client').
//    - It handles all client-side logic, state, and hooks (useEffect, useRouter, etc.).

import { BuilderClientPage } from './_components/builder-client-page';

// This is the main page component, which is a Server Component
export default function BuilderPage() {
  return <BuilderClientPage />;
}
