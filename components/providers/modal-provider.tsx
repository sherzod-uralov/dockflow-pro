"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { ModalContextValue } from "@/types/modal"

interface ModalState {
  [key: string]: {
    isOpen: boolean
    props?: any
  }
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalState>({})

  const openModal = useCallback((id: string, props?: any) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        isOpen: true,
        props
      }
    }))
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false
      }
    }))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newModals = { ...prev }
      Object.keys(newModals).forEach(id => {
        newModals[id] = {
          ...newModals[id],
          isOpen: false
        }
      })
      return newModals
    })
  }, [])

  const isModalOpen = useCallback((id: string) => {
    return modals[id]?.isOpen || false
  }, [modals])

  const getModalProps = useCallback((id: string) => {
    return modals[id]?.props || {}
  }, [modals])

  const value: ModalContextValue = {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalProps
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModalContext() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModalContext must be used within a ModalProvider")
  }
  return context
}

// Hook for global modal management
export function useGlobalModal(id: string) {
  const context = useModalContext()

  const isOpen = context.isModalOpen(id)
  const props = context.getModalProps(id)

  const openModal = useCallback((modalProps?: any) => {
    context.openModal(id, modalProps)
  }, [context, id])

  const closeModal = useCallback(() => {
    context.closeModal(id)
  }, [context, id])

  return {
    isOpen,
    props,
    openModal,
    closeModal
  }
}
