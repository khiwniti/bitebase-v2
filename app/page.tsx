'use client'

import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to the landing page instead of dashboard for unauthenticated users
  redirect('/landing')
}