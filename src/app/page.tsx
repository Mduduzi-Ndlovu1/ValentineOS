"use client";

import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/store/atoms/user";
import { Desktop } from "@/components/desktop/Desktop";
import { LoginScreen } from "@/components/system/LoginScreen";

export default function Home() {
  const currentUser = useAtomValue(currentUserAtom);

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <Desktop />;
}
