"use client";
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Lead } from '@/types/database';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
    status: string;
    label: string;
    color: string;
    leads: Lead[];
    onCardClick: (lead: Lead) => void;
}

const colorMap: Record<string, string> = {
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-500',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-500',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-500',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500',
    red: 'border-red-500/20 bg-red-500/5 text-red-500',
    zinc: 'border-zinc-500/20 bg-zinc-500/5 text-zinc-500',
};

const dotMap: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    zinc: 'bg-zinc-500',
};

export function KanbanColumn({ status, label, color, leads, onCardClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full group/column">
            <div className={cn(
                "mb-3 px-4 py-3 rounded-xl border flex items-center justify-between transition-all duration-300",
                colorMap[color] || colorMap.zinc,
                isOver && "ring-2 ring-primary ring-offset-2 ring-offset-[#0a0a0a] scale-[1.02]"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(255,102,0,0.5)]", dotMap[color] || dotMap.zinc)}></div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</h3>
                </div>
                <span className="text-[10px] font-mono opacity-60">({leads.length})</span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 overflow-y-auto space-y-3 p-2 rounded-2xl transition-colors duration-300 custom-scrollbar pb-10",
                    isOver ? "bg-primary/5 border-2 border-dashed border-primary/20" : "bg-transparent"
                )}
            >
                <SortableContext
                    items={leads.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {leads.map((lead) => (
                        <KanbanCard 
                            key={lead.id} 
                            lead={lead} 
                            onClick={() => onCardClick(lead)} 
                        />
                    ))}
                    {leads.length === 0 && !isOver && (
                        <div className="h-20 border-2 border-dashed border-zinc-900 rounded-xl flex items-center justify-center opacity-40 group-hover/column:opacity-100 transition-opacity">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Prázdne</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
