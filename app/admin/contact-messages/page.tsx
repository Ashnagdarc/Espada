'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, Mail } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminPage from '@/components/admin/ui/AdminPage'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Table from '@/components/admin/ui/Table'
import { SearchInput } from '@/components/admin/ui/Input'
import Modal from '@/components/admin/ui/Modal'
import Button from '@/components/admin/ui/Button'
import { useToastActions } from '@/hooks/useToast'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

interface ContactMessagesResponse {
  messages: ContactMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminContactMessagesPage() {
  const { error: showError } = useToastActions()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString()
        })

        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim())
        }

        const response = await fetch(`/api/admin/contact-messages?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load contact messages: ${response.status}`)
        }

        const data: ContactMessagesResponse = await response.json()
        setMessages(data.messages || [])
        setTotal(data.pagination?.total || 0)
      } catch (error) {
        console.error('Failed to load contact messages:', error)
        showError('Failed to load contact messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [currentPage, pageSize, searchTerm])

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = useMemo<
    Array<{
      key: string
      title: string
      dataIndex?: keyof ContactMessage
      render?: (value: unknown, record: ContactMessage) => JSX.Element
      sortable?: boolean
    }>
  >(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        sortable: true
      },
      {
        key: 'email',
        title: 'Email',
        dataIndex: 'email',
        render: (value: unknown) => (
          <a
            href={`mailto:${String(value)}`}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {String(value)}
          </a>
        )
      },
      {
        key: 'message',
        title: 'Message',
        dataIndex: 'message',
        render: (value: unknown) => (
          <span className="block max-w-[360px] line-clamp-2 text-gray-700 dark:text-gray-200">
            {String(value)}
          </span>
        )
      },
      {
        key: 'createdAt',
        title: 'Date',
        dataIndex: 'createdAt',
        sortable: true,
        render: (value: unknown) => (
          <span className="text-gray-600 dark:text-gray-300">
            {formatDate(String(value))}
          </span>
        )
      },
      {
        key: 'actions',
        title: '',
        render: (_: unknown, record: ContactMessage) => (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="h-4 w-4" />}
            onClick={() => setSelectedMessage(record)}
          >
            View
          </Button>
        )
      }
    ],
    []
  )

  return (
    <AdminLayout>
      <AdminPage>
        <PageHeader
          title="Contact Messages"
          subtitle="Messages submitted from the Contact Us form"
          actions={
            <div className="w-72">
              <SearchInput
                placeholder="Search name, email, message"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                onClear={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
              />
            </div>
          }
        />

        <Card appearance="panel" className="p-0 overflow-hidden border border-white/10 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 dark:bg-gray-900/40">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Messages</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Inbound contact requests</div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing {messages.length} messages
            </div>
          </div>
          <Table<ContactMessage>
            columns={columns}
            data={messages}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total,
              onChange: (page, nextPageSize) => {
                setCurrentPage(page)
                setPageSize(nextPageSize)
              }
            }}
          />
        </Card>

        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title="Contact Message"
          size="lg"
        >
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedMessage.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedMessage.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Submitted
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  {formatDate(selectedMessage.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Message
                </p>
                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </AdminPage>
    </AdminLayout>
  )
}
