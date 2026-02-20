import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormCombox from "../Form-combox";
import Required from "@/components/Required";
import { Controller } from "react-hook-form";

const AriticleFormStep1 = ({ register, errors, control, cats }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="grid gap-3 flex-1">
          <Label>
            Nom
            <Required />
          </Label>
          <Input {...register("nom")} />
          {errors.nom && (
            <p className="text-sm text-red-500">{errors.nom.message}</p>
          )}
        </div>
        <div className="grid gap-3 flex-1">
          <Label>
            Catégorie
            <Required />
          </Label>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <FormCombox
                value={field.value}
                onChange={field.onChange}
                options={cats.map((cat) => ({
                  value: cat._id,
                  label: cat.nom,
                }))}
                placeholder="Sélectionner une catégorie"
              />
            )}
          />
          {errors.category_id && (
            <p className="text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="grid gap-3 flex-1">
          <Label>
            Prix d'Achat
            <Required />
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            {...register("prixAchat")}
          />
          {errors.prixAchat && (
            <p className="text-sm text-red-500">{errors.prixAchat.message}</p>
          )}
        </div>
        <div className="grid gap-3 flex-1">
          <Label>
            Prix de Vente
            <Required />
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            {...register("prixVente")}
          />
          {errors.prixVente && (
            <p className="text-sm text-red-500">{errors.prixVente.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AriticleFormStep1;