'use client';

import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, History, RotateCcw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AiPlan } from '@/lib/ai-cms/types';

type Preview = { requestId: string; plan: AiPlan };
type HistoryItem = {
  id: string;
  created_at: string;
  instruction: string;
  summary: string;
  status: 'pending' | 'applying' | 'applied' | 'failed' | 'rolled_back';
  applied_at?: string | null;
  rolled_back_at?: string | null;
  error?: string | null;
};

const examples = [
  'Set the stock of product SKU MEK-001 to 12',
  'Change the homepage hero title to “Professional Phone Repair Tools & Screens”',
  'Create and publish a blog post about choosing replacement screens',
  'Add an FAQ explaining nationwide delivery',
];

async function api(body?: Record<string, string>) {
  const response = await fetch('/api/ai-cms', body ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  } : undefined);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

export default function AiAssistantPage() {
  const [instruction, setInstruction] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadHistory = async () => {
    try {
      const result = await api();
      setHistory(result.history || []);
    } catch {
      // The primary actions surface useful errors; history is supplementary.
    }
  };

  useEffect(() => {
    let active = true;
    fetch('/api/ai-cms')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('History unavailable')))
      .then(result => { if (active) setHistory(result.history || []); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const generatePreview = async () => {
    if (instruction.trim().length < 3) return toast.error('Describe the change you want');
    setLoading(true);
    setPreview(null);
    try {
      const result = await api({ operation: 'plan', instruction: instruction.trim() });
      setPreview(result);
      await loadHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create preview');
    } finally {
      setLoading(false);
    }
  };

  const applyPreview = async () => {
    if (!preview) return;
    setApplying(true);
    try {
      await api({ operation: 'apply', requestId: preview.requestId });
      toast.success('CMS changes applied');
      setPreview(null);
      setInstruction('');
      await loadHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not apply changes');
    } finally {
      setApplying(false);
    }
  };

  const rollback = async (requestId: string) => {
    if (!window.confirm('Roll back this AI change?')) return;
    try {
      await api({ operation: 'rollback', requestId });
      toast.success('Change rolled back');
      await loadHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not roll back change');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700"><Sparkles className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI CMS Assistant</h1>
            <p className="text-gray-500 mt-1">Describe a change, inspect the preview, then approve it.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
        <p className="text-sm text-green-900">The assistant has full CMS control, including creating, editing and deleting content. It cannot access accounts, customers, orders, secrets, infrastructure or raw SQL, and nothing is applied without your confirmation.</p>
      </div>

      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 md:p-6 space-y-4">
        <Textarea
          label="What should change?"
          value={instruction}
          onChange={event => setInstruction(event.target.value)}
          placeholder="Example: Change the homepage hero title to Professional Phone Repair Tools & Screens"
          rows={5}
          maxLength={2000}
        />
        <div className="flex flex-wrap gap-2">
          {examples.map(example => (
            <button key={example} type="button" onClick={() => setInstruction(example)} className="text-left text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
              {example}
            </button>
          ))}
        </div>
        <Button onClick={generatePreview} loading={loading} disabled={applying}>
          <Bot className="w-4 h-4 mr-2" /> Generate safe preview
        </Button>
      </section>

      {preview && (
        <section className="bg-white border-2 border-violet-200 shadow-sm rounded-2xl p-5 md:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Preview — not applied</p>
              <h2 className="text-lg font-bold text-gray-900 mt-1">{preview.plan.summary}</h2>
              {preview.plan.answer && <p className="text-gray-600 mt-2 whitespace-pre-wrap">{preview.plan.answer}</p>}
            </div>
            <Badge variant="warning">Awaiting approval</Badge>
          </div>

          {preview.plan.warnings.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-4 space-y-2">
              {preview.plan.warnings.map(warning => <p key={warning} className="text-sm text-amber-900 flex gap-2"><TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />{warning}</p>)}
            </div>
          )}

          {preview.plan.actions.length > 0 ? (
            <div className="space-y-3">
              {preview.plan.actions.map((action, index) => (
                <div key={`${action.operation}-${action.resource}-${index}`} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant={action.operation === 'delete' ? 'danger' : 'info'}>{action.operation} {action.resource.replaceAll('_', ' ')}</Badge>
                    <span className="font-semibold text-gray-900">{action.targetLabel}</span>
                  </div>
                  <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(action.changes).map(([field, value]) => (
                      <div key={field} className="bg-gray-50 rounded-lg px-3 py-2">
                        <dt className="text-xs text-gray-500">{field.replaceAll('_', ' ')}</dt>
                        <dd className="font-medium text-gray-900 break-words">{value === null ? 'Empty' : String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={applyPreview} loading={applying}><CheckCircle2 className="w-4 h-4 mr-2" /> Approve and apply</Button>
                <Button variant="ghost" onClick={() => setPreview(null)} disabled={applying}>Discard preview</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No CMS changes are proposed. Nothing can be applied.</p>
          )}
        </section>
      )}

      <section className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2"><History className="w-5 h-5 text-gray-500" /><h2 className="font-bold text-gray-900">Recent requests</h2></div>
        <div className="divide-y divide-gray-100">
          {history.length === 0 ? <p className="p-5 text-sm text-gray-500">No AI requests yet.</p> : history.map(item => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.instruction}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(item.created_at).toLocaleString()} · {item.status.replace('_', ' ')}</p>
                {item.error && <p className="text-xs text-red-600 mt-1">{item.error}</p>}
              </div>
              {item.status === 'applied' && <Button size="sm" variant="ghost" onClick={() => rollback(item.id)}><RotateCcw className="w-4 h-4 mr-2" />Rollback</Button>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
