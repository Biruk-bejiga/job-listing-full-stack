import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Job Listing',
  description: 'Full stack job listing app'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-gray-50 text-gray-900">
            {children}
        </div>
       
      </body>
    </html>
  )
}
