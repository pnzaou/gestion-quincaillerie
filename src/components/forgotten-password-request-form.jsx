"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useState } from "react"

export function ForgottenPasswordRequestForm({className, ...props}) {
  const [isLoading, setIsLoading] = useState(false)
  const { handleSubmit, register, formState: { errors }, setValue } = useForm()
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/

  const onSubmit = async (data) => {
      try {
        setIsLoading(true) 

        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resData = await res.json()

        if(res.ok) {
            setValue("email", "")
            toast.success(resData.message || 'Veuillez vérifier votre boîte email')
        } else {
            toast.error(resData.message || 'Erreur. Veuillez réessayer.')
        }
        
    } catch (error) {
        console.error(error);
        toast.error("Erreur. Veuillez réessayer.");
    } finally {
        setIsLoading(false)
    }
  }

  return (
    (<div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe oublié ?</CardTitle>
          <CardDescription>
            Veuillez saisir votre email de connexion afin de recevoir le lien de réinitialisation de mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email", {
                    required: true,
                    pattern: emailRegex
                  })}
                />
                {errors.email && <span className="
                  mt-2 text-sm text-red-500
                ">
                  Champ requis! Veuillez saisir un email valid
                </span>}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading 
                  ? (
                    <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span> Envoi en cours...
                    </>
                  ) 
                  : "Recevoir le lien"}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 underline"
            >
              Retour à la page de connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>)
  );
}
