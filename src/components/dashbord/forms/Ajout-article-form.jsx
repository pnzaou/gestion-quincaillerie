"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { toBase64 } from "@/utils/convImgToBase64";
import EIBArt from "../ExelImportButtons/EIBArt";
import AriticleFormStep1 from "./Ariticle-form-step1";
import ArticleFormStep2 from "./Article-form-step2";
import ArticleFormStep3 from "./Article-form-step3";
import AjoutArticleFormBtn from "./Ajout-article-form-btn";
import { setInitialValue } from "@/utils/setInitialValue";
import { articleSchema } from "@/schemas";

const AjoutArticleForm = ({
  className,
  cats,
  fours,
  initialData = null,
  ...props
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const shopId = params?.shopId;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(articleSchema),
    mode: "onTouched",
  });

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (isEdit) {
      setInitialValue(setValue, initialData);
    }
  }, [initialData, setValue, isEdit]);

  // Champs à valider par step
  const stepFields = {
    1: ["nom", "category_id", "prixAchat", "prixVente"],
    2: ["QteInitial", "QteStock", "QteAlerte"],
    3: [],
  };

  const onSubmit = async (formData) => {
    // Valide uniquement les champs du step courant avant d'avancer
    if (step < 3) {
      const isValid = await trigger(stepFields[step]);
      if (!isValid) return;
      setStep((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    try {
      const url = isEdit ? `/api/product/${initialData._id}` : "/api/product";
      const method = isEdit ? "PUT" : "POST";

      const data = isEdit ? { ...formData } : { ...formData, businessId: shopId };

      if (formData.image?.length > 0 && formData.image[0]) {
        data.image = await toBase64(formData.image[0]);
      }

      const rep = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await rep.json();
      if (rep.ok) {
        router.push(`/shop/${shopId}/dashboard/article/stock`);
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
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!isEdit && <EIBArt />}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Modifier l'article" : "Ajouter un article"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && step < 3) e.preventDefault();
            }}
            encType="multipart/form-data"
            noValidate
          >
            {step === 1 && (
              <AriticleFormStep1
                cats={cats}
                control={control}
                errors={errors}
                register={register}
              />
            )}
            {step === 2 && (
              <ArticleFormStep2
                control={control}
                errors={errors}
                fours={fours}
                register={register}
              />
            )}
            {step === 3 && <ArticleFormStep3 register={register} />}

            <AjoutArticleFormBtn
              isLoading={isLoading}
              isEdit={isEdit}
              prevStep={prevStep}
              step={step}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AjoutArticleForm;