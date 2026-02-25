"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead } from '@/types/database';

interface KanbanCardProps {
    lead: Lead;
    onClick: () => void;
}

export function KanbanCard({ lead, onClick }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        disabled: false,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-zinc-900 border border-zinc-800 p-4 shadow-sm group hover:border-zinc-600 transition-colors cursor-grab active:cursor-grabbing relative overflow-hidden ${isDragging ? 'opacity-50 ring-2 ring-primary scale-105 z-50' : ''}`}
        >
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 rounded-bl-lg" onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <span className="material-symbols-outlined text-sm text-zinc-400 hover:text-white cursor-pointer">open_in_new</span>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white line-clamp-1">{lead.contact_name}</span>
                        {lead.company_name && (
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider line-clamp-1 mt-0.5">{lead.company_name}</span>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    {lead.email && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400 group/contact">
                            <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover/contact:text-primary transition-colors">mail</span>
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400 group/contact">
                            <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover/contact:text-primary transition-colors">call</span>
                            <span>{lead.phone}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-1">
                    <div className="flex items-center gap-2">
                        {/* Avatar placeholder */}
                        <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-400 uppercase">
                            {lead.contact_name.substring(0,2)}
                        </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{new Date(lead.created_at).toLocaleDateString('sk-SK')}</span>
                </div>
                
                {/* Drag handle hint for absolute clarity, hidden mostly but visible on hover */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 h-full flex items-center opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-white text-sm">drag_indicator</span>
                </div>
            </div>
        </div>
    );
}
