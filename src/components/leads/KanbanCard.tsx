"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/database';
import { Mail, Phone, Calendar, ExternalLink, User } from 'lucide-react';

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
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
            className={cn(
                "group relative bg-[#0d0d0d] border border-zinc-800/50 p-4 rounded-xl shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-primary/5",
                isDragging ? "opacity-30 ring-2 ring-primary scale-95 z-50 pointer-events-none" : "hover:-translate-y-1"
            )}
        >
            {/* Priority Indicator */}
            <div className={cn(
                "absolute top-0 left-4 w-8 h-1 rounded-b-full opacity-60 transition-opacity group-hover:opacity-100",
                lead.priority === 'high' ? "bg-red-500 shadow-[0_2px_10px_rgba(239,68,68,0.5)]" :
                lead.priority === 'medium' ? "bg-orange-500" :
                lead.priority === 'low' ? "bg-blue-500" :
                "bg-zinc-800"
            )} />

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start pt-1">
                    <div className="flex flex-col gap-0.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {lead.contact_name}
                        </h4>
                        {lead.company_name && (
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider line-clamp-1">
                                {lead.company_name}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className="h-6 w-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ExternalLink className="h-3 w-3" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    {lead.email && (
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 group/item">
                            <Mail className="h-3 w-3 text-zinc-700 group-hover/item:text-primary transition-colors hover:cursor-pointer" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 group/item">
                            <Phone className="h-3 w-3 text-zinc-700 group-hover/item:text-primary transition-colors" />
                            <span>{lead.phone}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-900/50 mt-1">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] font-bold text-primary italic uppercase overflow-hidden">
                           {lead.salesperson_id ? <User className="h-2.5 w-2.5" /> : lead.contact_name[0]}
                        </div>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                            {new Date(lead.created_at).toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-2.5 w-2.5 text-zinc-700" />
                        <span className="text-[8px] text-zinc-700 font-mono">
                            {new Date(lead.created_at).getHours()}:00
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
