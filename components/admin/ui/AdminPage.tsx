'use client'

import React from 'react'

interface AdminPageProps {
  children: React.ReactNode
  className?: string
}

const AdminPage: React.FC<AdminPageProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-6 py-8 ${className}`}>{children}</div>
  )
}

export default AdminPage