"use client"

interface CardHeaderProps {
  current: number
  total: number
}

export function CardHeader({ current, total }: CardHeaderProps) {
  const progress = ((current + 1) / total) * 100

  return (
    <div className="mb-6 w-full max-w-[400px] mx-auto">
      <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#1a1a1a] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-[#a3a3a3] font-medium text-center">
        {current + 1} of {total}
      </p>
    </div>
  )
}
