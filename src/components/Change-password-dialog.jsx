"use client"

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePasswordSchema } from "@/schemas"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { signOut } from "next-auth/react";

export default function ChangePasswordDialog() {

 const [showPassword, setShowPassword] = useState(false);
 const { register, reset, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
    mode: "onChange",
    defaultValues: {
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    },
    resolver: yupResolver(changePasswordSchema)
 })

 const onSubmit = async (data) => {
    try {
        const res = await fetch("/api/auth/reset-password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const data1 = await res.json();

        if (res.ok) {
          reset()
          toast.success("Mot de passe modifié avec succès.");
          await signOut({ callbackUrl: "/", redirect: true });
        } else {
          toast.error(
            data1.message || "Erreur lors du changement de mot de passe",
          );
        }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur s'est produite");
    }
 }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Changer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Modifiez votre mot de passe</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="oldPassword">Ancien mot de passe</Label>

              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("oldPassword")}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.oldPassword && (
                <p className="text-red-500 text-sm">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>

              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("newPassword")}
                  className="pr-10"
                />
              </div>

              {errors.newPassword && (
                <p className="text-red-500 text-sm">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirmNewPassword">
                Confirmer le mot de passe
              </Label>

              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmNewPassword")}
                  className="pr-10"
                />
              </div>

              {errors.confirmNewPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistré"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
