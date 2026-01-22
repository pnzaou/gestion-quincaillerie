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

export default function ChangePasswordDialog() {

 const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
    mode: "onChange",
    defaultValues: {
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    },
    resolver: yupResolver(changePasswordSchema)
 })

 const onSubmit = (data) => console.log(data)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Changer
        </Button>
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
              <Input
                id="oldPassword"
                type="password"
                {...register("oldPassword")}
              />
              {errors.oldPassword && (
                <p className="text-red-500 text-sm">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
              />
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
              <Input
                id="confirmNewPassword"
                type="password"
                {...register("confirmNewPassword")}
              />
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
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistré"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
