"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Switch } from "./ui/switch"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
     <Switch
      checked={theme === 'dark'}
      onCheckedChange={(checked) => {
        setTheme(checked ? 'dark' : 'light')
      }}
      aria-label="Toggle theme"
    />
  )
}
