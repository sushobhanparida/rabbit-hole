"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export type NarrationState = "idle" | "speaking" | "paused"

export function useNarration() {
  const [state, setState] = useState<NarrationState>("idle")
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("")
  const currentTextRef = useRef("")

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      if (all.length > 0) {
        setVoices(all)
        const en = all.find((v) => v.lang.startsWith("en"))
        if (!selectedVoiceURI) {
          setSelectedVoiceURI(en?.voiceURI || all[0]?.voiceURI || "")
        }
      }
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_#`>|:-]/g, "").slice(0, 3000)
    if (!cleaned.trim()) return
    currentTextRef.current = cleaned
    const utterance = new SpeechSynthesisUtterance(cleaned)
    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI)
    if (voice) utterance.voice = voice
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.onend = () => setState("idle")
    utterance.onerror = () => setState("idle")
    setState("speaking")
    window.speechSynthesis.speak(utterance)
  }, [voices, selectedVoiceURI])

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setState("paused")
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setState("speaking")
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setState("idle")
  }, [])

  const toggle = useCallback((text: string) => {
    if (state === "speaking") {
      pause()
    } else if (state === "paused") {
      resume()
    } else {
      speak(text)
    }
  }, [state, speak, pause, resume])

  const restart = useCallback(() => {
    speak(currentTextRef.current)
  }, [speak])

  const setVoice = useCallback((voiceURI: string) => {
    setSelectedVoiceURI(voiceURI)
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { state, voices, selectedVoiceURI, setVoice, speak, pause, resume, stop, toggle, restart }
}
