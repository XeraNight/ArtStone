"use client";

import { useState } from 'react';
import { useCreateClient } from '@/hooks/useClients';
import { useRegions } from '@/hooks/useRegions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Camera, X, Upload, UploadCloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function CreateClientDialog({ open: controlledOpen, onOpenChange: setControlledOpen }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [formData, setFormData] = useState({
        contact_name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        postal_code: '',
        region_id: '',
        status: 'prospect' as 'prospect' | 'active' | 'inactive' | 'completed',
        notes: '',
        photo_url: '',
    });

    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    const createClient = useCreateClient();
    const { data: regions = [] } = useRegions();
    const { user } = useAuth();
    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.contact_name) {
            toast.error('Meno kontaktnej osoby je povinné');
            return;
        }

        let currentPhotoUrl = formData.photo_url;
        setUploadingPhoto(true);

        try {
            if (newImageFile) {
                const supabase = createSupabaseClient();
                const fileExt = newImageFile.name.split('.').pop();
                const fileName = `new-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = fileName;

                const { error: uploadError } = await supabase.storage
                    .from('clients')
                    .upload(filePath, newImageFile, {
                        upsert: true,
                        contentType: newImageFile.type
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('clients')
                    .getPublicUrl(filePath);

                currentPhotoUrl = publicUrl;
            }

            await createClient.mutateAsync({
                contact_name: formData.contact_name,
                company_name: formData.company_name || null,
                email: formData.email || null,
                phone: formData.phone || null,
                address: formData.address || null,
                postal_code: formData.postal_code || null,
                region_id: formData.region_id || null,
                status: formData.status,
                notes: formData.notes || null,
                photo_url: currentPhotoUrl || null,
            });

            toast.success('Klient bol úspešne vytvorený');
            setOpen?.(false);
            setPhotoPreview(null);
            setFormData({
                contact_name: '',
                company_name: '',
                email: '',
                phone: '',
                address: '',
                postal_code: '',
                region_id: '',
                status: 'prospect',
                notes: '',
                photo_url: '',
            });
        } catch (error: any) {
            console.error('Create client error:', error);
            toast.error(error.message || 'Nepodarilo sa vytvoriť klienta');
            if (error.details) {
                toast.error(error.details);
            }
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Vytvoriť nového klienta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-center block">Fotka klienta</Label>
                        <label className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-800 bg-zinc-900/30 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer group relative overflow-hidden min-h-[160px] rounded-xl z-10">
                            {photoPreview || formData.photo_url ? (
                                <>
                                    <img src={photoPreview || formData.photo_url || ''} alt="Náhľad" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
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
                                            setFormData(prev => ({ ...prev, photo_url: '' }));
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
                            <Label htmlFor="contact_name">Meno a priezvisko *</Label>
                            <Input
                                id="contact_name"
                                placeholder="Ján Novák"
                                value={formData.contact_name}
                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Firma</Label>
                            <Input
                                id="company_name"
                                placeholder="Firma s.r.o."
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jan@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefón</Label>
                            <Input
                                id="phone"
                                placeholder="+421 9xx xxx xxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Adresa</Label>
                            <Input
                                id="address"
                                placeholder="Ulica 123"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">PSČ</Label>
                            <Input
                                id="postal_code"
                                placeholder="000 00"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="region">Región</Label>
                        <Select
                            value={formData.region_id || 'none'}
                            onValueChange={(value) => setFormData({ ...formData, region_id: value === 'none' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Vyberte región" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Bez regiónu</SelectItem>
                                {regions.map((region) => (
                                    <SelectItem key={region.id} value={region.id}>
                                        {region.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Poznámka</Label>
                        <Textarea
                            id="notes"
                            placeholder="Interné poznámky..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen?.(false)}
                            disabled={createClient.isPending}
                        >
                            Zrušiť
                        </Button>
                        <Button type="submit" disabled={createClient.isPending}>
                            {createClient.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Vytváram...
                                </>
                            ) : (
                                'Vytvoriť klienta'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
