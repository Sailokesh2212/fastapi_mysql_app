// app/layout.tsx
import type { ReactNode } from "react"
import "./globals.css" // keep or remove if you don't have it

export const metadata = {
  title: "Candidate Profile",
  description: "Job application profile form",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
