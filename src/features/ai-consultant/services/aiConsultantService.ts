import { resolveBackendEndpoint } from '../../../shared/api/backendConfig';
import { postJson } from '../../../shared/api/backendClient';
import { ConsultResponse } from '../types';

const CONSULT_FALLBACK_MESSAGE =
  'Mình xin lỗi, hiện tại chưa thể trả lời câu hỏi của bạn. Vui lòng thử lại sau hoặc duyệt danh mục dịch vụ của Phố Hạnh Phúc nhé!';

export async function requestConsultReply(message: string): Promise<string> {
  const response = await postJson<ConsultResponse>(resolveBackendEndpoint('/consult'), {
    body: { message },
  });

  if (!response.ok) {
    console.error('Consult endpoint returned non-OK status', response.status);
    return CONSULT_FALLBACK_MESSAGE;
  }

  return response.parsedBody?.reply?.trim() || CONSULT_FALLBACK_MESSAGE;
}

export const CONSULT_NETWORK_FALLBACK_MESSAGE =
  'Mình xin lỗi, hiện tại chưa thể kết nối tới trợ lý AI. Vui lòng thử lại sau hoặc duyệt danh mục dịch vụ của Phố Hạnh Phúc nhé!';
