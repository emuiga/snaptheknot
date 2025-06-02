import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 text-6xl">🎉</div>
          <h1 className="mb-6 font-great-vibes text-5xl text-accent sm:text-6xl md:text-7xl">
            Thank You!
          </h1>
          <p className="mb-12 font-playfair text-xl text-foreground/80 sm:text-2xl">
            Your photos have been successfully uploaded. They will appear in the gallery shortly.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild className="bg-accent hover:bg-accent/90 text-foreground font-playfair">
              <Link href="/gallery">View Gallery</Link>
            </Button>
            <Button asChild variant="outline" className="border-accent text-foreground hover:bg-accent/10 font-playfair">
              <Link href="/upload">Upload More Photos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 