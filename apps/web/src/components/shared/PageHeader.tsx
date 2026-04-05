'use client'

import { useState } from 'react'
import { NewDeckDialog } from '@/components/slides/NewDeckDialog'

type PageHeaderProps = {
  title: string
  description?: string
  showNewDeck?: boolean
  actions?: React.ReactNode
}

export function PageHeader({ title, description, showNewDeck, actions }: PageHeaderProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {showNewDeck && (
          <>
            <button
              onClick={() => setShowDialog(true)}
              className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              New deck
            </button>
            {showDialog && <NewDeckDialog onClose={() => setShowDialog(false)} />}
          </>
        )}
      </div>
    </div>
  )
}
