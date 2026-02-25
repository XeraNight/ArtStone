"use client";
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Lead } from '@/types/database';

interface KanbanColumnProps {
    status: string;
    label: string;
    color: string;
    leads: Lead[];
    onCardClick: (lead: Lead) => void;
}

const STATUS_CONFIG: Record<string, { borderColor: string; badgeColor: string }> = {
    new: { borderColor: 'border-l-blue-500', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    contacted: { borderColor: 'border-l-purple-500', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    offer: { borderColor: 'border-l-orange-500', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    won: { borderColor: 'border-l-emerald-500', badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30' },
    lost: { borderColor: 'border-l-red-500', badgeColor: 'bg-red-500/20 text-red-500 border-red-500/30' },
    waiting: { borderColor: 'border-l-yellow-500', badgeColor: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
};

export function KanbanColumn({ status, label, leads, onCardClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full bg-[#0a0a0a] border border-[#1f1f1f] shadow-sm">
            {/* Column Header */}
            <div className={`p-4 border-b border-[#1f1f1f] flex items-center justify-between border-l-4 ${config.borderColor} bg-zinc-900/50`}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                    {label}
                </h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${config.badgeColor}`}>
                    {leads.length}
                </span>
            </div>

            {/* Column Body / Drop Zone */}
            <div 
                ref={setNodeRef} 
                className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${isOver ? 'bg-primary/5' : 'bg-transparent'}`}
            >
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-zinc-600 border border-dashed border-zinc-800 rounded-sm">
                            <span className="material-symbols-outlined text-2xl mb-1">drag_indicator</span>
                            <span className="text-xs font-medium uppercase tracking-wider">Presuňte sem</span>
                        </div>
                    ) : (
                        leads.map((lead) => (
                            <KanbanCard
                                key={lead.id}
                                lead={lead}
                                onClick={() => onCardClick(lead)}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
