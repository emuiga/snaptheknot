"use client"

import { Button } from '@/components/ui/button'
import { BackgroundImage } from '@/components/ui/background-image'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

interface PreviewFile {
  file: File
  url: string
}

export default function UploadPage() {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [showUploaded, setShowUploaded] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const previews: PreviewFile[] = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviewFiles(previews)
    setShowUploaded(false)
    setConfetti(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function handleRemove(idx: number) {
    setPreviewFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleUpload() {
    // Animate out all images
    const previews = document.querySelectorAll('.preview-image')
    previews.forEach((el, i) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '0'
        ;(el as HTMLElement).style.transform = 'scale(0.8)'
      }, i * 80)
    })
    // Remove from state after animation
    setTimeout(() => {
      setPreviewFiles([])
      setShowUploaded(true)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 1800)
    }, previews.length * 80 + 400)
    // Start uploads in background
    previewFiles.forEach(async (preview) => {
      const file = preview.file
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      await supabase.storage.from('images').upload(fileName, file)
    })
  }

  return (
    <BackgroundImage image="/bg2.jpg">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-10 text-center font-dafoe text-5xl sm:text-6xl text-white">
            Share Your Moments
          </h1>
          <div
            className={`mb-12 rounded-2xl border-2 border-dashed ${dragActive ? 'border-accent/80 bg-black/40' : 'border-white/30 bg-black/20'} p-12 text-center backdrop-blur-sm transition-all hover:border-white/50`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragLeave}
          >
            <div className="space-y-6">
              <div className="flex justify-center">
                <Image src="/camera.png" alt="Camera" width={60} height={60} className="mx-auto" />
              </div>
              <h2 className="font-cormorant text-2xl text-white sm:text-3xl">
                Drag and drop your photos here
              </h2>
              <p className="text-sm text-white/70 font-cormorant">
                or click to select files
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button asChild className="bg-accent hover:bg-accent/90 text-foreground font-cormorant">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Photos
                </label>
              </Button>
              {previewFiles.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {previewFiles.map((preview, idx) => (
                    <div key={idx} className="relative flex flex-col items-center preview-image transition-all duration-300" style={{ opacity: 1, transform: 'scale(1)' }}>
                      <button
                        type="button"
                        className="absolute top-1 right-1 z-10 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-2xl"
                        onClick={() => handleRemove(idx)}
                        aria-label="Remove photo"
                        tabIndex={0}
                      >
                        ×
                      </button>
                      <img src={preview.url} alt="preview" className="rounded-lg w-full h-24 object-cover border border-white/20" />
                    </div>
                  ))}
                </div>
              )}
              {previewFiles.length > 0 && (
                <Button className="mt-4 w-full sm:w-auto" onClick={handleUpload}>
                  Upload Selected
                </Button>
              )}
              {showUploaded && (
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-green-400 font-cormorant text-lg">Uploaded!</span>
                  {confetti && <span className="text-2xl animate-bounce">🎉</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Button asChild variant="outline" className="border-accent text-foreground hover:bg-accent/10 font-cormorant">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-foreground font-cormorant">
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </div>
      </div>
    </BackgroundImage>
  )
} 