export type AgentStatus = 'ready' | 'running' | 'completed' | 'approval_required';

export interface BIMetric { label: string; value: string; change: string; positive: boolean }
export interface BITrendPoint { label: string; value: number }
export interface BICategory { name: string; amount: string; share: string }
export interface BIAgent { id: string; name: string; detail: string; status: AgentStatus; lastRun: string; finding: string }
export interface BIActivity { id: string; title: string; detail: string; occurredAt: string; kind: 'agent' | 'report' | 'action' | 'system' }
export interface BIRecommendation { id: string; title: string; detail: string; impact: string; actionLabel: string }
export interface BIReport { id: string; title: string; period: string; status: 'ready' | 'generating'; summary: string; createdAt: string }
export interface BIOverview { metrics: BIMetric[]; trend: BITrendPoint[]; categories: BICategory[]; agents: BIAgent[]; activities: BIActivity[]; recommendations: BIRecommendation[]; reports: BIReport[] }
export interface BIChatResponse { reply: string; activityIds: string[]; recommendationIds: string[] }
