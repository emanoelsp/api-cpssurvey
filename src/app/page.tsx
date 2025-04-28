import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Data Space for Industry 4.0</h1>
      <div className="space-y-4">
        <Link href="/catalog" className="block">
          <button className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Browse Federated Data Catalog
          </button>
        </Link>
        <Link href="/compliance" className="block">
          <button className="w-full px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Create New Federation
          </button>
        </Link>
      </div>
    </div>
  )
}
