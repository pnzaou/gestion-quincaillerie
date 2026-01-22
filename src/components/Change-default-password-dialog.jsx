"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import { changeDefaultPasswordSchema } from "@/schemas";

export function ChangeDefaultPasswordDialog() {
  const { data: session } = useSession();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(changeDefaultPasswordSchemaù),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const open = session?.user?.isDefaultPasswordChanged === false;

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/auth/change-default-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const response = await res.json();

      if (res.ok) {
        toast.success("Mot de passe changé ! Reconnexion...");
        await signOut({ callbackUrl: "/", redirect: true });
        router.push("/?passwordChanged=true");
      } else {
        toast.error(
          response.message || "Erreur lors du changement de mot de passe"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur s'est produite");
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Changement de mot de passe requis</DialogTitle>
          <DialogDescription>
            Pour des raisons de sécurité, veuillez changer votre mot de passe par
            défaut.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Mot de passe actuel */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>

            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                {...register("currentPassword")}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.currentPassword && (
              <p className="text-red-500 text-sm">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Nouveau mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>

            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
            />

            {errors.newPassword && (
              <p className="text-red-500 text-sm">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmer le mot de passe
            </Label>

            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting
              ? "Changement en cours..."
              : "Changer le mot de passe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
