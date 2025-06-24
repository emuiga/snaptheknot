"use client"
import { Button } from '@/components/ui/button'
import { BackgroundImage } from '@/components/ui/background-image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState, useRef, Suspense } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ArrowLeft, ArrowRight, X, MoreVertical, Share2, Download } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

interface GalleryImage {
  src: string
  width: number
  height: number
  date: string
  name: string
}

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

function GalleryCard({ imageUrl, imageName, onImageClick }: { imageUrl: string, imageName: string, onImageClick: () => void }) {
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
    <div className="relative group">
      <img 
        src={imageUrl} 
        alt={imageName} 
        className="rounded-lg w-full h-24 sm:h-28 md:h-32 object-cover mx-auto cursor-pointer" 
        onClick={onImageClick}
      />
      <button
        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 z-20"
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen(!menuOpen)
        }}
        aria-label="Open menu"
      >
        <MoreVertical size={20} />
      </button>
      {menuOpen && (
        <div className="absolute top-10 right-2 bg-white rounded shadow-lg z-30 min-w-[48px] flex flex-col items-center py-2">
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

function GalleryContent() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string>('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchImages() {
      setLoading(true)
      const { data, error } = await supabase.storage.from('images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      if (error) {
        setImages([])
        setLoading(false)
        return
      }
      if (data) {
        // Fetch metadata for each image
        const imagesWithMeta: GalleryImage[] = await Promise.all(
          data
            .filter((item) => item.name.match(/\.(jpg|jpeg|png|gif)$/i))
            .map(async (item) => {
              // Try to get image dimensions (fallback to 1:1)
              const url = supabase.storage.from('images').getPublicUrl(item.name).data.publicUrl
              let width = 600, height = 600
              try {
                const img = document.createElement('img')
                img.src = url
                await new Promise((res, rej) => {
                  img.onload = () => res(true)
                  img.onerror = rej
                })
                width = img.naturalWidth
                height = img.naturalHeight
              } catch {}
              return {
                src: url,
                width,
                height,
                date: item.created_at || new Date().toISOString(),
                name: item.name,
              }
            })
        )
        setImages(imagesWithMeta)
        
        // Check if a specific photo is being shared and open it
        const sharedPhoto = searchParams.get('photo')
        if (sharedPhoto) {
          const photoIndex = imagesWithMeta.findIndex(img => img.name === sharedPhoto)
          if (photoIndex !== -1) {
            setLightboxIndex(photoIndex)
            setLightboxOpen(true)
          }
        }
      }
      setLoading(false)
    }
    fetchImages()
  }, [searchParams])

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
    <BackgroundImage image="/bg3.jpg">
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
                <div className="mb-4 font-cormorant text-white/80 text-xl">{label}</div>
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
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={flatImages.map(img => ({ src: img.src }))}
                index={lightboxIndex}
                render={{
                  iconPrev: () => <ArrowLeft className="w-8 h-8 text-white" />,
                  iconNext: () => <ArrowRight className="w-8 h-8 text-white" />,
                  iconClose: () => <X className="w-8 h-8 text-white" />, 
                }}
                on={{
                  view: ({ index }) => setLightboxIndex(index),
                }}
                styles={{
                  container: { background: 'rgba(0,0,0,0.95)' },
                  navigationPrev: { left: 16, top: '50%', transform: 'translateY(-50%)' },
                  navigationNext: { right: 16, top: '50%', transform: 'translateY(-50%)' }
                }}
                carousel={{
                  finite: false,
                  preload: 2,
                  spacing: 0,
                  padding: 0,
                }}
              />
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