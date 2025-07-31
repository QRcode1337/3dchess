// Example component showing proper usage of the fixed Three.js color performance test
"use client"

import { useEffect, useState } from "react"
import { benchmarkColorCreation } from "@/lib/color-performance-test"

interface PerformanceTestResult {
  original: number
  optimized: number
  direct: number
}

export function ColorPerformanceDemo() {
  const [results, setResults] = useState<PerformanceTestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runBenchmark = async () => {
    setIsRunning(true)
    
    // Capture console.log output
    const originalLog = console.log
    const logs: string[] = []
    console.log = (message: string) => {
      logs.push(message)
      originalLog(message)
    }

    try {
      // Run the benchmark
      benchmarkColorCreation()
      
      // Parse results from logs
      const originalMatch = logs.find(log => log.includes("Test 1"))
      const optimizedMatch = logs.find(log => log.includes("Optimized version"))
      const directMatch = logs.find(log => log.includes("Direct color"))
      
      if (originalMatch && optimizedMatch && directMatch) {
        setResults({
          original: parseFloat(originalMatch.split(": ")[1]) || 0,
          optimized: parseFloat(optimizedMatch.split(": ")[1]) || 0,
          direct: parseFloat(directMatch.split(": ")[1]) || 0,
        })
      }
    } finally {
      console.log = originalLog
      setIsRunning(false)
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Three.js Color Performance Test</h2>
      <p className="mb-4 text-gray-700">
        This demonstrates the fixed version of the Three.js color creation performance test 
        using proper ES modules and TypeScript.
      </p>
      
      <button
        onClick={runBenchmark}
        disabled={isRunning}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? "Running..." : "Run Benchmark"}
      </button>

      {results && (
        <div className="mt-6 p-4 bg-white rounded border">
          <h3 className="font-semibold mb-2">Performance Results:</h3>
          <ul className="space-y-1">
            <li>Original approach: {results.original}ms</li>
            <li>Optimized approach: {results.optimized}ms</li>
            <li>Direct color creation: {results.direct}ms</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Lower numbers indicate better performance. The optimized approach should be faster 
            than the original string concatenation method.
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800">Fixes Applied:</h4>
        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
          <li>✅ Replaced CommonJS require() with ES modules import</li>
          <li>✅ Fixed missing semicolon syntax error</li>
          <li>✅ Optimized string building with String.repeat()</li>
          <li>✅ Added proper TypeScript types</li>
          <li>✅ Used three-singleton to prevent multiple Three.js instances</li>
        </ul>
      </div>
    </div>
  )
}
