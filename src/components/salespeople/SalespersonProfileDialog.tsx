"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Users, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { useUpdateSalespersonStatus } from '@/hooks/useSalespeople';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SalespersonProfileDialogProps {
    salesperson: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SalespersonProfileDialog({ salesperson, open, onOpenChange }: SalespersonProfileDialogProps) {
    const updateStatus = useUpdateSalespersonStatus();

    if (!salesperson) return null;

    const handleStatusToggle = async (is_active: boolean) => {
        try {
            await updateStatus.mutateAsync({ id: salesperson.id, is_active });
            toast.success(`Obchodník je teraz ${is_active ? 'aktívny' : 'neaktívny'}`);
        } catch (error) {
            toast.error('Nepodarilo sa zmeniť status');
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-border-dark bg-surface-dark text-white">
                <DialogHeader>
                    <DialogTitle>Profil obchodníka</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header with avatar */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20 bg-primary/10">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                                    {salesperson.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface-dark ${salesperson.is_active ? 'bg-green-500' : 'bg-gray-500'
                                    }`}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">{salesperson.full_name}</h3>
                            <p className="text-sm text-gray-400">{salesperson.region?.name || 'Neurčený región'}</p>
                            
                            <div className="flex gap-2 mt-4">
                                <Button 
                                    size="sm"
                                    variant={salesperson.is_active ? "default" : "outline"}
                                    className={salesperson.is_active ? "bg-green-600 hover:bg-green-700 text-white" : "border-zinc-800 text-zinc-500"}
                                    onClick={() => handleStatusToggle(true)}
                                    disabled={updateStatus.isPending}
                                >
                                    {updateStatus.isPending && salesperson.is_active ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                                    Aktívny
                                </Button>
                                <Button 
                                    size="sm"
                                    variant={!salesperson.is_active ? "default" : "outline"}
                                    className={!salesperson.is_active ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "border-zinc-800 text-zinc-500"}
                                    onClick={() => handleStatusToggle(false)}
                                    disabled={updateStatus.isPending}
                                >
                                    {updateStatus.isPending && !salesperson.is_active ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                                    Neaktívny
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-3 border-y border-border-dark py-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-white">{salesperson.email}</span>
                        </div>
                        {salesperson.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-white">{salesperson.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-white">{salesperson.region?.name || 'Neurčený región'}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-white/5">
                            <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-semibold text-white">{salesperson.stats?.leads || 0}</p>
                            <p className="text-xs text-gray-400">Leady</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-white/5">
                            <Users className="h-5 w-5 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-semibold text-white">{salesperson.stats?.clients || 0}</p>
                            <p className="text-xs text-gray-400">Klienti</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-white/5">
                            <FileText className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-semibold text-white">{salesperson.stats?.quotes || 0}</p>
                            <p className="text-xs text-gray-400">Ponuky</p>
                        </div>
                    </div>

                    {/* Conversion rate */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-white">Konverzná miera</span>
                        </div>
                        <span className="text-xl font-semibold text-primary">
                            {salesperson.stats?.conversionRate || 0}%
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
