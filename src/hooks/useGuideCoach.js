import { useCallback, useEffect, useRef, useState } from 'react'
import { GUIDE_STEPS } from '../data/guideSteps.js'
import { resolveGuideMessage } from '../lib/guideChat.js'
import { UI } from '../content/uiCopy.js'

const STORAGE_KEY = 'bogie-guide-tour-done'

/**
 * @param {{ view: string, setView: (v: string) => void, onOpenStationMap?: () => void }} opts
 */
export function useGuideCoach({ view, setView, onOpenStationMap }) {
  const [open, setOpen] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [spotlightRect, setSpotlightRect] = useState(null)
  const lastAnnouncedStepRef = useRef(null)

  const currentStep = tourActive ? GUIDE_STEPS[stepIndex] : null

  const appendMessage = useCallback((role, content, meta = {}) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, role, content, ...meta },
    ])
  }, [])

  const updateSpotlight = useCallback(() => {
    if (!tourActive || !currentStep?.target) {
      setSpotlightRect(null)
      return
    }
    const el = document.querySelector(currentStep.target)
    if (!el) {
      setSpotlightRect(null)
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      setSpotlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    })
  }, [tourActive, currentStep])

  useEffect(() => {
    if (!open) return
    if (messages.length === 0) {
      appendMessage('assistant', UI.guide.welcome, {
        technical: 'Corridor guide · hybrid local + optional AI',
      })
    }
  }, [open, messages.length, appendMessage])

  useEffect(() => {
    if (!tourActive || !currentStep) return
    if (currentStep.view && currentStep.view !== view) {
      setView(currentStep.view)
    }
  }, [tourActive, currentStep, view, setView])

  useEffect(() => {
    if (!tourActive) return
    const t = setTimeout(updateSpotlight, 120)
    window.addEventListener('resize', updateSpotlight)
    window.addEventListener('scroll', updateSpotlight, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', updateSpotlight)
      window.removeEventListener('scroll', updateSpotlight, true)
    }
  }, [tourActive, stepIndex, view, updateSpotlight])

  useEffect(() => {
    if (!tourActive || !currentStep) return
    if (lastAnnouncedStepRef.current === currentStep.id) return
    lastAnnouncedStepRef.current = currentStep.id
    appendMessage('assistant', currentStep.body, {
      technical: currentStep.technical,
      stepTitle: currentStep.title,
    })
  }, [stepIndex, tourActive, currentStep, appendMessage])

  const openPanel = useCallback(() => setOpen(true), [])
  const closePanel = useCallback(() => {
    setOpen(false)
    setTourActive(false)
    setSpotlightRect(null)
  }, [])

  const startTour = useCallback(() => {
    lastAnnouncedStepRef.current = null
    setTourActive(true)
    setStepIndex(0)
    setOpen(true)
    setMessages([])
  }, [])

  const endTour = useCallback((finished = false) => {
    setTourActive(false)
    setSpotlightRect(null)
    if (finished) {
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
    }
  }, [])

  const nextStep = useCallback(() => {
    if (stepIndex >= GUIDE_STEPS.length - 1) {
      endTour(true)
      appendMessage('assistant', 'Tour complete — you can keep asking questions anytime.', {
        technical: 'GUIDE_STEPS finished',
      })
      return
    }
    setStepIndex((i) => i + 1)
  }, [stepIndex, endTour, appendMessage])

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1))
  }, [])

  const skipTour = useCallback(() => {
    endTour(false)
    appendMessage('assistant', 'Tour skipped. Ask me anything about the dashboard.', {})
  }, [endTour, appendMessage])

  const sendMessage = useCallback(
    async (text, { preferAi = false } = {}) => {
      const trimmed = text?.trim()
      if (!trimmed || thinking) return
      appendMessage('user', trimmed)
      setInput('')
      setThinking(true)
      try {
        const history = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }))
        const result = await resolveGuideMessage(trimmed, { preferAi, history })
        appendMessage('assistant', result.answer, {
          technical: result.technical,
          source: result.source,
        })
      } finally {
        setThinking(false)
      }
    },
    [appendMessage, messages, thinking],
  )

  const handleQuickTopic = useCallback(
    (topic) => {
      sendMessage(topic)
    },
    [sendMessage],
  )

  return {
    open,
    openPanel,
    closePanel,
    tourActive,
    stepIndex,
    stepCount: GUIDE_STEPS.length,
    currentStep,
    spotlightRect,
    messages,
    input,
    setInput,
    thinking,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    sendMessage,
    handleQuickTopic,
    onOpenStationMap,
  }
}
