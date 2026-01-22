"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { UserCog } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useSession } from "next-auth/react";
import ChangePasswordDialog from "./Change-password-dialog";

export default function SettingsUserProfileCard() {

  const { data: session, status } = useSession()

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <UserCog className="h-5 w-5" />
          Profil utilisateur
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Gérez vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base">
              {session?.user.name}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {session?.user.email}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base">Mot de passe</p>
            <p className="text-xs sm:text-sm text-muted-foreground">••••••••</p>
          </div>
          <ChangePasswordDialog/>
        </div>
      </CardContent>
    </Card>
  );
}
