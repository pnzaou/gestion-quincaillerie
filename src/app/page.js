"use client"

import LoadingScreen from "@/components/LoadingScreen";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const {data: session, status} = useSession()
  const router = useRouter()

  useEffect(() => {
    if(status === "unauthenticated") {
      router.replace("/login")
    }
  },[status, router])

  if (status === "loading") return <LoadingScreen/>

  return (
    <div>Hello APP</div>
  );
}
