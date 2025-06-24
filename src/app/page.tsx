import { Button } from '@/components/ui/button'
import { BackgroundImage } from '@/components/ui/background-image'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <BackgroundImage image="/bg4.jpg">
      <div className="h-full flex flex-col justify-center items-center px-2 py-4 sm:px-4 sm:py-16">
        <div className="w-full max-w-4xl flex flex-col flex-1 justify-center items-center text-center gap-2">
          {/* Names and Rings */}
          <h1 className="mb-4 flex flex-col items-center gap-1 text-5xl sm:text-7xl md:text-8xl font-dafoe text-white leading-tight">
            Esther
            <Image
              src="/rings.png"
              alt="Interlocking rings"
              width={90}
              height={56}
              className="inline-block my-1 transform transition-transform duration-300 hover:scale-105"
            />
            Edward
          </h1>
          <div className="font-cormorant text-lg sm:text-2xl text-accent font-light tracking-widest mb-2">
            June 28, 2025
          </div>

          {/* Welcome Message */}
          <p className="mx-auto max-w-xs sm:max-w-2xl font-cormorant text-base sm:text-xl text-white/80 mb-4">
            Welcome to our wedding photo sharing platform. Share your special moments with us and help us capture memories that last a lifetime.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto sm:min-w-[180px] bg-white/20 hover:bg-white/30 text-white font-playfair whitespace-nowrap">
              <Link href="/upload">Upload Photos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[180px] border-white/30 text-white hover:bg-white/10 font-playfair whitespace-nowrap">
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </div>
      </div>
    </BackgroundImage>
  )
}
