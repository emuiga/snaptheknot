import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SlideshowPage() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-foreground to-foreground/95">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-6 font-great-vibes text-5xl text-accent sm:text-6xl md:text-7xl">
            Our Story
          </h1>
          <p className="mb-12 font-playfair text-xl text-background sm:text-2xl">
            Photos will automatically rotate here
          </p>
          <Button 
            asChild 
            variant="outline" 
            className="border-background text-background hover:bg-background/10 font-playfair"
          >
            <Link href="/">Exit Slideshow</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 