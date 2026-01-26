type CurrentStep = 'speech' | 'instrument' | 'complete'

interface ProgressStepsProps {
  currentStep: CurrentStep
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { id: 'speech', label: 'Converting text to speech', icon: '🎤' },
    { id: 'instrument', label: 'Transforming to haunting instrumental', icon: '🎹' },
    { id: 'complete', label: 'Complete', icon: '✨' },
  ]

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isComplete = steps.findIndex((s) => s.id === currentStep) > index

        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-purple-900/30 border border-purple-500'
                : isComplete
                  ? 'bg-green-900/20 border border-green-500'
                  : 'bg-gray-900 border border-gray-700'
            }`}
          >
            <span className="text-2xl">{step.icon}</span>
            <span
              className={`flex-1 ${
                isActive
                  ? 'text-purple-300'
                  : isComplete
                    ? 'text-green-300'
                    : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {isActive && (
              <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
            )}
            {isComplete && <span className="text-green-400">✓</span>}
          </div>
        )
      })}
    </div>
  )
}
