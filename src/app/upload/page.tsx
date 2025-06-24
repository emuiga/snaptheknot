"use client"

import { Button } from '@/components/ui/button'
import { BackgroundImage } from '@/components/ui/background-image'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface PreviewFile {
  file: File
  url: string
}

export default function UploadPage() {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Test storage bucket connection
  useEffect(() => {
    async function testStorage() {
      try {
        const { data, error } = await supabase.storage.from('images').list('', { limit: 1 })
        if (error) {
          alert(`Storage bucket error: ${error.message}`)
          toast.error(`Storage bucket error: ${error.message}`)
        }
      } catch (err) {
        // Silent error handling
      }
    }
    testStorage()
  }, [])

  function handleFiles(files: FileList | null) {
    if (!files) return
    const previews: PreviewFile[] = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviewFiles(previews)
    setUploading(false)
    setUploadProgress(0)
    setUploadedCount(0)
    setTotalFiles(0)
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
    setUploading(true)
    setTotalFiles(previewFiles.length)
    setUploadedCount(0)
    setUploadProgress(0)

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
    }, previews.length * 80 + 400)
    
    // Start uploads in background with error handling
    let successCount = 0
    let errorCount = 0
    let completedCount = 0
    
    await Promise.all(previewFiles.map(async (preview) => {
      const file = preview.file
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        const message = `File ${file.name} is too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 10MB.`
        alert(message)
        toast.error(message)
        errorCount++
        completedCount++
        setUploadedCount(completedCount)
        setUploadProgress((completedCount / previewFiles.length) * 100)
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const message = `File ${file.name} is not a valid image file.`
        alert(message)
        toast.error(message)
        errorCount++
        completedCount++
        setUploadedCount(completedCount)
        setUploadProgress((completedCount / previewFiles.length) * 100)
        return
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      
      try {
        const { data, error } = await supabase.storage.from('images').upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
        
        if (error) {
          let message = `Failed to upload ${file.name}: ${error.message}`
          if (error.message.includes('413')) {
            message = `File ${file.name} is too large for the server. Try compressing the image.`
          } else if (error.message.includes('network')) {
            message = `Network error uploading ${file.name}. Please check your internet connection and try again.`
          }
          alert(message)
          toast.error(message)
          errorCount++
        } else {
          toast.success(`${file.name} uploaded successfully!`)
          successCount++
        }
      } catch (err) {
        let message = `Failed to upload ${file.name}: ${err}`
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          message = `Network connection error uploading ${file.name}. Please check your internet connection and try again.`
        }
        alert(message)
        toast.error(message)
        errorCount++
      }
      
      completedCount++
      setUploadedCount(completedCount)
      setUploadProgress((completedCount / previewFiles.length) * 100)
    }))
    
    // Show summary toast
    if (successCount > 0 && errorCount === 0) {
      toast.success(`All ${successCount} photos uploaded successfully! 🎉`)
      // Invalidate gallery cache so it refreshes when user visits gallery
      if (typeof window !== 'undefined' && (window as any).invalidateGalleryCache) {
        (window as any).invalidateGalleryCache()
      }
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} photos uploaded, ${errorCount} failed`)
      // Invalidate gallery cache even if some uploads failed
      if (typeof window !== 'undefined' && (window as any).invalidateGalleryCache) {
        (window as any).invalidateGalleryCache()
      }
    } else if (errorCount > 0) {
      toast.error(`All ${errorCount} uploads failed`)
    }
    
    // Reset upload state after a short delay
    setTimeout(() => {
      setUploading(false)
      setUploadProgress(0)
      setUploadedCount(0)
      setTotalFiles(0)
    }, 2000)
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
              {previewFiles.length > 0 && !uploading && (
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
              {previewFiles.length > 0 && !uploading && (
                <Button className="mt-4 w-full sm:w-auto" onClick={handleUpload}>
                  Upload Selected
                </Button>
              )}
              {uploading && (
                <div className="mt-6 flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="text-white font-cormorant text-lg">
                      Uploading photos...
                    </span>
                  </div>
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-sm text-white/80 mb-2">
                      <span>{uploadedCount} of {totalFiles} completed</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
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