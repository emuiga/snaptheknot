"use client"
import { Button } from '@/components/ui/button'
import { BackgroundImage } from '@/components/ui/background-image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import PhotoAlbum from 'react-photo-album'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'

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

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string>('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const albumContainerRef = useRef<HTMLDivElement>(null)

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
      }
      setLoading(false)
    }
    fetchImages()
  }, [])

  useEffect(() => {
    if (albumContainerRef.current) {
      console.log('PhotoAlbum container width:', albumContainerRef.current.offsetWidth)
    }
  }, [images])

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
            {/* Masonry grid by date */}
            {dateLabels.map(label => (
              <div key={label} ref={el => {
                if (el) {
                  dateRefs.current[label] = el
                }
              }} className="mb-10">
                <div className="mb-4 font-cormorant text-white/80 text-xl">{label}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {grouped[label].map((img, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl border border-white/20 overflow-hidden p-1 sm:p-2 cursor-pointer hover:shadow-lg transition-all duration-200">
                      <img
                        src={img.src}
                        alt="gallery"
                        className="rounded-lg shadow-md hover:scale-105 transition-transform duration-200 w-full h-24 sm:h-28 md:h-32 object-cover mx-auto"
                        onClick={() => {
                          setLightboxIndex(flatImages.findIndex(i => i.src === img.src))
                          setLightboxOpen(true)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Lightbox modal */}
            {lightboxOpen && (
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={flatImages.map(img => ({ src: img.src }))}
                index={lightboxIndex}
                render={{
                  iconPrev: () => <span className="text-4xl text-white">&lt;</span>,
iconNext: () => <span className="text-4xl text-white">&gt;</span>,
                  iconClose: () => <ArrowLeft className="w-10 h-10 text-white" />, 
                }}
                on={{
                  view: ({ index }) => setLightboxIndex(index),
                }}
                styles={{
                  container: { background: 'rgba(0,0,0,0.95)' },
                  navigationPrev: { left: 16, top: '50%', transform: 'translateY(-50%)' },
                  navigationNext: { right: 16, top: '50%', transform: 'translateY(-50%)' },
                  close: { left: 16, top: 16, right: 'auto' }
                }}
              />
            )}
          </div>
        )}
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 font-playfair">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </BackgroundImage>
  )
} 