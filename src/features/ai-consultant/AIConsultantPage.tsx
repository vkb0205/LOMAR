import { useAuth } from '../auth/hooks/useAuth';
import { ChatPanel } from './components/ChatPanel';
import { SidePanel } from './components/SidePanel';
import { useAIConsultantChat } from './hooks/useAIConsultantChat';

export default function AIConsultant() {
  const { user } = useAuth();
  const {
    input,
    isTyping,
    messages,
    messagesEndRef,
    retrievedServices,
    setInput,
    submitMessage,
    suggestedService,
  } = useAIConsultantChat(user);

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row h-auto md:h-[calc(100vh-6rem)] p-4 md:p-6 gap-6 md:max-h-[900px]">
      <ChatPanel
        input={input}
        isTyping={isTyping}
        messages={messages}
        messagesEndRef={messagesEndRef}
        retrievedServices={retrievedServices}
        onInputChange={setInput}
        onSubmit={submitMessage}
      />
      <SidePanel suggestedService={suggestedService} onSelectHint={setInput} />
    </div>
  );
}
