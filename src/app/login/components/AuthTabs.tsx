"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, UserPlus } from 'lucide-react'
import { login, signup } from '../actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthTabs({ message }: { message?: string }) {
    return (
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Prihlásenie</TabsTrigger>
                <TabsTrigger value="register">Registrácia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
                {message && <div className="text-sm font-medium text-destructive mb-4 text-center">{message}</div>}
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="vas@email.sk"
                            required
                            className="bg-background"
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="login-password">Heslo</Label>
                        <Input
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="bg-background"
                            autoComplete="current-password"
                        />
                    </div>
                    <Button formAction={login} className="w-full">
                        <LogIn className="h-4 w-4 mr-2" />
                        Prihlásiť sa
                    </Button>
                </form>
            </TabsContent>
            
            <TabsContent value="register">
                {message && <div className="text-sm font-medium text-destructive mb-4 text-center">{message}</div>}
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="register-name">Meno a Priezvisko</Label>
                        <Input
                            id="register-name"
                            name="fullName"
                            placeholder="Ján Novák"
                            required
                            className="bg-background"
                            autoComplete="name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="vas@email.sk"
                            required
                            className="bg-background"
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-password">Heslo</Label>
                        <Input
                            id="register-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="bg-background"
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rola</Label>
                        <Select name="role" defaultValue="sales" required>
                            <SelectTrigger className="bg-background w-full">
                                <SelectValue placeholder="Vyberte rolu" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manager">Manažér</SelectItem>
                                <SelectItem value="sales">Obchodník</SelectItem>
                                <SelectItem value="client">Klient</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button formAction={signup} className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Zaregistrovať sa
                    </Button>
                </form>
            </TabsContent>
        </Tabs>
    )
}
