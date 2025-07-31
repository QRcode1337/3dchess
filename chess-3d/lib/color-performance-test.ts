// Fixed version of the color performance test using proper ES modules and Three.js
import { THREE } from "./three-singleton"

/**
 * Builds a blank string of specified length
 * Fixed version with better performance
 */
function buildBlank(n: number): string {
  return "rgb(" + " ".repeat(n) + ""
}

/**
 * Performance test for Three.js Color creation
 * This demonstrates the correct way to use Three.js in this project
 */
export function runColorPerformanceTest(): void {
  const startTime = Date.now()
  
  // Create a new Color instance using the proper Three.js import
  new THREE.Color(buildBlank(50000))
  
  const timeCost = Date.now() - startTime
  console.log(`${timeCost} ms`)
}

/**
 * Alternative performance test with better string building
 */
export function runOptimizedColorPerformanceTest(): void {
  const startTime = Date.now()
  
  // More efficient approach - pre-allocate the string
  const blankString = "rgb(" + " ".repeat(50000) + ""
  new THREE.Color(blankString)
  
  const timeCost = Date.now() - startTime
  console.log(`Optimized version: ${timeCost} ms`)
}

/**
 * Benchmark multiple approaches
 */
export function benchmarkColorCreation(): void {
  console.log("Running Three.js Color performance benchmarks...")
  
  // Test 1: Original approach (fixed)
  console.log("Test 1: Original approach")
  runColorPerformanceTest()
  
  // Test 2: Optimized approach
  console.log("Test 2: Optimized approach")
  runOptimizedColorPerformanceTest()
  
  // Test 3: Direct color creation
  console.log("Test 3: Direct color creation")
  const startTime = Date.now()
  new THREE.Color(0xffffff) // Direct hex color
  const timeCost = Date.now() - startTime
  console.log(`Direct color: ${timeCost} ms`)
}
