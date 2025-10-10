import React from 'react'
import ConfirmationModal from './ConfirmationModal'

interface ConfirmationModalHookProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function useConfirmationModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmationModalHookProps, 'isOpen' | 'onClose' | 'onConfirm'> & { onConfirm: () => void | Promise<void> }>({
    title: '',
    message: '',
    onConfirm: () => {},
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const openModal = (modalConfig: Omit<ConfirmationModalHookProps, 'isOpen' | 'onClose' | 'onConfirm'> & { onConfirm: () => void | Promise<void> }) => {
    setConfig(modalConfig)
    setIsOpen(true)
  }

  const closeModal = () => {
    if (!isLoading) {
      setIsOpen(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ConfirmationModalComponent = () => (
    <ConfirmationModal
      {...config}
      isOpen={isOpen}
      onClose={closeModal}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  )

  return {
    openModal,
    closeModal,
    ConfirmationModal: ConfirmationModalComponent,
    isOpen,
    isLoading,
  }
}

export default useConfirmationModal