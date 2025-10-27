import './globals.css'
import { ReactNode } from 'react'
import Providers from '../components/Providers'

export const metadata = {
  title: 'Job Listing',
  description: 'Full stack job listing app'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="bg-gray-50 text-gray-900">
              {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
