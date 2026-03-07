"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ""}>
      {children}
    </APIProvider>
  );
}
