import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { handleAuth } from "@/services/googleApi"

export function LoginScreen() {
  const handleLogin = async () => {
    console.log('Initiating Google login...')
    try {
      await handleAuth()
      console.log('Login successful')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome to HomeBase</h1>
            <p className="text-muted-foreground">
              Sign in to access your workspaces
            </p>
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            Sign in with Google
          </Button>
        </div>
      </Card>
    </div>
  )
} 