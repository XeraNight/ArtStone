"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLeads, useAssignLead, useUnassignLead } from '@/hooks/useLeads';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Mail, Phone, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { LeadStatus } from '@/types/database';

interface SalespersonLeadsDialogProps {
    salespersonId: string | null;
    salespersonName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<LeadStatus, string> = {
    new: 'Nový',
    waiting: 'Čakajúci',
    contacted: 'Kontaktovaný',
    offer: 'Ponuka',
    won: 'Uzavretý',
    lost: 'Stratený',
};

const statusVariants: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
    new: "secondary",
    waiting: "secondary",
    contacted: "secondary", // Map to available shadcn variants
    offer: "default",
    won: "default",
    lost: "destructive",
};

export function SalespersonLeadsDialog({
    salespersonId,
    salespersonName,
    open,
    onOpenChange,
}: SalespersonLeadsDialogProps) {
    const { user } = useAuth();
    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'správca';

    const { data: allLeads, isLoading } = useLeads();
    const assignLead = useAssignLead();
    const unassignLead = useUnassignLead();

    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string>('');
    const [leadToRemove, setLeadToRemove] = useState<string | null>(null);

    const assignedLeads = allLeads?.filter(l => l.assigned_user_id === salespersonId) || [];
    const availableLeads = allLeads?.filter(l => !l.assigned_user_id) || [];

    const handleAssign = async () => {
        if (!salespersonId || !selectedLeadId) return;

        try {
            await assignLead.mutateAsync({ leadId: selectedLeadId, userId: salespersonId });
            toast.success('Lead bol priradený');
            setShowAssignDialog(false);
            setSelectedLeadId('');
        } catch {
            toast.error('Nepodarilo sa priradiť lead');
        }
    };

    const handleUnassign = async () => {
        if (!leadToRemove) return;

        try {
            await unassignLead.mutateAsync(leadToRemove);
            toast.success('Priradenie zrušené');
            setLeadToRemove(null);
        } catch {
            toast.error('Nepodarilo sa zrušiť priradenie');
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto border-border-dark bg-surface-dark text-white">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>Leady - {salespersonName}</DialogTitle>
                            {isAdminOrManager && availableLeads.length > 0 && (
                                <Button size="sm" onClick={() => setShowAssignDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Priradiť lead
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-16 w-full bg-white/5" />
                            ))}
                        </div>
                    ) : assignedLeads.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">Žiadne priradené leady</p>
                            {isAdminOrManager && availableLeads.length > 0 && (
                                <Button className="mt-4" onClick={() => setShowAssignDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Priradiť prvý lead
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-400 mb-4">
                                Celkom {assignedLeads.length} {assignedLeads.length === 1 ? 'lead' : assignedLeads.length < 5 ? 'leady' : 'leadov'}
                            </p>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border-dark hover:bg-transparent">
                                        <TableHead className="text-gray-400">Kontakt</TableHead>
                                        <TableHead className="text-gray-400">Informácie</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        {isAdminOrManager && <TableHead className="w-12"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedLeads.map(lead => (
                                        <TableRow key={lead.id} className="border-border-dark hover:bg-white/5 text-white">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{lead.contact_name}</p>
                                                    {lead.company_name && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {lead.company_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-xs text-gray-400">
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate max-w-[150px]">{lead.email}</span>
                                                        </div>
                                                    )}
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{lead.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariants[lead.status as LeadStatus]}>
                                                    {statusLabels[lead.status as LeadStatus]}
                                                </Badge>
                                            </TableCell>
                                            {isAdminOrManager && (
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setLeadToRemove(lead.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Assign Lead Sub-Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent className="sm:max-w-[500px] border-border-dark bg-surface-dark text-white">
                    <DialogHeader>
                        <DialogTitle>Priradiť lead pre {salespersonName}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {availableLeads.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">
                                Žiadne nepriradené leady
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                                    <SelectTrigger className="bg-white/5 border-border-dark text-white">
                                        <SelectValue placeholder="Vyberte lead" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-dark border-border-dark text-white">
                                        {availableLeads.map(lead => (
                                            <SelectItem key={lead.id} value={lead.id}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{lead.contact_name}</span>
                                                    {lead.company_name && (
                                                        <span className="text-gray-400 text-xs text-white"> ({lead.company_name})</span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowAssignDialog(false)} className="border-border-dark text-white hover:bg-white/5">
                                Zrušiť
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={!selectedLeadId || assignLead.isPending}
                            >
                                Priradiť
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove Confirmation */}
            <AlertDialog open={!!leadToRemove} onOpenChange={() => setLeadToRemove(null)}>
                <AlertDialogContent className="border-border-dark bg-surface-dark text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Zrušiť priradenie?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Naozaj chcete zrušiť priradenie tohto leadu? Lead zostane v systéme, ale nebude priradený žiadnemu obchodníkovi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border-dark text-white hover:bg-white/5">Zrušiť</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnassign} className="bg-red-500 hover:bg-red-600 text-white border-0">
                            Potvrdiť
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
