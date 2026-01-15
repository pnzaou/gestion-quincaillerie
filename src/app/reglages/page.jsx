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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Réglages</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos préférences et paramètres de l'application
          </p>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-lg sm:text-xl font-semibold">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {itemIndex > 0 && <Separator />}
                    {item.type === "link" ? (
                      <button
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#1166D4]/10 flex-shrink-0">
                            <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#1166D4]" />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base">{item.label}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-4 sm:p-5 gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                            <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <Label htmlFor={`toggle-${groupIndex}-${itemIndex}`} className="font-medium cursor-pointer text-sm sm:text-base">
                              {item.label}
                            </Label>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={`toggle-${groupIndex}-${itemIndex}`}
                          checked={item.value}
                          onCheckedChange={item.onChange}
                          className="flex-shrink-0"
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
                <p className="font-medium text-sm sm:text-base">Nom d'utilisateur</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">admin@example.com</p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Modifier
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Mot de passe</p>
                <p className="text-xs sm:text-sm text-muted-foreground">••••••••</p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Changer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive text-lg sm:text-xl">Zone de danger</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;