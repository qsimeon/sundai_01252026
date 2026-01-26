interface AudioPlayerProps {
  url: string
  label: string
}

export function AudioPlayer({ url, label }: AudioPlayerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-400">{label}</label>
      <div className="rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700">
        <audio
          src={url}
          controls
          className="w-full"
        />
      </div>
      <a
        href={url}
        download
        className="inline-block text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
      >
        Download ↓
      </a>
    </div>
  )
}
