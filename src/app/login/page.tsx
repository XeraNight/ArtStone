import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthTabs } from './components/AuthTabs';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {

    const { message } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-stone">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
                        <span className="text-2xl font-bold text-primary-foreground">AS</span>
                    </div>
                    <h1 className="font-display text-3xl font-semibold text-foreground">ArtStone</h1>
                    <p className="text-muted-foreground mt-2">Interný CRM systém</p>
                </div>

                <Card className="shadow-soft border-border/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="font-display text-xl">Prihlásenie / Registrácia</CardTitle>
                        <CardDescription>Zadajte svoje prihlasovacie údaje alebo vytvorte nový účet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AuthTabs message={message} />
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    © 2026 ArtStone. Všetky práva vyhradené.
                </p>
            </div>
        </div>
    );
}
