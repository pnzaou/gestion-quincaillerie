"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ClientAccountInfoCard({ client, account, setAccount, transactions, setTransactions }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    // Create account if doesn't exist
    if (!account && client) {
      
      const res = await fetch(`/api/client/${client._id}/client-account`, {
        method: "POST",
        body: JSON.stringify({ amount, description: depositDescription || "Dépôt initial" }),
      })

      console.log(res)
      const data = await res.json();
      console.log(data)
      if(!res.ok && res.status !== 201){
        toast.error(data?.message || "Erreur lors de la création du compte");
        return;
      }
      setAccount(data?.data?.account);
      setTransactions([data?.data?.transaction, ...transactions]);
      
      toast.success("Compte créé avec succès");

    } else if (account) {
      // Add deposit to existing account
      const newBalance = account.balance + amount;
      setAccount({ ...account, balance: newBalance, lastUpdated: new Date() });
      
      const newTransaction = {
        _id: `tx${Date.now()}`,
        account: account._id,
        type: "deposit",
        amount,
        balanceAfter: newBalance,
        description: depositDescription || "Dépôt",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTransactions([newTransaction, ...transactions]);
      
      toast({
        title: "Dépôt effectué",
        description: `${amount.toLocaleString()} FCFA ajouté au compte`,
      });
    }

    setIsDialogOpen(false);
    setDepositAmount("");
    setDepositDescription("");
  };
  
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Compte Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {account ? (
          <>
            <div className="bg-sky-100 rounded-lg p-6 border border-sky-600/20">
              <p className="text-sm text-muted-foreground mb-2">Solde Actuel</p>
              <p className="text-3xl md:text-4xl font-bold text-sky-600">
                {account.balance.toLocaleString()} FCFA
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dernière MAJ</p>
                <p className="font-medium text-sm">
                  {new Date(account.lastUpdated).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compte créé</p>
                <p className="font-medium text-sm">
                  {new Date(account.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-sky-600 hover:bg-sky-700"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Effectuer un Dépôt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Effectuer un Dépôt</DialogTitle>
                  <DialogDescription>
                    Ajouter de l'argent au compte de {client.nomComplet}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (FCFA)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Ex: 10000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ex: Dépôt mensuel"
                      value={depositDescription}
                      onChange={(e) => setDepositDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    Confirmer le Dépôt
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Ce client n'a pas encore de compte
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un Compte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un Compte Client</DialogTitle>
                  <DialogDescription>
                    Un dépôt initial est requis pour créer le compte de{" "}
                    {client.nomComplet}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Montant du Dépôt Initial (FCFA)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Ex: 10000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ex: Dépôt initial"
                      value={depositDescription}
                      onChange={(e) => setDepositDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    className="bg-sky-600 text-white hover:bg-sky-700"
                  >
                    Créer le Compte
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
