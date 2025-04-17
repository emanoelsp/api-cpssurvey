import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Data Space para Indústria 4.0</h1>
      <div className="space-y-4">
        <Link href="/catalogo" className="block">
          <button className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Consultar Catálogo de Equipamentos Federados
          </button>
        </Link>
        <Link href="/conformidade" className="block">
          <button className="w-full px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Criar uma Nova Federação
          </button>
        </Link>
      </div>
    </div>
  )
}

