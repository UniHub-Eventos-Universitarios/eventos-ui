import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InscricaoPage({ params }: Props) {
  const { id } = await params
  redirect(`/eventos/${id}`)
}
