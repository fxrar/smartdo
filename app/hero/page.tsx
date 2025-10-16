'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function Hero() {
    const [taskCount, setTaskCount] = useState(50247)

    useEffect(() => {
        const interval = setInterval(() => {
            setTaskCount(prev => prev + Math.floor(Math.random() * 3))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative flex min-h-[90vh] items-center justify-center px-6 py-20">
            <div className="mx-auto max-w-4xl text-center">

                {/* Top Badge Group */}
                <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="h-px w-8 bg-blue-600/20"></div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-blue-600/30 bg-blue-50 px-3 py-1 text-blue-700"
                        >
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            AI-Powered
                        </Badge>
                        <Badge
                            variant="outline"
                            className="border-teal-600/30 bg-teal-50 px-2.5 py-1 text-xs text-teal-700"
                        >
                            Beta
                        </Badge>
                    </div>
                    <div className="h-px w-8 bg-blue-600/20"></div>
                </div>

                {/* Headline */}
                <h1 className="mb-5 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                    Tasks that think{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        with you
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                    Chat with AI, create tasks, and stay focused. No complexity, just smart task management that works.
                </p>

                {/* Trust Signals */}
                <div className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Free</span>
                    <span className="text-gray-300">•</span>
                    <span>No credit card</span>
                    <span className="text-gray-300">•</span>
                    <span>Ready in 2 minutes</span>
                </div>

                {/* CTA Group */}
                <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        className="h-12 bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700"
                    >
                        Start organizing now
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-12 text-base font-medium text-gray-700"
                    >
                        See how it works
                    </Button>
                </div>

                {/* Social Proof */}
                <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                    <div className="flex -space-x-2">
                        <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600"></div>
                        <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-teal-400 to-teal-600"></div>
                        <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-teal-500"></div>
                        <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-blue-500"></div>
                    </div>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Join 2,500+ users</span> getting more done
                    </p>
                    <div className="hidden items-center gap-1 sm:flex">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                        <span className="ml-1 text-sm font-medium text-gray-700">4.9/5</span>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 text-teal-600" />
                    <span>
                        <span className="font-mono font-semibold text-gray-900 transition-all duration-700">
                            {taskCount.toLocaleString()}
                        </span>
                        {" "}tasks completed today
                    </span>
                </div>

            </div>
        </section>
    )
}
