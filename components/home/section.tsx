"use client"

import { ReactNode } from "react"

interface SectionProps {
  title: string
  children: ReactNode
  fullWidth?: boolean
}

export function Section({ title, children, fullWidth }: SectionProps) {
  if (fullWidth) {
    return (
      <section className="mb-6">
        <h2 className="font-heading text-xl font-bold text-on-surface mb-4 tracking-tight">
          {title}
        </h2>
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-10">
      <h2 className="font-heading text-xl font-bold text-on-surface mb-4 tracking-tight">
        {title}
      </h2>
      <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
        <div className="flex gap-4 pb-2">
          {children}
        </div>
      </div>
    </section>
  )
}
