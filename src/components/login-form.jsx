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
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { yupResolver } from "@hookform/resolvers/yup"
import { userLoginSchema } from "@/schemas/login.schema"

export function LoginForm({className, ...props}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const { handleSubmit, register, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: yupResolver(userLoginSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    const res = await signIn("credentials",{
      email: data.email,
      password: data.password,
      redirect: false
    })

    setIsLoading(false)
    if(res.ok) {
      toast.success("Connexion réussie !", {
        position: "top-center"
      })
      router.push("/")
      return;
    } 

    switch(res.error) {
      case "Compte suspendu":
        toast.error("Votre compte a été suspendu!", {
          position: "top-center"
        })
        break;
      case "Utilisateur introuvable":
        toast.error("Email ou mot de passe incorrect", {
          position: "top-center"
        })
        break;
      case "Mot de passe incorrect":
        toast.error("Email ou mot de passe incorrect", {
          position: "top-center"
        })
        break;
      default:
        toast.error("Erreur de connexion. Veuillez réessayer.", {
          position: "top-center"
        })
        break;
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors?.email && <span className="
                  mt-2 text-xs text-red-500
                ">
                  {errors?.email.message}
                </span>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/forgotten-password-request"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                   <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center hover:cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors?.password && <span className="
                  mt-2 text-sx text-red-500
                ">
                  {errors?.password.message}
                </span>}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading 
                  ? (
                    <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span> connexion en cours...
                    </>
                  ) 
                  : "Se connecter"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>)
  );
}
