import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Orange wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,229.3C672,256,768,288,864,293.3C960,299,1056,277,1152,250.7C1248,224,1344,192,1392,176L1440,160L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          className="absolute top-0 right-0 w-full h-full opacity-5"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,160L48,176C96,192,192,224,288,250.7C384,277,480,299,576,293.3C672,288,768,256,864,229.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="url(#gradient2)"
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
            <CheckCheck className="text-white text-3xl" />
          </div>
          <h1 className="mt-6 text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">Ordo</h1>
          <p className="mt-3 text-lg text-gray-700 font-medium">Organize your tasks with priority</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100">
          <CardContent className="pt-8 p-8 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Ordo!</h2>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                A powerful task management system that helps you stay organized and focused.
              </p>
            </div>
            
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-orange-400"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
