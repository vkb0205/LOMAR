import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, Bot, Download, Play, RefreshCw, Send, Sparkles, Users } from 'lucide-react';
import { BackendError } from '../../shared/api/backendClient';
import { ROUTES } from '../../shared/config/routes';
import { chatWithBI, createBIReport, getBIOverview, previewBIAction, runBIAgent } from './service';
import type { BIOverview, BIAgent } from './types';

const icons = [Activity, Users, Sparkles, Bot];

export default function BusinessIntelligence() {
  const [data, setData] = useState<BIOverview | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Ask me about past activities, reports, campaigns, or your next growth opportunity.' },
  ]);

  const load = async () => {
    setError('');
    try { setData(await getBIOverview()); } catch (cause) { setError(cause instanceof BackendError ? cause.message : 'Business intelligence data is unavailable.'); }
  };
  useEffect(() => { void load(); }, []);

  const runAgent = async (agent: BIAgent) => {
    setRunning(agent.id);
    setNotice('');
    try {
      const result = await runBIAgent(agent.id);
      setData(current => current ? { ...current, agents: current.agents.map(item => item.id === agent.id ? result.agent : item), activities: [result.activity, ...current.activities] } : current);
      setNotice(`${agent.name} completed a new analysis.`);
    } catch (cause) {
      setNotice(cause instanceof BackendError ? cause.message : 'The agent could not complete its analysis.');
    } finally { setRunning(null); }
  };

  const generateReport = async () => {
    setNotice('');
    try {
      const result = await createBIReport('Last 7 days');
      setData(current => current ? { ...current, reports: [result.report, ...current.reports], activities: [result.activity, ...current.activities] } : current);
      setNotice(`Report generated: ${result.report.title}.`);
    } catch (cause) {
      setNotice(cause instanceof BackendError ? cause.message : 'The report could not be generated.');
    }
  };

  const previewAction = async (recommendationId: string) => {
    setNotice('');
    try {
      const result = await previewBIAction(recommendationId);
      setNotice(result.message);
    } catch (cause) {
      setNotice(cause instanceof BackendError ? cause.message : 'The action preview is unavailable.');
    }
  };

  const submitChat = async (event: FormEvent) => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next); setPrompt('');
    try { const result = await chatWithBI(text, next); setMessages([...next, { role: 'assistant', content: result.reply }]); }
    catch { setMessages([...next, { role: 'assistant', content: 'I could not retrieve that insight right now.' }]); }
  };

  const maxTrend = useMemo(() => Math.max(...(data?.trend.map(point => point.value) ?? [1])), [data]);
  if (!data && !error) return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-sm text-slate-500">Loading business intelligence...</div>;
  if (error || !data) return <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#f7f8fa] px-6 text-center text-sm text-slate-600"><p>{error}</p>{error.toLowerCase().includes('authentication') || error.toLowerCase().includes('unauthenticated') ? <Link to={`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.businessIntelligence)}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Sign in to view BI</Link> : <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"><RefreshCw className="h-4 w-4" /> Retry</button>}</div>;

  return <div className="min-h-[70vh] bg-[#f7f8fa] px-4 py-8 text-slate-900 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1440px]">
    <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Business Intelligence</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Your business, in focus</h1><p className="mt-2 text-sm text-slate-500">Traditional reporting and AI analysis working side by side.</p></div><div className="flex gap-3"><button onClick={() => void generateReport()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><Download className="h-4 w-4" /> Generate report</button><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" /> Refresh data</button></div></header>
    {notice && <div role="status" className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">{notice}</div>}
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric, index) => { const Icon = icons[index % icons.length]; return <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{metric.label}</p><Icon className="h-4 w-4 text-orange-600" /></div><p className="mt-4 text-2xl font-bold">{metric.value}</p><p className={`mt-2 text-xs font-semibold ${metric.positive ? 'text-emerald-600' : 'text-rose-600'}`}>{metric.change} vs. previous period</p></div>; })}</section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Revenue overview</h2><p className="mt-1 text-xs text-slate-500">Gross merchandise value over time</p><div className="mt-6 flex h-56 items-end gap-2 border-b border-l border-slate-200 px-3">{data.trend.map(point => <div key={point.label} className="group flex h-full flex-1 items-end"><div className="w-full rounded-t bg-orange-500/80" style={{ height: `${(point.value / maxTrend) * 100}%` }} title={`${point.label}: ${point.value}`} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] text-slate-400">{data.trend.map(point => <span key={point.label}>{point.label}</span>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Top categories</h2><p className="mt-1 text-xs text-slate-500">Revenue contribution</p><div className="mt-6 space-y-5">{data.categories.map(category => <div key={category.name}><div className="mb-2 flex justify-between text-sm"><span>{category.name}</span><b>{category.amount} <small className="ml-2 font-normal text-slate-400">{category.share}</small></b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-orange-500" style={{ width: category.share }} /></div></div>)}</div></section></div>
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-orange-600" /><h2 className="font-bold">AI agents</h2></div><p className="mt-1 text-xs text-slate-500">Automated analysis running alongside your dashboard</p><div className="mt-5 grid gap-3 lg:grid-cols-4">{data.agents.map(agent => <div key={agent.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="flex justify-between"><span className="text-xs font-bold uppercase text-orange-700">{agent.status.replace('_', ' ')}</span><button onClick={() => void runAgent(agent)} disabled={running === agent.id} aria-label={`Run ${agent.name}`} className="text-slate-600 disabled:opacity-50">{running === agent.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}</button></div><h3 className="mt-4 text-sm font-bold">{agent.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{agent.detail}</p><p className="mt-3 text-[11px] text-slate-400">{agent.lastRun}</p></div>)}</div></section>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]"><section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5"><h2 className="font-bold">Recommendations</h2><div className="mt-4 space-y-4">{data.recommendations.map(item => <div key={item.id} className="border-b border-orange-100 pb-4 last:border-0"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p><button onClick={() => void previewAction(item.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-700">{item.actionLabel}<ArrowUpRight className="h-3.5 w-3.5" /></button></div>)}</div></section><section className="flex min-h-[360px] flex-col rounded-2xl border border-slate-200 bg-white p-5"><div><h2 className="font-bold">BI copilot</h2><p className="mt-1 text-xs text-slate-500">Ask about activity history, reports, or next actions.</p></div><div className="mt-4 flex-1 space-y-3 overflow-auto">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-xl p-3 text-sm ${message.role === 'user' ? 'ml-auto bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>{message.content}</div>)}</div><form onSubmit={submitChat} className="mt-4 flex gap-2"><input value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Ask your copilot..." className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400" /><button aria-label="Send message" className="rounded-lg bg-orange-500 p-2.5 text-white"><Send className="h-4 w-4" /></button></form></section></div>
  </div></div>;
}
