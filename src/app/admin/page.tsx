import { Button } from '@/components/ui/button'

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 font-playfair text-4xl text-center text-foreground">
          Admin Access
        </h1>
        
        <form className="space-y-6 rounded-lg border border-accent/20 bg-background/50 p-8 backdrop-blur-sm">
          <div>
            <label htmlFor="email" className="mb-2 block font-playfair text-sm text-foreground">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-md border border-accent/20 bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="admin@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="mb-2 block font-playfair text-sm text-foreground">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full rounded-md border border-accent/20 bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Login
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted">
          <p>This area is restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  )
} 