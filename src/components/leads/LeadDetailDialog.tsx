"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivities } from '@/hooks/useActivities';
import { useSalespeople } from '@/hooks/useSalespeople';
import { useAssignLead, useUnassignLead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus, LeadSource } from '@/types/database';
import { Mail, Phone, MapPin, Building, Calendar, User, Globe, FileText, Tag, StickyNote, CheckCircle2, History, UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface LeadDetailDialogProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    statusLabels: Record<LeadStatus, string>;
    sourceLabels: Record<LeadSource, string>;
    getRegionName: (id: string | null) => string;
    onEdit?: () => void;
}

const activityTypeIcons: Record<string, React.ReactNode> = {
    call: <Phone className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    note: <StickyNote className="h-4 w-4" />,
    status_change: <CheckCircle2 className="h-4 w-4" />,
};

export function LeadDetailDialog({
    lead,
    open,
    onOpenChange,
    statusLabels,
    sourceLabels,
    getRegionName,
    onEdit
}: LeadDetailDialogProps) {
    const { data: activities = [], isLoading: activitiesLoading } = useActivities({
        entityType: 'lead',
        entityId: lead?.id,
        limit: 5,
    });

    const { data: salespeople = [], isLoading: salesLoading } = useSalespeople();
    const assignLead = useAssignLead();
    const unassignLead = useUnassignLead();

    if (!lead) return null;

    const handleAssign = async (userId: string) => {
        try {
            await assignLead.mutateAsync({ leadId: lead.id, userId });
            toast.success('Lead bol úspešne priradený');
        } catch (error) {
            toast.error('Chyba pri priraďovaní leadu');
        }
    };

    const handleUnassign = async () => {
        try {
            await unassignLead.mutateAsync(lead.id);
            toast.success('Priradenie bolo zrušené');
        } catch (error) {
            toast.error('Chyba pri rušení priradenia');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#030303] border-slate-200 dark:border-zinc-800">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{lead.contact_name}</DialogTitle>
                        <div className="flex items-center gap-3">
                            <Badge variant={lead.status} className="uppercase tracking-widest text-[10px] px-3 py-1">
                                {statusLabels[lead.status]}
                            </Badge>
                            {onEdit && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={onEdit}
                                    className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                                >
                                    Upraviť
                                </Button>
                            )}
                        </div>
                    </div>
                    {lead.company_name && (
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{lead.company_name}</p>
                    )}
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {/* Contact Info */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Kontaktné údaje</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-950/50 p-5 rounded-xl border border-slate-100 dark:border-zinc-900">
                            {lead.email && (
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg group-hover:text-primary transition-colors border border-slate-100 dark:border-zinc-800">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <a href={`mailto:${lead.email}`} className="text-slate-600 dark:text-zinc-300 hover:text-primary transition-colors">{lead.email}</a>
                                </div>
                            )}
                            {lead.phone && (
                                <div className="flex items-center gap-3 text-sm group">
                                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg group-hover:text-primary transition-colors border border-slate-100 dark:border-zinc-800">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <a href={`tel:${lead.phone}`} className="text-slate-600 dark:text-zinc-300 hover:text-primary transition-colors">{lead.phone}</a>
                                </div>
                            )}
                            {(lead.address || lead.postal_code) && (
                                <div className="flex items-start gap-3 text-sm sm:col-span-2 group">
                                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg group-hover:text-primary transition-colors border border-slate-100 dark:border-zinc-800 mt-0.5">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span className="text-slate-600 dark:text-zinc-300">
                                        {[lead.address, lead.postal_code].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Business Info */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Informácie</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-zinc-950/50 p-5 rounded-xl border border-slate-100 dark:border-zinc-900">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> Zdroj
                                </span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{sourceLabels[lead.source_type]}</p>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="h-3 w-3" /> Región
                                </span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{getRegionName(lead.region_id)}</p>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> Vytvorené
                                </span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {new Date(lead.created_at).toLocaleDateString('sk-SK')}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Priradené
                                </span>
                                <p className="text-sm font-bold text-primary">
                                    {(lead as any).assigned_user?.full_name || 'Nepriradené'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Assignment Buttons Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Priradiť obchodníka</h4>
                            {lead.assigned_user_id && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleUnassign}
                                    className="h-7 px-2 text-[10px] font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 uppercase tracking-widest gap-2"
                                    disabled={assignLead.isPending || unassignLead.isPending}
                                >
                                    <UserMinus className="h-3 w-3" />
                                    Zrušiť
                                </Button>
                            )}
                        </div>
                        
                        {salesLoading ? (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                                <Loader2 className="h-3 w-3 animate-spin" /> Načítavam obchodníkov...
                            </div>
                        ) : salespeople.length === 0 ? (
                            <p className="text-xs text-zinc-500 italic py-2">Žiadni obchodníci k dispozícii</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {salespeople.map((person) => (
                                    <button
                                        key={person.id}
                                        onClick={() => handleAssign(person.id)}
                                        disabled={assignLead.isPending || unassignLead.isPending || lead.assigned_user_id === person.id}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                            lead.assigned_user_id === person.id
                                                ? "bg-primary text-black border-primary shadow-[0_4px_12px_rgba(255,102,0,0.2)]"
                                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-primary/50 hover:text-primary dark:hover:text-primary"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            lead.assigned_user_id === person.id ? "bg-black" : "bg-zinc-700"
                                        )} />
                                        <span className="truncate">{person.full_name || person.email}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Notes */}
                    {lead.notes && (
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Poznámka</h4>
                            <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-900 text-sm whitespace-pre-wrap text-slate-600 dark:text-zinc-300">
                                {lead.notes}
                            </div>
                        </section>
                    )}

                    {/* Recent Activities */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-zinc-500" />
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Posledné aktivity</h4>
                        </div>
                        {activitiesLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-8 text-xs text-zinc-500 bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                                Žiadne aktivity
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity: any) => (
                                    <div
                                        key={activity.id}
                                        className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors border border-slate-100 dark:border-zinc-800"
                                    >
                                        <div className="text-primary mt-0.5">
                                            {activityTypeIcons[activity.activity_type] || <FileText className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {activity.title}
                                                </p>
                                                <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap uppercase tracking-widest">
                                                    {new Date(activity.created_at).toLocaleDateString('sk-SK')}
                                                </span>
                                            </div>
                                            {activity.description && (
                                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
