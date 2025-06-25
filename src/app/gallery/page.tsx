import { supabase } from '@/lib/supabase'
import GalleryClient from './GalleryClient'

interface GalleryImage {
  src: string
  width: number
  height: number
  date: string
  name: string
}

// Server component to fetch initial data
async function getInitialImages(): Promise<GalleryImage[]> {
  try {
    const { data, error } = await supabase.storage.from('images').list('', { 
      limit: 100, 
      sortBy: { column: 'created_at', order: 'desc' } 
    })
    
    if (error || !data) {
      return []
    }

    const imagesWithMeta: GalleryImage[] = data
      .filter((item) => item.name.match(/\.(jpg|jpeg|png|gif)$/i))
      .map((item) => {
        const baseUrl = supabase.storage.from('images').getPublicUrl(item.name).data.publicUrl
        const optimizedUrl = `${baseUrl}?width=400&height=300&resize=cover&quality=80`
        
        return {
          src: optimizedUrl,
          width: 600,
          height: 400,
          date: item.created_at || new Date().toISOString(),
          name: item.name,
        }
      })

    return imagesWithMeta
  } catch (error) {
    console.error('Error fetching images:', error)
    return []
  }
}

// Server component that fetches data and passes to client
export default async function GalleryPage() {
  const initialImages = await getInitialImages()
  
  return <GalleryClient initialImages={initialImages} />
} 