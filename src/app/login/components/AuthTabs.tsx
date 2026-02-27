"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'

export function AuthTabs({ message: initialMessage }: { message?: string }) {
    const router = useRouter()
    const { login, signup } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [localMessage, setLocalMessage] = useState(initialMessage)
    
    const displayMessage = localMessage || initialMessage

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setLocalMessage("")
        
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        
        const result = await login(email, password)
        if (result.error) {
            setLocalMessage(result.error)
            setIsLoading(false)
        } else {
            router.push('/app/dashboard')
        }
    }

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setLocalMessage("")
        
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const role = formData.get('role') as any
        
        const result = await signup(email, password, fullName, role)
        if (result.error) {
            setLocalMessage(result.error)
            setIsLoading(false)
        } else if (!result.session) {
            setLocalMessage("Registrácia úspešná! Skontrolujte si email na potvrdenie účtu.")
            setIsLoading(false)
        } else {
            router.push('/app/dashboard')
        }
    }

    return (
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Prihlásenie</TabsTrigger>
                <TabsTrigger value="register">Registrácia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
                {displayMessage && <div className="text-sm font-medium text-destructive mb-4 text-center">{displayMessage}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                        Prihlásiť sa
                    </Button>
                </form>
            </TabsContent>
            
            <TabsContent value="register">
                {displayMessage && <div className="text-sm font-medium text-destructive mb-4 text-center">{displayMessage}</div>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="register-name">Meno a Priezvisko</Label>
                        <Input
                            id="register-name"
                            name="fullName"
                            placeholder="Ján Novák"
                            required
                            className="bg-background"
                            autoComplete="name"
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rola</Label>
                        <Select name="role" defaultValue="sales" required disabled={isLoading}>
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        Zaregistrovať sa
                    </Button>
                </form>
            </TabsContent>
        </Tabs>
    )
}
