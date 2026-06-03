import { CardDeckFlow } from "@/components/learning/card-deck-flow"

interface Props {
  searchParams?: Promise<{ title?: string }>
}

export default async function CardsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {}
  const title = params.title

  return <CardDeckFlow initialTitle={title} />
}
