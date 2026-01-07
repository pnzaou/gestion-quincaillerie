"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Lock, 
  UserCog,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";


const Page = () => {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const settingsGroups = [
    {
      title: "Accès & Sécurité",
      items: [
        {
          icon: Shield,
          label: "Gestion des droits et permissions",
          description: "Gérer les rôles et accès des utilisateurs",
          type: "link",
          onClick: () => router.push("/reglages/permissions"),
        },
        // {
        //   icon: Lock,
        //   label: "Sécurité du compte",
        //   description: "Mot de passe et authentification",
        //   type: "link",
        //   onClick: () => {},
        // },
      ],
    },
    // {
    //   title: "Préférences",
    //   items: [
    //     {
    //       icon: darkMode ? Moon : Sun,
    //       label: "Mode sombre",
    //       description: "Activer le thème sombre",
    //       type: "toggle",
    //       value: darkMode,
    //       onChange: setDarkMode,
    //     },
    //     {
    //       icon: Globe,
    //       label: "Langue",
    //       description: "Français",
    //       type: "link",
    //       onClick: () => {},
    //     },
    //   ],
    // },
    // {
    //   title: "Notifications",
    //   items: [
    //     {
    //       icon: Bell,
    //       label: "Notifications push",
    //       description: "Recevoir des notifications en temps réel",
    //       type: "toggle",
    //       value: notifications,
    //       onChange: setNotifications,
    //     },
    //     {
    //       icon: Bell,
    //       label: "Notifications par email",
    //       description: "Recevoir des emails de notification",
    //       type: "toggle",
    //       value: emailNotifications,
    //       onChange: setEmailNotifications,
    //     },
    //   ],
    // },
  ];

  return (
    <>
      <div className="max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto space-y-6 py-5">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Réglages</h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et paramètres de l'application
          </p>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-lg font-semibold">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {itemIndex > 0 && <Separator />}
                    {item.type === "link" ? (
                      <button
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1166D4]/10">
                            <item.icon className="h-5 w-5 text-[#1166D4]" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-0.5">
                            <Label htmlFor={`toggle-${groupIndex}-${itemIndex}`} className="font-medium cursor-pointer">
                              {item.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={`toggle-${groupIndex}-${itemIndex}`}
                          checked={item.value}
                          onCheckedChange={item.onChange}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Profil utilisateur
            </CardTitle>
            <CardDescription>
              Gérez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nom d'utilisateur</p>
                <p className="text-sm text-muted-foreground">admin@example.com</p>
              </div>
              <Button variant="outline" size="sm">
                Modifier
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mot de passe</p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
              <Button variant="outline" size="sm">
                Changer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm">
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Page;
