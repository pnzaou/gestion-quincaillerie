"use client"

import { useSession } from "next-auth/react";

export default function Home() {
  console.log(useSession());
  return (
    <div>Hello APP</div>
  );
}
