import { CardDeckFlow } from "@/components/learning/card-deck-flow"

interface Props {
  searchParams?: Promise<{ title?: string }>
}

export default async function CardsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {}
  const title = params.title

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[400px] mx-auto px-0 pt-4">
        <CardDeckFlow initialTitle={title} />
      </div>
    </main>
  )
}
