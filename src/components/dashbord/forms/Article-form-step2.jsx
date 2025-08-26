import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import FormCombox from "../Form-combox";
import { Input } from "@/components/ui/input";
import Required from "@/components/Required";

const ArticleFormStep2 = ({ control, fours, register, errors }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="grid gap-3 flex-1">
          <Label>
            Fournisseur
            <Required />
          </Label>
          <Controller
            control={control}
            name="supplier_id"
            rules={{ required: false }}
            render={({ field }) => (
              <FormCombox
                value={field.value}
                onChange={field.onChange}
                options={fours.map((four) => ({
                  value: four._id,
                  label: four.nom,
                }))}
                placeholder="Sélectionner un fournisseur"
              />
            )}
          />
          {errors.supplier_id && (
            <p className="text-sm text-red-500">Ce champ est requis</p>
          )}
        </div>
        <div className="grid gap-3 flex-1">
          <Label>
            Quantité Initiale
            <Required />
          </Label>
          <Input
            type="number"
            min="1"
            {...register("QteInitial", { required: true })}
          />
          {errors.QteInitial && (
            <p className="text-sm text-red-500">Ce champ est requis</p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="grid gap-3 flex-1">
          <Label>
            Quantité en Stock
            <Required />
          </Label>
          <Input
            type="number"
            min="1"
            {...register("QteStock", { required: true })}
          />
          {errors.QteStock && (
            <p className="text-sm text-red-500">Ce champ est requis</p>
          )}
        </div>
        <div className="grid gap-3 flex-1">
          <Label>
            Quantité d'Alerte
            <Required />
          </Label>
          <Input
            type="number"
            min="1"
            {...register("QteAlerte", { required: true })}
          />
          {errors.QteAlerte && (
            <p className="text-sm text-red-500">Ce champ est requis</p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="grid gap-3 flex-1">
          <Label>Référence</Label>
          <Input {...register("reference")} />
        </div>
        <div className="grid gap-3 flex-1">
          <Label>Date d'expiration</Label>
          <Input type="date" {...register("dateExpiration")} />
        </div>
      </div>
    </div>
  );
};

export default ArticleFormStep2;
