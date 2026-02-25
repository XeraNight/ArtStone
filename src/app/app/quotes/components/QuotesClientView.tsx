'use client';

import { useState, useMemo, useEffect } from 'react';
import { CreateQuoteDialog } from '@/components/quotes/CreateQuoteDialog';
import { QuoteDetailDialog } from '@/components/quotes/QuoteDetailDialog';
import { DeleteQuoteDialog } from '@/components/quotes/DeleteQuoteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Download, FileText, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuotes, useUpdateQuoteStatus, useDeleteQuote } from '@/hooks/useQuotes';
import { useCreateInvoiceFromQuote } from '@/hooks/useInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { generateQuotePDF } from '@/utils/pdfGenerator';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { QuoteStatus, Quote } from '@/types/database';

const statusLabels: Record<QuoteStatus, string> = {
  draft: 'Návrh',
  sent: 'Odoslaná',
  accepted: 'Prijatá',
  rejected: 'Zamietnutá',
};

const statusVariants: Record<QuoteStatus, 'secondary' | 'info' | 'success' | 'destructive'> = {
  draft: 'secondary',
  sent: 'info',
  accepted: 'success',
  rejected: 'destructive',
};

export function QuotesClientView() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewQuoteId, setViewQuoteId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [createQuoteOpen, setCreateQuoteOpen] = useState(false);
  const [deleteQuote, setDeleteQuote] = useState<{ id: string; number: string } | null>(null);

  const { data: quotes, isLoading, isError, error } = useQuotes();
  const updateStatus = useUpdateQuoteStatus();
  const createInvoice = useCreateInvoiceFromQuote();
  const deleteQuoteMutation = useDeleteQuote();

  const isAdmin = true; // Temporary mock
  const isManager = true; // Temporary mock

  useEffect(() => {
    if (isError) {
      console.error('Error loading quotes:', error);
      toast.error('Nepodarilo sa načítať cenové ponuky');
    }
  }, [isError, error]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const filteredQuotes = useMemo(() => {
    if (!quotes) return [];
    return quotes.filter(quote => {
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        return (
          quote.quote_number.toLowerCase().includes(s) ||
          (quote.client?.contact_name || '').toLowerCase().includes(s) ||
          (quote.client?.company_name || '').toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [quotes, statusFilter, debouncedSearch]);

  const totalValue = filteredQuotes?.reduce((acc, q) => acc + q.total, 0) || 0;
  const acceptedValue = filteredQuotes?.filter((q) => q.status === 'accepted').reduce((acc, q) => acc + q.total, 0) || 0;
  const successRate = filteredQuotes?.length ? Math.round((filteredQuotes.filter((q) => q.status === 'accepted').length / filteredQuotes.length) * 100) : 0;

  const handleStatusChange = async (quoteId: string, newStatus: QuoteStatus) => {
    try {
      await updateStatus.mutateAsync({ quoteId, status: newStatus });
      toast.success('Status ponuky aktualizovaný');
    } catch (error) {
      toast.error('Nepodarilo sa aktualizovať status');
    }
  };

  const handleCreateInvoice = async (quoteId: string) => {
    try {
      await createInvoice.mutateAsync(quoteId);
      toast.success('Faktúra vytvorená');
    } catch (error) {
      toast.error('Nepodarilo sa vytvoriť faktúru');
    }
  };

  const handleDownloadPdf = async (quote: any) => {
    try {
      const supabase = createClient();
      const { data: fullQuote, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(id, contact_name, company_name, email, phone, address),
          items:quote_items(*)
        `)
        .eq('id', quote.id)
        .single();

      if (error) throw error;

      if (fullQuote) {
        generateQuotePDF(fullQuote as unknown as import('@/types/database').Quote);
        toast.success('PDF vygenerované');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Nepodarilo sa vygenerovať PDF');
    }
  };

  const handleDeleteQuote = async () => {
    if (!deleteQuote) return;

    try {
      await deleteQuoteMutation.mutateAsync(deleteQuote.id);
      toast.success('Cenová ponuka vymazaná');
      setDeleteQuote(null);
    } catch (error: any) {
      console.error('Delete quote error:', error);
      const errorMessage = error?.message || 'Nepodarilo sa vymazať ponuku';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa čísla, klienta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky statusy</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateQuoteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nová ponuka
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Celkom ponúk</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-semibold">{filteredQuotes?.length || 0}</p>
                )}
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Celková hodnota</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Prijaté ponuky</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-success">{formatCurrency(acceptedValue)}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Úspešnosť</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold">{successRate}%</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Číslo</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Suma</TableHead>
                <TableHead>Platnosť do</TableHead>
                <TableHead>Vytvoril</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive">
                    Nepodarilo sa načítať dáta. Skúste obnoviť stránku.
                  </TableCell>
                </TableRow>
              ) : filteredQuotes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={<FileText className="h-full w-full" />}
                      title={searchQuery ? "Nenašli sa žiadne výsledky" : "Zatiaľ žiadne cenové ponuky"}
                      description={
                        searchQuery
                          ? `Pre výraz "${searchQuery}" sme nenašli žiadnu zhodu.`
                          : "Vytvorte cenovú ponuku pre klienta a začnite predávať."
                      }
                      action={{
                        label: "Vytvoriť ponuku",
                        onClick: () => setCreateQuoteOpen(true),
                        icon: <Plus className="h-4 w-4" />,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes?.map((quote) => (
                  <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <span className="font-medium text-foreground">{quote.quote_number}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{quote.client?.contact_name || '-'}</p>
                        {quote.client?.company_name && (
                          <p className="text-sm text-muted-foreground">{quote.client.company_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[quote.status]}>
                        {statusLabels[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(quote.total)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('sk-SK') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {quote.created_by_user?.full_name || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setViewQuoteId(quote.id);
                            setViewOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Zobraziť
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(quote)}>
                            <Download className="h-4 w-4 mr-2" />
                            Stiahnuť PDF
                          </DropdownMenuItem>
                          {quote.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'sent')}>
                              Odoslať klientovi
                            </DropdownMenuItem>
                          )}
                          {quote.status === 'sent' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'accepted')}>
                                Označiť ako prijatú
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'rejected')}>
                                Označiť ako zamietnutú
                              </DropdownMenuItem>
                            </>
                          )}
                          {quote.status === 'accepted' && (isAdmin || isManager) && (
                            <DropdownMenuItem onClick={() => handleCreateInvoice(quote.id)}>
                              Vytvoriť faktúru
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Duplikovať</DropdownMenuItem>
                          {(isAdmin || isManager) && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteQuote({ id: quote.id, number: quote.quote_number })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Vymazať
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateQuoteDialog
        open={createQuoteOpen}
        onOpenChange={setCreateQuoteOpen}
      />

      <QuoteDetailDialog
        quoteId={viewQuoteId}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      <DeleteQuoteDialog
        open={!!deleteQuote}
        onOpenChange={(open) => !open && setDeleteQuote(null)}
        quoteNumber={deleteQuote?.number || ''}
        onConfirm={handleDeleteQuote}
        isDeleting={deleteQuoteMutation.isPending}
      />
    </>
  );
}
