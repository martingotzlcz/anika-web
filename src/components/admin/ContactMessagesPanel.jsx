import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { CheckCheck, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactMessagesPanel() {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['contactMessages'],
    queryFn: () => base44.entities.ContactMessage.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContactMessage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contactMessages'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactMessage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contactMessages'] }),
  });

  const active = messages.filter(m => !m.archived);
  const archived = messages.filter(m => m.archived);

  if (isLoading) {
    return <div className="text-gray-500 text-sm">Načítám zprávy...</div>;
  }

  if (messages.length === 0) {
    return <div className="text-gray-400 text-sm py-8 text-center">Žádné zprávy.</div>;
  }

  const renderMessage = (msg) => (
    <div
      key={msg.id}
      className={`rounded-xl border p-5 transition-colors duration-300 ${
        msg.archived
          ? 'bg-gray-50 border-gray-100 opacity-60'
          : msg.read
          ? 'bg-white border-gray-100 shadow-sm'
          : 'bg-blue-50 border-blue-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-2 gap-4">
        <div className="flex items-start gap-2">
          {!msg.read && !msg.archived && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
          <div>
            <p className={`font-medium ${msg.archived ? 'text-gray-500' : 'text-[#1e3a5f]'}`}>{msg.name}</p>
            <a href={`mailto:${msg.email}`} className="text-sm text-[#c94a4a] hover:underline">{msg.email}</a>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="text-xs text-gray-400">
            {msg.sent_at ? format(new Date(msg.sent_at), 'd. M. yyyy HH:mm', { locale: cs }) : ''}
          </p>
          {!msg.archived && (
            <>
              {!msg.read && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => updateMutation.mutate({ id: msg.id, data: { read: true } })}
                >
                  <CheckCheck className="w-3 h-3" />
                  Přečteno
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 text-gray-500 hover:bg-gray-100"
                onClick={() => updateMutation.mutate({ id: msg.id, data: { archived: true, read: true } })}
              >
                <Archive className="w-3 h-3" />
                Archivovat
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 text-red-400 hover:bg-red-50 hover:border-red-300"
            onClick={() => { if (confirm('Opravdu smazat tuto zprávu?')) deleteMutation.mutate(msg.id); }}
          >
            <Trash2 className="w-3 h-3" />
            Smazat
          </Button>
        </div>
      </div>
      {msg.subject && (
        <p className="text-sm font-medium text-gray-700 mb-1 ml-4">Předmět: {msg.subject}</p>
      )}
      <p className="text-sm text-gray-600 whitespace-pre-line ml-4">{msg.message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Active messages */}
      <div className="space-y-3">
        {active.length === 0 && (
          <div className="text-gray-400 text-sm py-4 text-center">Žádné aktivní zprávy.</div>
        )}
        {active.map(renderMessage)}
      </div>

      {/* Archived */}
      {archived.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Archivované zprávy</p>
          <div className="space-y-3">
            {archived.map(renderMessage)}
          </div>
        </div>
      )}
    </div>
  );
}