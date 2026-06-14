import { motion, useReducedMotion } from 'framer-motion'
import { UI } from '../../content/uiCopy.js'
import GuideSpotlight from './GuideSpotlight.jsx'
import GuideChatPanel from './GuideChatPanel.jsx'
import { useGuideCoach } from '../../hooks/useGuideCoach.js'

export default function GuideCoach({ view, setView, onOpenStationMap }) {
  const reduceMotion = useReducedMotion()
  const coach = useGuideCoach({ view, setView, onOpenStationMap })

  const fabVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 8px 32px rgba(56, 189, 248, 0.25)',
    },
    hover: {
      scale: reduceMotion ? 1 : 1.06,
      boxShadow: '0 12px 40px rgba(56, 189, 248, 0.4)',
    },
    tap: { scale: reduceMotion ? 1 : 0.94 },
  }

  return (
    <>
      <GuideSpotlight rect={coach.spotlightRect} active={coach.tourActive} />

      <motion.button
        type="button"
        className="guide-fab"
        aria-label={UI.guide.fabLabel}
        aria-expanded={coach.open}
        variants={fabVariants}
        initial="idle"
        animate="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={() => (coach.open ? coach.closePanel() : coach.openPanel())}
      >
        {!reduceMotion && (
          <motion.span
            className="guide-fab-pulse"
            animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className="material-symbols-outlined guide-fab-icon">
          {coach.open ? 'close' : 'support_agent'}
        </span>
        <span className="guide-fab-label">{coach.open ? 'Close' : 'Guide'}</span>
      </motion.button>

      <GuideChatPanel
        open={coach.open}
        onClose={coach.closePanel}
        messages={coach.messages}
        input={coach.input}
        onInputChange={coach.setInput}
        onSend={(text) => coach.sendMessage(text)}
        thinking={coach.thinking}
        tourActive={coach.tourActive}
        stepIndex={coach.stepIndex}
        stepCount={coach.stepCount}
        currentStep={coach.currentStep}
        onStartTour={coach.startTour}
        onNext={coach.nextStep}
        onBack={coach.prevStep}
        onSkip={coach.skipTour}
        onQuickTopic={coach.handleQuickTopic}
      />
    </>
  )
}
