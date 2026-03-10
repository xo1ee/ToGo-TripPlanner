"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ""}
        libraries={["places"]}
      >
        {children}
      </APIProvider>
    </AuthProvider>
  );
}
