"use client"

import { useState, useEffect } from "react";
import { ArrowLeft, User, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { mockClients, mockClientAccounts, mockAccountTransactions } from "@/data/mockClients";
import TransactionTypeBadge from "@/components/transaction-type-badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import ClientAccountInfoCard from "@/components/dashbord/client-account-info-card";

const Page = () => {
  const params = useParams();
  const id = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/client/${id}`);
        const data = await res.json();
        if(!res.ok && res.status !== 200) {
          toast.error(data?.message || "Erreur lors de la récupération des détails du client");
          return;
        }
        setClient(data?.data?.client);
        setAccount(data.data.account);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du client:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  // useEffect(() => {
  //   // Simulate loading
  //   const timer = setTimeout(() => {
  //     const foundClient = mockClients.find((c) => c._id === id);
  //     setClient(foundClient || null);
      
  //     if (foundClient) {
  //       const foundAccount = mockClientAccounts.find((a) => a.client === foundClient._id);
  //       setAccount(foundAccount || null);
        
  //       if (foundAccount) {
  //         const foundTransactions = mockAccountTransactions.filter((t) => t.account === foundAccount._id);
  //         setTransactions(foundTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  //       }
  //     }
      
  //     setIsLoading(false);
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Link href="/dashboard/client">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Client non trouvé</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/client">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {client.nomComplet}
          </h1>
        </div>

        {/* Client Info & Account Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom Complet</p>
                <p className="font-semibold text-lg">{client.nomComplet}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{client.tel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{client.email || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{client.adresse || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Date de création</p>
                  <p className="font-medium text-sm">
                    {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <ClientAccountInfoCard
           client={client}
           account={account}
           transactions={transactions}
           setAccount={setAccount}
           setTransactions={setTransactions}
          />
        </div>

        {/* Transactions */}
        {account && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Historique des Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Aucune transaction enregistrée
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Solde Après</TableHead>
                          <TableHead>Référence</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell className="font-medium">
                              {new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleTimeString("fr-FR")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <TransactionTypeBadge type={transaction.type} />
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold flex items-center gap-1 ${
                                transaction.type === "deposit" ? "text-[#1ECA5D]" : "text-[#F59F0A]"
                              }`}>
                                {transaction.type === "deposit" ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {transaction.type === "deposit" ? "+" : "-"}
                                {transaction.amount.toLocaleString()} FCFA
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {transaction.balanceAfter.toLocaleString()} FCFA
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {transaction.reference || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.description || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {transactions.map((transaction) => (
                      <Card key={transaction._id} className="shadow-sm">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium">
                                {new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleTimeString("fr-FR")}
                              </p>
                            </div>
                            <TransactionTypeBadge type={transaction.type} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Montant</p>
                              <p className={`font-bold flex items-center gap-1 ${
                                transaction.type === "deposit" ? "text-success" : "text-warning"
                              }`}>
                                {transaction.type === "deposit" ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {transaction.type === "deposit" ? "+" : "-"}
                                {transaction.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Solde Après</p>
                              <p className="font-bold">
                                {transaction.balanceAfter.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {transaction.reference && (
                            <div>
                              <p className="text-sm text-muted-foreground">Référence</p>
                              <p className="font-medium text-sm">{transaction.reference}</p>
                            </div>
                          )}
                          {transaction.description && (
                            <div>
                              <p className="text-sm text-muted-foreground">Description</p>
                              <p className="text-sm">{transaction.description}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Page;
