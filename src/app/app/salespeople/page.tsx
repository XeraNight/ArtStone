"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSalespeople } from '@/hooks/useSalespeople';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserPlus, Mail, Phone, MapPin, Users, FileText, TrendingUp, MoreVertical, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { SalespersonProfileDialog } from '@/components/salespeople/SalespersonProfileDialog';
import { SalespersonLeadsDialog } from '@/components/salespeople/SalespersonLeadsDialog';
import { SalespersonClientsDialog } from '@/components/salespeople/SalespersonClientsDialog';

export default function SalespeoplePage() {
    const { user } = useAuth();
    const { data: salespeople, isLoading } = useSalespeople();
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [selectedSalesperson, setSelectedSalesperson] = useState<any | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [leadsOpen, setLeadsOpen] = useState(false);
    const [clientsOpen, setClientsOpen] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'správca';

    const filteredSalespeople = salespeople?.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.region?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleViewProfile = (salesperson: any) => {
        setSelectedSalesperson(salesperson);
        setProfileOpen(true);
    };

    const handleViewLeads = (salesperson: any) => {
        setSelectedSalesperson(salesperson);
        setLeadsOpen(true);
    };

    const handleViewClients = (salesperson: any) => {
        setSelectedSalesperson(salesperson);
        setClientsOpen(true);
    };

    if (isLoading) return <PageSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Obchodníci</h1>
                    <p className="text-gray-400">Správa a štatistiky obchodných zástupcov</p>
                </div>
                {isAdmin && (
                    <Button className="w-full md:w-auto">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Pridať obchodníka
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
            <Card className="border-border-dark bg-surface-dark shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Hľadať podľa mena, emailu alebo regiónu..."
                            className="pl-10 bg-white/5 border-border-dark text-white placeholder:text-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Salespeople List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalespeople.map((sp) => (
                    <Card key={sp.id} className="border-border-dark bg-surface-dark hover:shadow-md transition-all group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-primary/20 bg-primary/10">
                                    <AvatarFallback className="text-primary font-medium">
                                        {sp.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg text-white">{sp.full_name}</CardTitle>
                                    <p className="text-xs text-gray-400">{sp.region?.name || 'Všetky regióny'}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-border-dark bg-surface-dark text-white">
                                    <DropdownMenuItem onClick={() => handleViewProfile(sp)} className="focus:bg-white/5 focus:text-white cursor-pointer">
                                        <Eye className="h-4 w-4 mr-2" /> Detail profilu
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewLeads(sp)} className="focus:bg-white/5 focus:text-white cursor-pointer">
                                        <Users className="h-4 w-4 mr-2" /> Zobraziť leady
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewClients(sp)} className="focus:bg-white/5 focus:text-white cursor-pointer">
                                        <Users className="h-4 w-4 mr-2" /> Zobraziť klientov
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="truncate">{sp.email}</span>
                                </div>
                                {sp.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>{sp.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-dark">
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-white">{sp.stats?.leads || 0}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Leady</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-white">{sp.stats?.clients || 0}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Klienti</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-white">{sp.stats?.conversionRate || 0}%</p>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Rate</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs border-border-dark text-gray-300 hover:bg-white/5"
                                    onClick={() => handleViewLeads(sp)}
                                >
                                    Leady
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs border-border-dark text-gray-300 hover:bg-white/5"
                                    onClick={() => handleViewClients(sp)}
                                >
                                    Klienti
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredSalespeople.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Nenašli sa žiadni obchodníci</p>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <SalespersonProfileDialog
                salesperson={selectedSalesperson}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
            <SalespersonLeadsDialog
                salespersonId={selectedSalesperson?.id}
                salespersonName={selectedSalesperson?.full_name || ''}
                open={leadsOpen}
                onOpenChange={setLeadsOpen}
            />
            <SalespersonClientsDialog
                salespersonId={selectedSalesperson?.id}
                salespersonName={selectedSalesperson?.full_name || ''}
                open={clientsOpen}
                onOpenChange={setClientsOpen}
            />
        </div>
    );
}
