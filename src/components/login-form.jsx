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
import { signIn } from "next-auth/react";
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function LoginForm({className, ...props}) {

  const { handleSubmit, register, formState: { errors } } = useForm()
  const router = useRouter()
  const mdpRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/

  const onSubmit = async (data) => {
    try {
      const res = await signIn("credentials",{
        email: data.email,
        password: data.password,
        redirect: false
      })

      if(res.ok) {
        router.push("/")
        toast.success("Connexion réussie !", {
          position: "top-center"
        })
      } else {
        toast.error("Email ou mot de passe incorrect.", {
          position: "top-center"
        })
      }
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.", {
        position: "top-center"
      });
    console.error(error);
    }
  }

  return (
    (<div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Connectez-vous à votre compte</CardTitle>
          <CardDescription>
            Entrez votre email ci-dessous pour vous connecter à votre compte
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
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input 
                 id="password" 
                 type="password" 
                 required
                 {...register("password", {
                  required: true,
                  pattern: mdpRegex,
                  min: 8
                 })}
                />
                {errors.password && <span className="
                  mt-2 text-sm text-red-500
                ">
                  Champ requis! Minimum: 1 maj, 1 min, 1 chiffre, 1 spé, 8 car
                </span>}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Se connecter
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>)
  );
}
