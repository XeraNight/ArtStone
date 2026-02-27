"use client";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateLead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { useRegions } from '@/hooks/useRegions';
import { useSalespeople } from '@/hooks/useSalespeople';
import type { Lead, LeadSource, LeadStatus } from '@/types/database';
import { User, Loader2, Camera, X, Upload, UploadCloud, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FormData {
    contact_name: string;
    company_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    region_id: string;
    status: LeadStatus;
    source_type: LeadSource;
    notes: string;
    salesperson_id: string;
    photo_url: string;
}

interface EditLeadDialogProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({ lead, open, onOpenChange }: EditLeadDialogProps) {
    const updateLead = useUpdateLead();
    const { data: regions } = useRegions();
    const { data: salespeople } = useSalespeople();

    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        if (lead && open) {
            reset({
                contact_name: lead.contact_name,
                company_name: lead.company_name || '',
                email: lead.email || '',
                phone: lead.phone || '',
                address: lead.address || '',
                city: lead.city || '',
                postal_code: lead.postal_code || '',
                region_id: lead.region_id || '',
                status: lead.status,
                source_type: lead.source_type,
                notes: lead.notes || '',
                salesperson_id: lead.salesperson_id || '',
                photo_url: lead.photo_url || '',
            });
            setPhotoPreview(lead.photo_url || null);
        }
    }, [lead, open, reset]);

    const onSubmit = async (data: FormData) => {
        if (!lead) return;

        try {
            setUploadingPhoto(true);
            let finalPhotoUrl = data.photo_url;

            if (newImageFile) {
                const supabase = createSupabaseClient();
                const fileExt = newImageFile.name.split('.').pop();
                const fileName = `${lead.id}-${Date.now()}.${fileExt}`;
                const filePath = fileName;

                const { error: uploadError } = await supabase.storage
                    .from('leads')
                    .upload(filePath, newImageFile, {
                        upsert: true,
                        contentType: newImageFile.type
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('leads')
                    .getPublicUrl(filePath);

                finalPhotoUrl = publicUrl;
            }

            await updateLead.mutateAsync({
                id: lead.id,
                ...data,
                company_name: data.company_name || null,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                city: data.city || null,
                postal_code: data.postal_code || null,
                region_id: data.region_id || null,
                notes: data.notes || null,
                salesperson_id: data.salesperson_id || null,
                photo_url: finalPhotoUrl || null,
            });
            toast.success('Lead bol úspešne aktualizovaný');
            onOpenChange(false);
        } catch (error) {
            toast.error('Nepodarilo sa aktualizovať lead');
            console.error(error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-zinc-800 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white uppercase tracking-tight">Upraviť lead</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Upravte informácie o potenciálnom klientovi.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-center block">Fotka leadu</Label>
                        <label className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-800 bg-zinc-900/30 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer group relative overflow-hidden min-h-[160px] rounded-xl z-10">
                            {photoPreview || (lead?.photo_url) ? (
                                <>
                                    <img src={photoPreview || lead?.photo_url || ''} alt="Náhľad" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-medium flex items-center gap-2 text-sm bg-black/60 px-4 py-2 rounded-full border border-white/20">
                                            <RefreshCw className="w-4 h-4" />
                                            Zmeniť fotku
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPhotoPreview(null);
                                            setValue('photo_url', '');
                                        }}
                                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full z-20 shadow-lg transition-transform hover:scale-110"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center z-10 select-none">
                                    <UploadCloud className="w-10 h-10 mb-3 text-zinc-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-white">
                                        {uploadingPhoto ? "Nahrávam..." : "Kliknite pre nahratie fotky"}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Podpora: PNG, JPG</span>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setNewImageFile(file);
                                    setPhotoPreview(URL.createObjectURL(file));
                                }}
                                disabled={uploadingPhoto}
                            />
                        </label>
                        {uploadingPhoto && (
                            <div className="absolute inset-x-6 top-6 bottom-6 flex items-center justify-center bg-black/60 rounded-xl z-20">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-contact_name" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Meno kontaktu *</Label>
                            <Input
                                id="edit-contact_name"
                                {...register('contact_name', { required: true })}
                                className={cn(
                                    "bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary",
                                    errors.contact_name ? 'border-destructive' : ''
                                )}
                            />
                            {errors.contact_name && (
                                <span className="text-[10px] text-destructive uppercase font-bold">Toto pole je povinné</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-company_name" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Názov firmy</Label>
                            <Input id="edit-company_name" {...register('company_name')} className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-email" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email</Label>
                            <Input id="edit-email" type="email" {...register('email')} className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Telefón</Label>
                            <Input id="edit-phone" {...register('phone')} className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-address" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Adresa</Label>
                            <Input id="edit-address" {...register('address')} placeholder="Ulica 123" className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-city" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Mesto</Label>
                            <Input id="edit-city" {...register('city')} placeholder="Bratislava" className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-postal_code" className="text-xs font-bold uppercase tracking-widest text-zinc-400">PSČ</Label>
                            <Input id="edit-postal_code" {...register('postal_code')} placeholder="000 00" className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status</Label>
                            <Select
                                onValueChange={(value) => setValue('status', value as LeadStatus)}
                                defaultValue={lead?.status}
                                value={lead ? lead.status : undefined}
                            >
                                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                    <SelectValue placeholder="Vyberte status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="new">Nový</SelectItem>
                                    <SelectItem value="contacted">Kontaktovaný</SelectItem>
                                    <SelectItem value="offer">Ponuka</SelectItem>
                                    <SelectItem value="won">Vyhraný</SelectItem>
                                    <SelectItem value="lost">Stratený</SelectItem>
                                    <SelectItem value="waiting">Čaká sa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-region" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Región</Label>
                            <Select
                                onValueChange={(value) => setValue('region_id', value)}
                                defaultValue={lead?.region_id || undefined}
                            >
                                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                    <SelectValue placeholder="Vyberte región" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {regions?.map((region) => (
                                        <SelectItem key={region.id} value={region.id}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-salesperson" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Obchodník</Label>
                            <Select
                                onValueChange={(value) => setValue('salesperson_id', value === 'none' ? '' : value)}
                                defaultValue={lead?.salesperson_id || undefined}
                            >
                                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-zinc-500" />
                                        <SelectValue placeholder="Priradiť obchodníka" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="none">Nepriradené</SelectItem>
                                    {salespeople?.map((person) => (
                                        <SelectItem key={person.id} value={person.id}>
                                            {person.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-notes" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Poznámka</Label>
                        <Textarea id="edit-notes" {...register('notes')} className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary min-h-[100px]" />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-white uppercase tracking-widest text-[10px] font-bold">
                            Zrušiť
                        </Button>
                        <Button type="submit" disabled={updateLead.isPending} className="bg-primary text-black hover:bg-primary-hover uppercase tracking-widest text-[10px] font-bold px-8">
                            {updateLead.isPending ? 'Ukladám...' : 'Uložiť zmeny'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
