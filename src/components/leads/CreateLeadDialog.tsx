"use client";
import { useState } from 'react';
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
import { useCreateLead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { Plus, Loader2, Camera, X, Upload, UploadCloud, RefreshCw } from 'lucide-react';
import { useRegions } from '@/hooks/useRegions';
import type { LeadSource, LeadStatus } from '@/types/database';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FormData {
    contact_name: string;
    company_name: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    region_id: string;
    status: LeadStatus;
    source_type: LeadSource;
    notes: string;
    photo_url: string;
}

export function CreateLeadDialog({ open: controlledOpen, onOpenChange: setControlledOpen }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const createLead = useCreateLead();
    const { data: regions } = useRegions();

    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            status: 'new',
            source_type: 'manual',
            photo_url: '',
        }
    });

    const photoUrl = watch('photo_url');

    const onSubmit = async (data: FormData) => {
        setUploadingPhoto(true);
        let finalPhotoUrl = data.photo_url;

        try {
            if (newImageFile) {
                const supabase = createSupabaseClient();
                const fileExt = newImageFile.name.split('.').pop();
                const fileName = `new-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
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

            await createLead.mutateAsync({
                ...data,
                company_name: data.company_name || null,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                postal_code: data.postal_code || null,
                region_id: data.region_id || null,
                notes: data.notes || null,
                photo_url: finalPhotoUrl || null,
            });
            toast.success('Lead bol úspešne vytvorený');
            setOpen?.(false);
            setPhotoPreview(null);
            reset();
        } catch (error) {
            console.error('Create lead error:', error);
            // @ts-ignore
            const errorMessage = error?.message || 'Neznáma chyba';
            // @ts-ignore
            const errorDetails = error?.details || '';
            toast.error(`Nepodarilo sa vytvoriť lead: ${errorMessage} ${errorDetails}`);
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Vytvoriť nový lead</DialogTitle>
                    <DialogDescription>
                        Vyplňte informácie o novom potenciálnom klientovi.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-4">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-center block">Fotka leadu</Label>
                        <label className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-800 bg-zinc-900/30 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer group relative overflow-hidden min-h-[160px] rounded-xl z-10">
                            {photoPreview || photoUrl ? (
                                <>
                                    <img src={photoPreview || photoUrl || ''} alt="Náhľad" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
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
                                onChange={(e) => {
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
                            <Label htmlFor="contact_name">Meno kontaktu *</Label>
                            <Input
                                id="contact_name"
                                {...register('contact_name', { required: true })}
                                className={errors.contact_name ? 'border-destructive' : ''}
                            />
                            {errors.contact_name && (
                                <span className="text-xs text-destructive">Toto pole je povinné</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Názov firmy</Label>
                            <Input id="company_name" {...register('company_name')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefón</Label>
                            <Input id="phone" {...register('phone')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="source">Zdroj</Label>
                            <Select
                                onValueChange={(value) => setValue('source_type', value as LeadSource)}
                                defaultValue="manual"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte zdroj" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manuálne</SelectItem>
                                    <SelectItem value="website_form">Web formulár</SelectItem>
                                    <SelectItem value="facebook_lead_ads">Facebook Lead Ads</SelectItem>
                                    <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                                    <SelectItem value="google_ads">Google Ads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                onValueChange={(value) => setValue('status', value as LeadStatus)}
                                defaultValue="new"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte status" />
                                </SelectTrigger>
                                <SelectContent>
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

                    <div className="space-y-2">
                        <Label htmlFor="region">Región</Label>
                        <Select onValueChange={(value) => setValue('region_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Vyberte región" />
                            </SelectTrigger>
                            <SelectContent>
                                {regions?.map((region) => (
                                    <SelectItem key={region.id} value={region.id}>
                                        {region.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Poznámka</Label>
                        <Textarea id="notes" {...register('notes')} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>
                            Zrušiť
                        </Button>
                        <Button type="submit" disabled={createLead.isPending}>
                            {createLead.isPending ? 'Vytváranie...' : 'Vytvoriť lead'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
