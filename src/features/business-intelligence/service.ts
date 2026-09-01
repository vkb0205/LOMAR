import { getJson, postJsonTyped } from '../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../shared/api/backendConfig';
import type { BIChatResponse, BIOverview, BIAgent, BIActivity, BIReport, BIRecommendation } from './types';

const endpoint = (path: string) => resolveDataEndpoint(`/api/v1/business-intelligence${path}` as `/api/v1/${string}`);
export const getBIOverview = () => getJson<BIOverview>(endpoint('/overview'));
export const runBIAgent = (agentId: string) => postJsonTyped<{ agent: BIAgent; activity: BIActivity }>(endpoint('/agents/run'), { body: { agentId } });
export const createBIReport = (period: string) => postJsonTyped<{ report: BIReport; activity: BIActivity }>(endpoint('/reports'), { body: { period } });
export const previewBIAction = (recommendationId: string) => postJsonTyped<{ recommendation: BIRecommendation; status: string; message: string }>(endpoint('/actions/preview'), { body: { recommendationId } });
export const chatWithBI = (message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>) => postJsonTyped<BIChatResponse>(endpoint('/chat'), { body: { message, history } });
