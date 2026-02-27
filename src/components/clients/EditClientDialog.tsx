"use client";

import { useState, useEffect } from 'react';
import { useUpdateClient } from '@/hooks/useClients';
import { useRegions } from '@/hooks/useRegions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Camera, X, Upload, User, UploadCloud, RefreshCw } from 'lucide-react';
import { useSalespeople } from '@/hooks/useSalespeople';
import { toast } from 'sonner';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Client, ClientStatus } from '@/types/database';

interface EditClientDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<ClientStatus, string> = {
    active: 'Aktívny',
    inactive: 'Neaktívny',
    prospect: 'Potenciálny',
    completed: 'Ukončená spolupráca',
};

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
    const [formData, setFormData] = useState({
        contact_name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        postal_code: '',
        region_id: '',
        notes: '',
        status: 'prospect' as ClientStatus,
        total_value: '',
        photo_url: '',
        salesperson_id: '',
    });

    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    const updateClient = useUpdateClient();
    const { data: regions = [] } = useRegions();
    const { data: salespeople = [] } = useSalespeople();

    useEffect(() => {
        if (client) {
            setFormData({
                contact_name: client.contact_name || '',
                company_name: client.company_name || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                postal_code: client.postal_code || '',
                region_id: client.region_id || '',
                notes: client.notes || '',
                status: client.status || 'prospect',
                total_value: client.total_value?.toString() || '',
                photo_url: client.photo_url || '',
                salesperson_id: client.salesperson_id || '',
            });
            setPhotoPreview(client.photo_url || null);
        }
    }, [client, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!client) return;

        if (!formData.contact_name) {
            toast.error('Meno kontaktnej osoby je povinné');
            return;
        }

        try {
            setUploadingPhoto(true);
            let finalPhotoUrl = formData.photo_url;

            if (newImageFile) {
                const supabase = createSupabaseClient();
                const fileExt = newImageFile.name.split('.').pop();
                const fileName = `${client.id}-${Date.now()}.${fileExt}`;
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

                finalPhotoUrl = publicUrl;
            }

            await updateClient.mutateAsync({
                id: client.id,
                contact_name: formData.contact_name,
                company_name: formData.company_name || null,
                email: formData.email || null,
                phone: formData.phone || null,
                address: formData.address || null,
                postal_code: formData.postal_code || null,
                region_id: formData.region_id || null,
                notes: formData.notes || null,
                status: formData.status,
                total_value: formData.total_value ? parseFloat(formData.total_value) : 0,
                photo_url: finalPhotoUrl || null,
                salesperson_id: formData.salesperson_id || null,
            });

            toast.success('Klient bol úspešne aktualizovaný');
            onOpenChange(false);
        } catch (error) {
            toast.error('Nepodarilo sa aktualizovať klienta');
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upraviť klienta</DialogTitle>
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
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ClientStatus) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key as ClientStatus}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-total_value">Celková hodnota (€)</Label>
                            <Input
                                id="edit-total_value"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.total_value}
                                onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-contact_name">Meno a priezvisko *</Label>
                            <Input
                                id="edit-contact_name"
                                placeholder="Ján Novák"
                                value={formData.contact_name}
                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-company_name">Firma</Label>
                            <Input
                                id="edit-company_name"
                                placeholder="Firma s.r.o."
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                placeholder="jan@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Telefón</Label>
                            <Input
                                id="edit-phone"
                                placeholder="+421 9xx xxx xxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Adresa</Label>
                            <Input
                                id="edit-address"
                                placeholder="Ulica 123"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-postal_code">PSČ</Label>
                            <Input
                                id="edit-postal_code"
                                placeholder="000 00"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-region">Región</Label>
                            <Select
                                value={formData.region_id}
                                onValueChange={(value) => setFormData({ ...formData, region_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte región" />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions.map((region) => (
                                        <SelectItem key={region.id} value={region.id}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-salesperson">Obchodník</Label>
                            <Select
                                value={formData.salesperson_id}
                                onValueChange={(value) => setFormData({ ...formData, salesperson_id: value })}
                            >
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-zinc-500" />
                                        <SelectValue placeholder="Priradiť obchodníka" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nepriradené</SelectItem>
                                    {salespeople.map((person) => (
                                        <SelectItem key={person.id} value={person.id}>
                                            {person.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Poznámka</Label>
                        <Textarea
                            id="edit-notes"
                            placeholder="Interné poznámky..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateClient.isPending}
                        >
                            Zrušiť
                        </Button>
                        <Button type="submit" disabled={updateClient.isPending}>
                            {updateClient.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Ukladám...
                                </>
                            ) : (
                                'Uložiť zmeny'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
