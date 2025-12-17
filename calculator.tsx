"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { History, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Type definition for calculation history entries
type HistoryEntry = {
  id: string
  expression: string
  result: string
  timestamp: Date
}

export function Calculator() {
  // State management for calculator functionality
  const [display, setDisplay] = useState("0") // Current display value
  const [expression, setExpression] = useState("") // Full expression being built
  const [history, setHistory] = useState<HistoryEntry[]>([]) // Calculation history
  const [showHistory, setShowHistory] = useState(false) // Toggle history sidebar
  const [newNumber, setNewNumber] = useState(true) // Track if starting new number

  /**
   * Load history from localStorage on component mount
   * Allows persistence across page refreshes
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculator-history")
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      setHistory(
        parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })),
      )
    }
  }, [])

  /**
   * Save history to localStorage whenever it changes
   */
  useEffect(() => {
    localStorage.setItem("calculator-history", JSON.stringify(history))
  }, [history])

  /**
   * Handle number button clicks
   * Manages decimal points and number concatenation
   */
  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num)
      setNewNumber(false)
    } else {
      // Prevent multiple decimal points in a number
      if (num === "." && display.includes(".")) return
      setDisplay(display === "0" ? num : display + num)
    }
  }

  /**
   * Handle operator button clicks (+, -, *, /)
   * Builds the expression and resets for next number
   */
  const handleOperator = (op: string) => {
    setExpression(expression + display + " " + op + " ")
    setNewNumber(true)
  }

  /**
   * Calculate the final result
   * Evaluates the expression and adds to history
   */
  const handleEquals = () => {
    try {
      const fullExpression = expression + display
      // Use Function constructor for safe evaluation (better than eval)
      const result = Function(`"use strict"; return (${fullExpression})`)()
      const roundedResult = Math.round(result * 100000000) / 100000000 // Round to 8 decimals

      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        expression: fullExpression,
        result: roundedResult.toString(),
        timestamp: new Date(),
      }
      setHistory([historyEntry, ...history])

      setDisplay(roundedResult.toString())
      setExpression("")
      setNewNumber(true)
    } catch (error) {
      setDisplay("Error")
      setExpression("")
      setNewNumber(true)
    }
  }

  /**
   * Handle scientific functions (sin, cos, tan, sqrt, etc.)
   * Converts degrees to radians for trigonometric functions
   */
  const handleScientific = (func: string) => {
    try {
      const num = Number.parseFloat(display)
      let result: number

      switch (func) {
        case "sin":
          result = Math.sin((num * Math.PI) / 180) // Convert to radians
          break
        case "cos":
          result = Math.cos((num * Math.PI) / 180)
          break
        case "tan":
          result = Math.tan((num * Math.PI) / 180)
          break
        case "sqrt":
          result = Math.sqrt(num)
          break
        case "square":
          result = num * num
          break
        case "log":
          result = Math.log10(num)
          break
        case "ln":
          result = Math.log(num)
          break
        case "1/x":
          result = 1 / num
          break
        case "exp":
          result = Math.exp(num)
          break
        case "pow":
          setExpression(display + " ** ")
          setNewNumber(true)
          return
        default:
          return
      }

      const roundedResult = Math.round(result * 100000000) / 100000000

      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        expression: `${func}(${num})`,
        result: roundedResult.toString(),
        timestamp: new Date(),
      }
      setHistory([historyEntry, ...history])

      setDisplay(roundedResult.toString())
      setNewNumber(true)
    } catch (error) {
      setDisplay("Error")
      setNewNumber(true)
    }
  }

  /**
   * Clear all (AC button)
   * Resets calculator to initial state
   */
  const handleClear = () => {
    setDisplay("0")
    setExpression("")
    setNewNumber(true)
  }

  /**
   * Delete last character (backspace)
   */
  const handleDelete = () => {
    if (display.length === 1) {
      setDisplay("0")
      setNewNumber(true)
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  /**
   * Toggle positive/negative
   */
  const handlePlusMinus = () => {
    if (display === "0") return
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display)
  }

  /**
   * Load calculation from history
   */
  const loadFromHistory = (entry: HistoryEntry) => {
    setDisplay(entry.result)
    setExpression("")
    setNewNumber(true)
  }

  /**
   * Clear all history
   */
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("calculator-history")
  }

  // Reusable button component with glassmorphism styling
  const CalcButton = ({
    children,
    onClick,
    variant = "default",
    className,
  }: {
    children: React.ReactNode
    onClick: () => void
    variant?: "default" | "operator" | "function" | "equals"
    className?: string
  }) => {
    const baseStyles = "h-16 text-lg font-medium transition-all backdrop-blur-sm border border-white/10"

    const variants = {
      default: "bg-slate-800/80 hover:bg-slate-700/80 text-white",
      operator: "bg-orange-500/80 hover:bg-orange-600/80 text-white",
      function: "bg-slate-700/80 hover:bg-slate-600/80 text-orange-400",
      equals: "bg-orange-500 hover:bg-orange-600 text-white font-bold",
    }

    return (
      <Button onClick={onClick} className={cn(baseStyles, variants[variant], className)}>
        {children}
      </Button>
    )
  }

  return (
    <div className="flex gap-4 w-full max-w-7xl">
      {/* History Sidebar - Responsive visibility */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:transform-none",
          showHistory ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !showHistory && "lg:hidden",
        )}
      >
        <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">History</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
            {history.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-8">No calculations yet</p>
            ) : (
              history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-lg transition-colors group"
                >
                  <p className="text-xs text-slate-400 mb-1">{entry.timestamp.toLocaleTimeString()}</p>
                  <p className="text-sm text-slate-300 mb-1 truncate">{entry.expression}</p>
                  <p className="text-base text-white font-medium truncate">= {entry.result}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay when history is open */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowHistory(false)} />
      )}

      {/* Main Calculator */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {/* Display Screen */}
          <div className="bg-slate-950/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            {/* Expression preview */}
            <div className="text-slate-400 text-sm h-6 overflow-hidden text-right mb-2">{expression}</div>
            {/* Main display */}
            <div className="text-white text-4xl font-light text-right overflow-hidden text-ellipsis">{display}</div>
          </div>

          {/* History Toggle Button - Mobile */}
          <Button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full mb-4 lg:hidden bg-slate-800/80 hover:bg-slate-700/80 border border-white/10"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? "Hide" : "Show"} History
          </Button>

          {/* Button Grid */}
          <div className="space-y-2">
            {/* Row 1 - Scientific functions */}
            <div className="grid grid-cols-5 gap-2">
              <CalcButton variant="function" onClick={() => handleScientific("sin")}>
                sin
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("cos")}>
                cos
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("tan")}>
                tan
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("sqrt")}>
                √
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("pow")}>
                x<sup>y</sup>
              </CalcButton>
            </div>

            {/* Row 2 - More scientific functions */}
            <div className="grid grid-cols-5 gap-2">
              <CalcButton variant="function" onClick={() => handleScientific("square")}>
                x²
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("1/x")}>
                1/x
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("log")}>
                log
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("ln")}>
                ln
              </CalcButton>
              <CalcButton variant="function" onClick={() => handleScientific("exp")}>
                e<sup>x</sup>
              </CalcButton>
            </div>

            {/* Row 3 - Clear and operations */}
            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="default" onClick={handleClear}>
                AC
              </CalcButton>
              <CalcButton variant="default" onClick={handlePlusMinus}>
                +/−
              </CalcButton>
              <CalcButton variant="default" onClick={handleDelete}>
                ⌫
              </CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator("/")}>
                ÷
              </CalcButton>
            </div>

            {/* Row 4-6 - Number pad */}
            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="default" onClick={() => handleNumber("7")}>
                7
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber("8")}>
                8
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber("9")}>
                9
              </CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator("*")}>
                ×
              </CalcButton>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="default" onClick={() => handleNumber("4")}>
                4
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber("5")}>
                5
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber("6")}>
                6
              </CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator("-")}>
                −
              </CalcButton>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="default" onClick={() => handleNumber("1")}>
                1
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber("2")}>
                2
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber("3")}>
                3
              </CalcButton>
              <CalcButton variant="operator" onClick={() => handleOperator("+")}>
                +
              </CalcButton>
            </div>

            {/* Row 7 - Bottom row with 0 and equals */}
            <div className="grid grid-cols-4 gap-2">
              <CalcButton variant="default" onClick={() => handleNumber("0")} className="col-span-2">
                0
              </CalcButton>
              <CalcButton variant="default" onClick={() => handleNumber(".")}>
                .
              </CalcButton>
              <CalcButton variant="equals" onClick={handleEquals}>
                =
              </CalcButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
