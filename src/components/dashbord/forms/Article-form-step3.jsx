import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ArticleFormStep3 = ({ register }) => {
    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <div className="grid gap-3 flex-1/2">
                    <Label htmlFor="image">Image</Label>
                    <Input id="image" type="file" accept="image/*" {...register("image")}/>
                </div>
            </div>
            <div className="flex gap-2 mb-4">
                <div className="grid gap-3 flex-1/2">
                    <div className="flex items-center">
                        <Label htmlFor="description">Description</Label>
                    </div>
                    <Textarea id="description" {...register("description")}/>
                </div>
            </div>
        </div>
    );
}

export default ArticleFormStep3;
