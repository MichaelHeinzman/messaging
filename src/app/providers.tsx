"use client";

import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { RecoilRoot } from "recoil";
interface Props {
  children: React.ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <RecoilRoot>
      <AuthProvider>{children}</AuthProvider>
    </RecoilRoot>
  );
}
