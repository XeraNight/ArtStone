"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserCog, Key, ShieldAlert } from "lucide-react";
import { RoleBadge } from "@/components/shared/RoleBadge";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole | null;
  status?: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [resettingUser, setResettingUser] = useState<UserWithRole | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "", role: "sales" as UserRole });
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      setUsers(data as UserWithRole[]);
    } catch (err: any) {
      toast.error("Chyba pri načítaní používateľov: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error("Vyplňte všetky povinné údaje");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba pri vytváraní používateľa");

      toast.success("Používateľ bol vytvorený");
      setIsAddingUser(false);
      setNewUser({ email: "", password: "", full_name: "", role: "sales" });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          full_name: editingUser.full_name,
          role: editingUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba pri aktualizácii");
      
      toast.success("Používateľ bol aktualizovaný");
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingUser || !newPassword) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resettingUser.id,
          password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba pri resete hesla");

      toast.success("Heslo bolo úspešne zmenené");
      setResettingUser(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userToDelete: UserWithRole) => {
    if (!confirm(`Naozaj chcete vymazať používateľa ${userToDelete.full_name || userToDelete.email}? Táto akcia je nevratná.`)) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba pri mazaní");

      toast.success("Používateľ bol vymazaný");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isEditable = (targetUser: UserWithRole) => {
    if (currentUser?.role === 'správca') return true;
    if (currentUser?.role === 'admin') {
      // Admin cannot edit 'správca'
      return targetUser.role !== 'správca';
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Správa používateľov</h2>
          <p className="text-sm text-zinc-500 mt-1">Spravujte prístupy, role a údaje členov tímu.</p>
        </div>
        <Button onClick={() => setIsAddingUser(true)} className="w-full sm:w-auto">
          <Loader2 className={cn("mr-2 h-4 w-4 animate-spin hidden", isSaving && "block")} />
          Pridať používateľa
        </Button>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-6 py-4">Meno</TableHead>
              <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest py-4">Email</TableHead>
              <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest py-4">Rola</TableHead>
              <TableHead className="text-right text-zinc-500 font-bold uppercase text-[10px] tracking-widest pr-6 py-4">Akcie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-zinc-800 hover:bg-white/5 transition-colors group">
                <TableCell className="font-medium text-white pl-6">{u.full_name || "Nepomenovaný"}</TableCell>
                <TableCell className="text-zinc-400">{u.email}</TableCell>
                <TableCell>
                    <RoleBadge role={u.role} />
                </TableCell>
                <TableCell className="pr-6">
                  {isEditable(u) && (
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingUser({...u})}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Upraviť"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setResettingUser(u)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Zmeniť heslo"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteUser(u)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                        title="Vymazať"
                        disabled={u.id === currentUser?.id}
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tight">Pridať nového používateľa</DialogTitle>
            <DialogDescription className="text-zinc-500">Vytvorte prístup pre nového člena tímu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meno a priezvisko</label>
              <Input 
                value={newUser.full_name} 
                onChange={(e) => setNewUser(prev => ({...prev, full_name: e.target.value}))}
                className="bg-zinc-800 border-zinc-700"
                placeholder="napr. Ján Kováč"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email (Login)</label>
              <Input 
                type="email"
                value={newUser.email} 
                onChange={(e) => setNewUser(prev => ({...prev, email: e.target.value}))}
                className="bg-zinc-800 border-zinc-700"
                placeholder="jan.kovac@artstone.sk"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Počiatočné heslo</label>
              <Input 
                type="password"
                value={newUser.password} 
                onChange={(e) => setNewUser(prev => ({...prev, password: e.target.value}))}
                className="bg-zinc-800 border-zinc-700"
                placeholder="Minimálne 6 znakov"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Systémová rola</label>
              <Select 
                value={newUser.role} 
                onValueChange={(val: UserRole) => setNewUser(prev => ({...prev, role: val}))}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="sales">Obchodník (Sales)</SelectItem>
                  <SelectItem value="manager">Manažér</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {currentUser?.role === 'správca' && (
                    <SelectItem value="správca">Správca (Majiteľ)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddingUser(false)} className="text-zinc-400">Zrušiť</Button>
            <Button onClick={handleAddUser} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vytvoriť používateľa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tight">Upraviť používateľa</DialogTitle>
            <DialogDescription className="text-zinc-500">Zmeňte meno alebo rolu pre {editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meno a priezvisko</label>
              <Input 
                value={editingUser?.full_name || ""} 
                onChange={(e) => setEditingUser(prev => prev ? {...prev, full_name: e.target.value} : null)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Systémová rola</label>
              <Select 
                value={editingUser?.role || "sales"} 
                onValueChange={(val: UserRole) => setEditingUser(prev => prev ? {...prev, role: val} : null)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="sales">Obchodník (Sales)</SelectItem>
                  <SelectItem value="manager">Manažér</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {currentUser?.role === 'správca' && (
                    <SelectItem value="správca">Správca (Majiteľ)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingUser(null)} className="text-zinc-400">Zrušiť</Button>
            <Button onClick={handleUpdateUser} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Uložiť zmeny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resettingUser} onOpenChange={(open) => !open && setResettingUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tight text-amber-500 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset hesla
            </DialogTitle>
            <DialogDescription className="text-zinc-400">Nastavte nové heslo pre {resettingUser?.email}.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nové heslo</label>
              <Input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                placeholder="Zadajte aspoň 6 znakov"
              />
            </div>
            <p className="mt-4 text-[10px] text-zinc-500 italic">Poznámka: Táto akcia okamžite zmení heslo používateľa pomocou systémových právomocí.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResettingUser(null)} className="text-zinc-400">Zrušiť</Button>
            <Button onClick={handleResetPassword} disabled={isSaving || newPassword.length < 6} className="bg-amber-600 hover:bg-amber-700">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Potvrdiť reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
