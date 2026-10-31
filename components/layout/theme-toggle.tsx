"use client"

import { useTheme } from "next-themes"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="테마 변경" />}>
        <SunIcon className="size-4 dark:hidden" />
        <MoonIcon className="hidden size-4 dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon />
          밝은 화면
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon />
          어두운 화면
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <MonitorIcon />
          시스템 설정
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
