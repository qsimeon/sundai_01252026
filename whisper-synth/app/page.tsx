import { MusicGenerator } from '@/components/MusicGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-300 p-8 md:p-16">
      <div className="max-w-2xl mx-auto">
        <MusicGenerator />
      </div>
    </main>
  )
}
