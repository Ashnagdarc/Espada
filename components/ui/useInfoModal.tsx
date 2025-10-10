import React from 'react'
import InfoModal from './InfoModal'

// Local copy of the props used by the hook to avoid exporting types from the component file
interface InfoModalHookProps {
  title: string
  content: React.ReactNode
  variant?: 'info' | 'success' | 'error' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

export function useInfoModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<InfoModalHookProps, 'isOpen' | 'onClose'>>({
    title: '',
    content: '',
  })

  const openModal = (modalConfig: Omit<InfoModalHookProps, 'isOpen' | 'onClose'>) => {
    setConfig(modalConfig)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const InfoModalComponent = () => (
    <InfoModal
      {...config}
      isOpen={isOpen}
      onClose={closeModal}
    />
  )

  return {
    openModal,
    closeModal,
    InfoModal: InfoModalComponent,
    isOpen,
  }
}

export function useSuccessModal() {
  const { openModal, closeModal, InfoModal, isOpen } = useInfoModal()
  
  const openSuccessModal = (title: string, content: React.ReactNode, options?: Partial<InfoModalHookProps>) => {
    openModal({ title, content, variant: 'success', ...options })
  }
  
  return { openSuccessModal, closeModal, InfoModal, isOpen }
}

export function useErrorModal() {
  const { openModal, closeModal, InfoModal, isOpen } = useInfoModal()
  
  const openErrorModal = (title: string, content: React.ReactNode, options?: Partial<InfoModalHookProps>) => {
    openModal({ title, content, variant: 'error', ...options })
  }
  
  return { openErrorModal, closeModal, InfoModal, isOpen }
}

export function useWarningModal() {
  const { openModal, closeModal, InfoModal, isOpen } = useInfoModal()
  
  const openWarningModal = (title: string, content: React.ReactNode, options?: Partial<InfoModalHookProps>) => {
    openModal({ title, content, variant: 'warning', ...options })
  }
  
  return { openWarningModal, closeModal, InfoModal, isOpen }
}

export default useInfoModal