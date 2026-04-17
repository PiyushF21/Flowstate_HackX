import WorkerLayout from '../../components/worker/WorkerLayout'
import CopilotChat from '../../components/worker/CopilotChat'

export default function AssistantPage() {
  return (
    <WorkerLayout>
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <h1 className="text-lg font-bold font-display text-text-primary">🤖 AI Assistant</h1>
          <p className="text-[10px] text-text-muted">FIELD_COPILOT — Technical guidance for on-site work</p>
        </div>
        <CopilotChat className="flex-1" />
      </div>
    </WorkerLayout>
  )
}
