import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

const ConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, loading }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{description}</DialogDescription>
                <DialogFooter>
                    {/* Bouton Annuler ferme toujours la modale */}
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading} className="hover:cursor-pointer">
                            Annuler
                        </Button>
                    </DialogClose>
                    {/* Bouton Supprimer appelle onConfirm puis ferme dans le parent */}
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="hover:cursor-pointer"
                    >
                        {loading ? (
                        // spinner interne
                        <>
                            <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />  Suppression...
                        </>
                        ) : (
                        'Supprimer'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ConfirmDialog;
