"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "~/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(...args) => router.push(...args)}
      replace={(...args) => router.replace(...args)}
      onSessionChange={async () => {
        // Clear router cache (protected routes)
        router.refresh();

        // Check if user is authenticated and redirect to dashboard
        try {
          const session = await authClient.getSession();
          if (session.data?.user && typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            // Redirect if we're on an auth page or at the base URL (fallback)
            if (currentPath.startsWith("/auth/") || currentPath === "/") {
              router.replace("/dashboard"); // Use replace to avoid history issues
            }
          }
        } catch (error) {
          // Session check failed, user likely logged out
          console.log("Session check failed:", error);
        }
      }}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
}