"use client"
import { Button } from '@/components/ui/button'
import { BackgroundImage } from '@/components/ui/background-image'
import { supabase } from '@/lib/supabase'
import { getCachedImages, setCachedImages, type GalleryImage } from '@/lib/galleryCache'
import Link from 'next/link'
import { useEffect, useState, useRef, Suspense } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ArrowLeft, ArrowRight, X, MoreHorizontal, Share2, Download, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function groupByDate(images: GalleryImage[]) {
  const groups: Record<string, GalleryImage[]> = {}
  images.forEach(img => {
    let label = format(parseISO(img.date), 'yyyy-MM-dd')
    if (isToday(parseISO(img.date))) label = 'Today'
    else if (isYesterday(parseISO(img.date))) label = 'Yesterday'
    if (!groups[label]) groups[label] = []
    groups[label].push(img)
  })
  return groups
}

function LightboxMenu({ imageUrl, imageName }: { imageUrl: string, imageName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = imageName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download image.')
      console.error(err)
    }
  }

  const handleWhatsAppShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(imageName)}`
    const text = `Check out this photo! ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleInstagramShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(imageName)}`
    window.open('https://www.instagram.com/', '_blank')
    await navigator.clipboard.writeText(shareUrl)
    alert('Photo link copied to clipboard! Paste it in your Instagram post.')
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(imageName)}`
    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: `Photo: ${imageName}` })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Photo link copied to clipboard!')
    }
  }

  return (
    <div className="relative">
      <button
        className="text-white hover:text-gray-300 transition-colors p-1"
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen(!menuOpen)
        }}
        aria-label="Open menu"
      >
        <MoreHorizontal size={20} />
      </button>
      {menuOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded shadow-lg z-50 min-w-[48px] flex flex-col items-center py-2">
          <button onClick={handleDownload} className="block p-2 hover:bg-gray-100 rounded-full" title="Download">
            <Download size={20} />
          </button>
          <button onClick={handleWhatsAppShare} className="block p-2 hover:bg-gray-100 rounded-full" title="Share on WhatsApp">
            <Image src="/whatsapp.png" alt="WhatsApp" width={30} height={30} />
          </button>
          <button onClick={handleInstagramShare} className="block p-2 hover:bg-gray-100 rounded-full" title="Share on Instagram">
            <Image src="/ig.png" alt="Instagram" width={20} height={20} />
          </button>
          <button onClick={handleShare} className="block p-2 hover:bg-gray-100 rounded-full" title="Share (Other)">
            <Share2 size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

function GalleryCard({ imageUrl, imageName, onImageClick }: { imageUrl: string, imageName: string, onImageClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = imageName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download image.')
      console.error(err)
    }
  }

  const handleWhatsAppShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(imageName)}`
    const text = `Check out this photo! ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleInstagramShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(imageName)}`
    window.open('https://www.instagram.com/', '_blank')
    await navigator.clipboard.writeText(shareUrl)
    alert('Photo link copied to clipboard! Paste it in your Instagram post.')
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?photo=${encodeURIComponent(imageName)}`
    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: `Photo: ${imageName}` })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Photo link copied to clipboard!')
    }
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-lg mb-1">
        {!imageLoaded && !imageError && (
          <div className="w-full h-32 sm:h-40 md:h-48 bg-white/10 animate-pulse rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white/60 rounded-full animate-spin"></div>
          </div>
        )}
        {imageError && (
          <div className="w-full h-32 sm:h-40 md:h-48 bg-white/10 rounded-lg flex items-center justify-center text-white/60 text-sm">
            Failed to load
          </div>
        )}
        <img 
          src={imageUrl} 
          alt={imageName} 
          className={`rounded-lg w-full h-32 sm:h-40 md:h-48 object-cover mx-auto cursor-pointer transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          onClick={imageLoaded ? onImageClick : undefined}
        />
      </div>
      {imageLoaded && (
        <div className="flex justify-end">
          <button
            className="text-white/80 hover:text-white transition-colors p-1"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            aria-label="Open menu"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-0 right-0 bg-white rounded shadow-lg z-30 min-w-[48px] flex flex-col items-center py-2">
              <button onClick={handleDownload} className="block p-2 hover:bg-gray-100 rounded-full" title="Download">
                <Download size={20} />
              </button>
              <button onClick={handleWhatsAppShare} className="block p-2 hover:bg-gray-100 rounded-full" title="Share on WhatsApp">
                <Image src="/whatsapp.png" alt="WhatsApp" width={30} height={30} />
              </button>
              <button onClick={handleInstagramShare} className="block p-2 hover:bg-gray-100 rounded-full" title="Share on Instagram">
                <Image src="/ig.png" alt="Instagram" width={20} height={20} />
              </button>
              <button onClick={handleShare} className="block p-2 hover:bg-gray-100 rounded-full" title="Share (Other)">
                <Share2 size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GalleryContent() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeDate, setActiveDate] = useState<string>('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const searchParams = useSearchParams()

  const fetchImages = async (showRefreshLoader = false, forceRefresh = false) => {
    // Check if we have valid cached data and it's not a forced refresh
    if (!forceRefresh) {
      const cachedImages = getCachedImages()
      if (cachedImages) {
        setImages(cachedImages)
        setLoading(false)
        setRefreshing(false)
        
        // Check if a specific photo is being shared and open it
        if (!showRefreshLoader) {
          const sharedPhoto = searchParams.get('photo')
          if (sharedPhoto) {
            const photoIndex = cachedImages.findIndex(img => img.name === sharedPhoto)
            if (photoIndex !== -1) {
              setLightboxIndex(photoIndex)
              setLightboxOpen(true)
            }
          }
        }
        return
      }
    }

    if (showRefreshLoader) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    const { data, error } = await supabase.storage.from('images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    if (error) {
      setImages([])
      setLoading(false)
      setRefreshing(false)
      return
    }
    if (data) {
      // Create images array without fetching dimensions (much faster)
      const imagesWithMeta: GalleryImage[] = data
        .filter((item) => item.name.match(/\.(jpg|jpeg|png|gif)$/i))
        .map((item) => {
          const url = supabase.storage.from('images').getPublicUrl(item.name).data.publicUrl
          // Use default dimensions - let CSS handle the layout
          return {
            src: url,
            width: 600,
            height: 400, // Default aspect ratio
            date: item.created_at || new Date().toISOString(),
            name: item.name,
          }
        })
      
      // Update cache
      setCachedImages(imagesWithMeta)
      
      setImages(imagesWithMeta)
      setLoading(false)
      setRefreshing(false)
      
      // Check if a specific photo is being shared and open it
      if (!showRefreshLoader) {
        const sharedPhoto = searchParams.get('photo')
        if (sharedPhoto) {
          const photoIndex = imagesWithMeta.findIndex(img => img.name === sharedPhoto)
          if (photoIndex !== -1) {
            setLightboxIndex(photoIndex)
            setLightboxOpen(true)
          }
        }
      }
    }
  }

  useEffect(() => {
    fetchImages()
  }, [searchParams])

  const handleRefresh = () => {
    fetchImages(true, true) // Force refresh bypasses cache
  }

  // Group images by date
  const grouped = groupByDate(images)
  const dateLabels = Object.keys(grouped)

  // Scroll indicator logic
  function handleScroll() {
    const scrollY = window.scrollY
    let current = ''
    for (const label of dateLabels) {
      const ref = dateRefs.current[label]
      if (ref && ref.offsetTop - 100 <= scrollY) {
        current = label
      }
    }
    setActiveDate(current)
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dateLabels])

  function scrollToDate(label: string) {
    const ref = dateRefs.current[label]
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Flatten images for lightbox navigation
  const flatImages = dateLabels.flatMap(label => grouped[label])

  const openLightbox = (imageUrl: string) => {
    const index = flatImages.findIndex(img => img.src === imageUrl)
    if (index !== -1) {
      setLightboxIndex(index)
      setLightboxOpen(true)
    }
  }

  return (
    <BackgroundImage image="/bg1.jpg">
      <div className="w-screen px-2 py-8 sm:px-8 sm:py-16 relative">
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <h1 className="font-playfair text-4xl font-bold text-white sm:text-5xl">
            Our Memories
          </h1>
          <Button asChild className="bg-white/20 hover:bg-white/30 text-white font-playfair">
            <Link href="/upload">Upload More Photos</Link>
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array(18).fill(null).map((_, idx) => (
              <div key={idx} className="aspect-square rounded-2xl bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full text-center text-white/80 font-cormorant text-xl">No images yet. Be the first to upload!</div>
        ) : (
          <div className="relative">
            {/* Floating date label */}
            {activeDate && (
              <div className="fixed top-20 right-4 z-30 bg-black/70 text-white px-3 py-1 rounded-lg font-cormorant text-base sm:text-lg shadow-lg sm:top-24 sm:right-8">
                {activeDate}
              </div>
            )}
            {/* Scroll indicator */}
            <div className="fixed top-1/2 right-2 z-30 flex flex-col items-center gap-1 -translate-y-1/2 sm:right-4 sm:gap-2">
              {dateLabels.map(label => (
                <button
                  key={label}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 ${activeDate === label ? 'bg-accent border-accent' : 'bg-white/40 border-white/60'} transition`}
                  onClick={() => scrollToDate(label)}
                  aria-label={`Scroll to ${label}`}
                />
              ))}
            </div>
            <div className="mb-4 flex justify-left">
              <Link href="/" className="text-white hover:text-accent transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </div>
            {/* Gallery grid by date */}
            {dateLabels.map(label => (
              <div key={label} ref={el => {
                if (el) {
                  dateRefs.current[label] = el
                }
              }} className="mb-10">
                <div className="mb-4 font-cormorant text-white/80 text-xl flex items-center justify-between">
                  {label}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-white/60 hover:text-white/80 transition-colors"
                    aria-label="Refresh gallery"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {grouped[label].map((img, idx) => (
                    <GalleryCard 
                      key={idx} 
                      imageUrl={img.src} 
                      imageName={img.name}
                      onImageClick={() => openLightbox(img.src)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {/* Lightbox modal with swipe support */}
            {lightboxOpen && (
              <div className="fixed inset-0 z-50 bg-black/95">
                <div className="absolute top-4 right-4 flex items-center gap-4 z-60">
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="text-white hover:text-gray-300 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  slides={flatImages.map(img => ({ src: img.src }))}
                  index={lightboxIndex}
                  render={{
                    iconClose: () => null,
                  }}
                  on={{
                    view: ({ index }) => setLightboxIndex(index),
                  }}
                  styles={{
                    container: { background: 'transparent' },
                  }}
                  carousel={{
                    finite: true,
                    preload: 2,
                    spacing: 0,
                    padding: 0,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </BackgroundImage>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading gallery...</div>}>
      <GalleryContent />
    </Suspense>
  )
} 