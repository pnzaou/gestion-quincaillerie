"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { userResetPassword } from "@/schemas";

export function ForgottenPasswordChangeForm({ className, ...props }) {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
    resolver: yupResolver(userResetPassword)
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Token manquant.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...data }),
      });
      const resData = await res.json();

      if (res.ok) {
        toast.success(resData.message || "Mot de passe réinitialisé avec succès");
        router.push("/login");
      } else {
        toast.error(resData.message || "Erreur. Veuillez réessayer.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Réinitialisation de mot de passe</CardTitle>
          <CardDescription>
            Veuillez saisir votre nouveau mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center hover:cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors?.password && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.password.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center hover:cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors?.confirmPassword && (
                  <span className="mt-2 text-sm text-red-500">
                    {errors?.confirmPassword.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>{" "}
                      Réinitialisation...
                    </>
                  ) : (
                    "Réinitialiser"
                  )}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-blue-600 underline">
              Retour à la page de connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
