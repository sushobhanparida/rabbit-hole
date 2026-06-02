"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"

interface ActionBarProps {
  topicId: string
}

export function ActionBar({ topicId }: ActionBarProps) {
  return (
    <div className="reading-width flex items-center gap-3 mb-8">
      <Button variant="outline" size="lg" className="flex-1 gap-2">
        <Bookmark className="h-4 w-4" />
        Save
      </Button>
      <a href={`/learn/${topicId}/cards`} className="flex-1">
        <Button size="lg" className="w-full gap-2">
          Start Learning
        </Button>
      </a>
    </div>
  )
}
