"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClients } from '@/hooks/useClients';
import { useAssignClientToLead } from '@/hooks/useLeads';
import { Search, UserPlus, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lead } from '@/types/database';

interface AssignClientToLeadDialogProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssignClientToLeadDialog({ lead, open, onOpenChange }: AssignClientToLeadDialogProps) {
    const [search, setSearch] = useState('');
    const { data: clients = [], isLoading } = useClients({ search });
    const assignClient = useAssignClientToLead();

    const handleAssign = async (clientId: string | null) => {
        if (!lead) return;

        try {
            await assignClient.mutateAsync({
                leadId: lead.id,
                clientId: clientId,
            });
            toast.success(clientId ? 'Lead bol priradený ku klientovi' : 'Priradenie bolo zrušené');
            onOpenChange(false);
        } catch (error) {
            toast.error('Nepodarilo sa priradiť klienta');
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Priradiť k existujúcemu klientovi</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Hľadať klienta podľa mena, firmy alebo emailu..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-md p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : clients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                                <p className="text-sm text-muted-foreground">Nenašli sa žiadni klienti</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {clients.map((client) => (
                                    <div
                                        key={client.id}
                                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer group transition-colors"
                                        onClick={() => handleAssign(client.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={client.photo_url || undefined} />
                                                <AvatarFallback>
                                                    {client.contact_name?.charAt(0) || <UserPlus className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{client.contact_name}</span>
                                                {client.company_name && (
                                                    <span className="text-xs text-muted-foreground">{client.company_name}</span>
                                                )}
                                            </div>
                                        </div>
                                        {lead?.client_id === client.id && (
                                            <Check className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
                    {lead?.client_id ? (
                        <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleAssign(null)}
                            disabled={assignClient.isPending}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Odpojiť klienta
                        </Button>
                    ) : <div></div>}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Zrušiť
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
