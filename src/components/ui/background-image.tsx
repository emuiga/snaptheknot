import { cn } from "@/lib/utils"

interface BackgroundImageProps {
  image: string
  className?: string
  children: React.ReactNode
}

export function BackgroundImage({ image, className, children }: BackgroundImageProps) {
  return (
    <div 
      className={cn(
        "min-h-screen bg-cover bg-center bg-no-repeat relative",
        className
      )}
      style={{
        backgroundImage: `url(${image})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
} 