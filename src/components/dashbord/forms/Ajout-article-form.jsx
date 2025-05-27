"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { toBase64 } from "@/utils/convImgToBase64";
import EIBArt from "../ExelImportButtons/EIBArt";
import AriticleFormStep1 from "./Ariticle-form-step1";
import ArticleFormStep2 from "./Article-form-step2";
import ArticleFormStep3 from "./Article-form-step3";
import AjoutArticleFormBtn from "./Ajout-article-form-btn";
import { setInitialValue } from "@/utils/setInitialValue";

const AjoutArticleForm = ({className, cats, fours, initialData = null, ...props}) => {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, control, formState: { errors }, setValue, trigger } = useForm();

    const isEdit = Boolean(initialData)

    useEffect(() => {
        if (isEdit) {
            setInitialValue(setValue, initialData)
        }
    }, [initialData, setValue, isEdit])

    const onSubmit = async (formData) => {

        if(step < 3) {
            setStep((prev) => prev + 1)
            return
        }

        setIsLoading(true)
        try {
            const url = isEdit ? `/api/product/${initialData._id}` : "/api/product";
            const method = isEdit? "PUT" : "POST";

            const data = {...formData}

            if(formData.image?.length > 0 && formData.image[0]){
                data.image = await toBase64(formData.image[0]);
            }

            const rep = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const res = await rep.json()
            if (rep.ok) {
                router.push("/dashboard/article/stock")
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'article. Veuillez réessayer.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    
    const prevStep = () => {
        if (step > 1) setStep((prev) => prev - 1);
    };
      

    return (
        (<div className={cn("flex flex-col gap-6", className)} {...props}>
            {!isEdit && <EIBArt/>}
             <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? "Modifier l'article" : "Ajouter un article"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
                        if (e.key === "Enter" && step < 3) {
                            e.preventDefault();
                        }
                    }} encType="multipart/form-data">
                        {/* Etape 1 */}
                        {step === 1 && (
                            <AriticleFormStep1 cats={cats} control={control} errors={errors} register={register}/>
                        )}

                        {/* Etape 2 */}
                        {step === 2 && (
                            <ArticleFormStep2 control={control} errors={errors} fours={fours} register={register} />
                        )}

                        {/* Etape 3 */}
                        {step === 3 && (
                            <ArticleFormStep3 register={register} />
                        )}

                        <AjoutArticleFormBtn isLoading={isLoading} isEdit={isEdit} prevStep={prevStep} step={step}/>
                    </form>
                </CardContent>
             </Card>
        </div>)
    );
}

export default AjoutArticleForm;
