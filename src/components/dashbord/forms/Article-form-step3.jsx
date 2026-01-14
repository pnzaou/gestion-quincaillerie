import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ArticleFormStep3 = ({ register }) => {
  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="grid gap-3 w-full">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          {...register("image")}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">
          Formats acceptés : JPG, PNG, GIF (Max 5MB)
        </p>
      </div>

      {/* Description */}
      <div className="grid gap-3 w-full">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          {...register("description")}
          placeholder="Décrivez votre article..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          Informations complémentaires sur l'article (optionnel)
        </p>
      </div>
    </div>
  );
};

export default ArticleFormStep3;