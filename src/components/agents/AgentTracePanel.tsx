'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronRight, Download } from 'lucide-react'

interface AgentTrace {
  id: string
  agentId: string
  agentName: string
  timestamp: string
  inputSummary: string | null
  decision: string | null
  rationale: string | null
  outputSummary: string | null
  confidenceScore: number | null
  processingTimeMs: number | null
}

const agentColors: Record<string, string> = {
  agent_1: 'bg-blue-100 border-blue-300 text-blue-800',
  agent_2: 'bg-green-100 border-green-300 text-green-800',
  agent_3: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  agent_4: 'bg-purple-100 border-purple-300 text-purple-800',
  agent_5: 'bg-pink-100 border-pink-300 text-pink-800',
  agent_6: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  agent_7: 'bg-red-100 border-red-300 text-red-800',
}

export function AgentTracePanel({ traces }: { traces: AgentTrace[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set())

  const toggleTrace = (id: string) => {
    setExpandedTraces((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const exportLogs = () => {
    const text = traces
      .map(
        (t) =>
          `[${t.agentName}] ${t.timestamp}\nInput: ${t.inputSummary}\nDecision: ${t.decision}\nRationale: ${t.rationale}\nOutput: ${t.outputSummary}\nConfidence: ${t.confidenceScore}%\nTime: ${t.processingTimeMs}ms\n`
      )
      .join('\n---\n\n')

    navigator.clipboard.writeText(text)
    alert('Logs copied to clipboard!')
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-30 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800"
        aria-label="Agent Traces"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Agent Traces</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportLogs}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Export Logs"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {traces.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No agent traces yet</p>
              ) : (
                traces.map((trace) => {
                  const isExpanded = expandedTraces.has(trace.id)
                  const colorClass = agentColors[trace.agentId] || 'bg-gray-100 border-gray-300 text-gray-800'

                  return (
                    <div key={trace.id} className={`border rounded-lg ${colorClass}`}>
                      <button
                        onClick={() => toggleTrace(trace.id)}
                        className="w-full p-3 flex justify-between items-center text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{trace.agentName}</p>
                          <p className="text-xs opacity-75">{new Date(trace.timestamp).toLocaleTimeString()}</p>
                        </div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2 text-sm border-t border-current/20 pt-2">
                          {trace.inputSummary && (
                            <div>
                              <p className="font-medium text-xs uppercase opacity-75">Input</p>
                              <p>{trace.inputSummary}</p>
                            </div>
                          )}
                          {trace.decision && (
                            <div>
                              <p className="font-medium text-xs uppercase opacity-75">Decision</p>
                              <p>{trace.decision}</p>
                            </div>
                          )}
                          {trace.rationale && (
                            <div>
                              <p className="font-medium text-xs uppercase opacity-75">Rationale</p>
                              <p>{trace.rationale}</p>
                            </div>
                          )}
                          {trace.outputSummary && (
                            <div>
                              <p className="font-medium text-xs uppercase opacity-75">Output</p>
                              <p>{trace.outputSummary}</p>
                            </div>
                          )}
                          <div className="flex gap-4 text-xs">
                            {trace.confidenceScore != null && (
                              <span>Confidence: {trace.confidenceScore}%</span>
                            )}
                            {trace.processingTimeMs != null && (
                              <span>Time: {trace.processingTimeMs}ms</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
