import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">JobBoard</Link>
        <div className="space-x-4">
          <Link href="/jobs">Jobs</Link>
          <Link href="/employer">Employer</Link>
        </div>
      </div>
    </nav>
  )
}
