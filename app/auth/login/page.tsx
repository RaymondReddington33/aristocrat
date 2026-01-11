"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Loader2, MessageCircle, ExternalLink, Shield, Eye, Lock, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getUserRole } from "@/lib/auth"
import { loginSupervisor } from "@/lib/simple-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Check for error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "unauthorized") {
      setMessage("Your credentials are not authorized to access this application.")
      toast({
        title: "Unauthorized",
        description: "Your credentials are not authorized to access this application.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const supabase = createClient()
      
      // Get the current origin for redirect
      const origin = window.location.origin
      const redirectTo = `${origin}/auth/callback`

      // Validate email before sending (informative, actual validation in middleware)
      const role = getUserRole(email)
      if (!role) {
        setMessage("Your email is not authorized. Only claramuntoriol@gmail.com (Test Owner) is allowed.")
        toast({
          title: "Unauthorized Email",
          description: "Only Test Owner email is allowed.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) throw error

      setMessage("Check your email for the magic link!")
      toast({
        title: "Magic link sent",
        description: "Please check your email for the login link.",
      })
    } catch (error: any) {
      console.error("Error sending magic link:", error)
      setMessage(error?.message || "An error occurred. Please try again.")
      toast({
        title: "Error",
        description: error?.message || "Failed to send magic link",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSupervisorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const result = await loginSupervisor(username, password)
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        // Redirect to home or admin
        const next = new URLSearchParams(window.location.search).get("next") || "/"
        router.push(next)
        router.refresh()
      } else {
        setMessage(result.error || "Invalid username or password")
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage("An error occurred. Please try again.")
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Header with Aristocrat Banner */}
      <header className="relative w-full flex-shrink-0 overflow-hidden">
        <div className="relative z-0 w-full">
          <img 
            src="/images/banner.png" 
            alt="Aristocrat Product Madness Banner"
            className="w-full h-auto object-contain object-top"
          />
        </div>
      </header>

      {/* Main Content - Floating Dialog */}
      <main className="flex-1 flex items-center justify-center min-h-0 py-4 sm:py-6 px-3 sm:px-4">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-slate-200 shadow-2xl overflow-hidden bg-white" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Side - Information */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-white">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold mb-2 text-slate-900">
                      Technical Test Access
                    </h1>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Welcome to Oriol Claramunt's technical test for the ASO/ASA Manager position at Aristocrat.
                    </p>
                  </div>

                  {/* Access Roles */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 flex-shrink-0">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1.5 sm:mb-2">Access Roles</h3>
                        <div className="space-y-2 sm:space-y-2.5">
                          <div>
                            <div className="font-semibold text-slate-900 text-xs mb-0.5 sm:mb-1">Test Owner (Admin)</div>
                            <p className="text-slate-600 text-xs leading-relaxed break-words">
                              Full access to create, edit, and manage all test data. Email: <span className="font-medium text-slate-900 break-all">claramuntoriol@gmail.com</span>
                            </p>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs mb-0.5 sm:mb-1">Supervisor (Test Reviewer)</div>
                            <p className="text-slate-600 text-xs leading-relaxed break-words">
                              Read-only access to review the test submission. Use username and password login.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 sm:pt-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 flex-shrink-0">
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1">What's Inside</h3>
                          <p className="text-slate-600 text-xs leading-relaxed">
                            This application showcases a complete ASO/ASA management system with keyword research, creative brief management, and App Store preview functionality.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 sm:pt-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 flex-shrink-0">
                          <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1">Having Trouble Accessing?</h3>
                          <p className="text-slate-600 text-xs leading-relaxed mb-1.5 sm:mb-2">
                            If you cannot log in or need assistance, please contact:
                          </p>
                          <div className="space-y-1 sm:space-y-1.5">
                            <a 
                              href="https://wa.me/34697621030" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 sm:gap-2 text-slate-900 hover:text-blue-600 transition-colors text-xs font-medium break-all"
                            >
                              <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="break-all">WhatsApp: +34 697 621 030</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                            <a 
                              href="mailto:claramuntoriol@gmail.com" 
                              className="flex items-center gap-1.5 sm:gap-2 text-slate-900 hover:text-blue-600 transition-colors text-xs font-medium break-all"
                            >
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="break-all">Email: claramuntoriol@gmail.com</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="p-4 sm:p-5 flex flex-col justify-center">
                <div className="mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">Sign In</h2>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Choose your login method
                  </p>
                </div>

                <Tabs defaultValue="supervisor" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="supervisor">Supervisor Login</TabsTrigger>
                    <TabsTrigger value="admin">Admin (Magic Link)</TabsTrigger>
                  </TabsList>

                  {/* Supervisor Login */}
                  <TabsContent value="supervisor" className="space-y-4">
                    <form onSubmit={handleSupervisorLogin} className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="username" className="text-xs sm:text-sm font-medium">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          disabled={loading}
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>

                      {message && (
                        <Alert 
                          variant={message.includes("successful") ? "default" : "destructive"}
                          className="text-xs sm:text-sm"
                        >
                          <AlertDescription className="text-xs sm:text-sm">
                            {message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-10 sm:h-11 text-white text-sm sm:text-base font-medium" 
                        style={{ 
                          background: 'linear-gradient(to right, #4f46e5, #6366f1, #8b5cf6)',
                        }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <User className="mr-2 h-4 w-4" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Admin Login (Magic Link) */}
                  <TabsContent value="admin" className="space-y-4">
                    <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="claramuntoriol@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          autoComplete="off"
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>

                      {message && (
                        <Alert 
                          variant={message.includes("Check your email") ? "default" : "destructive"}
                          className="text-xs sm:text-sm"
                        >
                          <AlertDescription className="text-xs sm:text-sm">
                            {message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-10 sm:h-11 text-white text-sm sm:text-base font-medium" 
                        style={{ 
                          background: 'linear-gradient(to right, #4f46e5, #6366f1, #8b5cf6)',
                        }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Magic Link
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 text-center leading-relaxed px-1">
                        You'll receive a secure link to sign in without a password. The link will expire after 1 hour.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-2 sm:py-2.5 flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-0">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              <span className="text-slate-600 text-xs">Technical Test for</span>
              <span className="font-semibold text-slate-900 text-xs">Aristocrat - Product Madness</span>
            </div>
            <p className="text-slate-500 text-xs text-center sm:text-left">
              by Oriol Claramunt • 2026 BCN
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
