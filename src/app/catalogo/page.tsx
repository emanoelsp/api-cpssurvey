"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { ChevronDown, ChevronUp, X, RefreshCw } from "lucide-react"

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface RotaAPI {
  id: string
  nome: string
  tipo: string
  descricao: string
  url: string
  dataAdicionado: any
  tipoConexao: string
  dadosObtidos: number
}

interface LeituraAPI {
  timestamp: Date
  dados: any
}

export default function CatalogoPage() {
  const router = useRouter()
  const [rotas, setRotas] = useState<RotaAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [consultandoAPI, setConsultandoAPI] = useState<string | null>(null)
  const [leituras, setLeituras] = useState<LeituraAPI[]>([])
  const [isConsultando, setIsConsultando] = useState(false)
  const [consultaError, setConsultaError] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Buscar rotas do Firebase
  useEffect(() => {
    const fetchRotas = async () => {
      try {
        const rotasCollection = collection(db, "catalogoRotas")
        const rotasSnapshot = await getDocs(rotasCollection)
        const rotasList = rotasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RotaAPI[]

        setRotas(rotasList)
      } catch (error) {
        console.error("Erro ao buscar rotas:", error)
        setError("Falha ao carregar o catálogo de rotas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRotas()
  }, [])

  // Limpar intervalo ao desmontar o componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Data desconhecida"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Data inválida"
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const consultarAPI = async (rotaId: string) => {
    // Se já estiver consultando a mesma API, para a consulta
    if (consultandoAPI === rotaId && isConsultando) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsConsultando(false)
      return
    }

    // Limpa consulta anterior se estiver consultando outra API
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const rota = rotas.find((r) => r.id === rotaId)
    if (!rota) return

    setConsultandoAPI(rotaId)
    setLeituras([])
    setConsultaError("")
    setIsConsultando(true)
    setExpandedCard(rotaId)

    // Função para buscar dados da API
    const fetchData = async () => {
      try {
        const response = await fetch(rota.url)
        if (!response.ok) {
          throw new Error(`Erro ao consultar API: ${response.status}`)
        }
        const data = await response.json()

        // Adiciona nova leitura ao início do array (mais recente primeiro)
        setLeituras((prev) => {
          const novaLeitura = { timestamp: new Date(), dados: data }
          // Limita a 10 leituras para não sobrecarregar a interface
          const novasLeituras = [novaLeitura, ...prev].slice(0, 10)
          return novasLeituras
        })
      } catch (error) {
        console.error("Erro ao consultar API:", error)
        setConsultaError(`Falha ao consultar API: ${error instanceof Error ? error.message : String(error)}`)
        // Para a consulta em caso de erro
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsConsultando(false)
      }
    }

    // Faz a primeira consulta imediatamente
    await fetchData()

    // Configura o intervalo para consultas a cada segundo
    intervalRef.current = setInterval(fetchData, 1000)
  }

  const pararConsulta = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsConsultando(false)
  }

  const toggleCardExpansion = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)

    // Se fechar o card que está sendo consultado, para a consulta
    if (expandedCard === id && isConsultando && consultandoAPI === id) {
      pararConsulta()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Rotas</h1>
        <button
          onClick={() => router.push("/conformidade")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nova Federação
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : rotas.length > 0 ? (
        <div className="space-y-4">
          {rotas.map((rota) => (
            <div key={rota.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div
                className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center cursor-pointer"
                onClick={() => toggleCardExpansion(rota.id)}
              >
                <div>
                  <h2 className="font-bold text-lg truncate" title={rota.nome}>
                    {rota.nome}
                  </h2>
                  <p className="text-sm text-gray-500">{rota.tipo}</p>
                </div>
                <div>
                  {expandedCard === rota.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>

              {expandedCard === rota.id && (
                <div className="p-4">
                  <p className="text-sm mb-3">{rota.descricao}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                    <div>
                      <span className="font-semibold">URL:</span>
                      <span className="ml-1 break-all">{rota.url}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Tipo de Conexão:</span>
                      <span className="ml-1">{rota.tipoConexao}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Registros:</span>
                      <span className="ml-1">{rota.dadosObtidos}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Adicionado em:</span>
                      <span className="ml-1">{formatDate(rota.dataAdicionado)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <button
                      className={`flex items-center px-4 py-2 rounded text-white ${
                        isConsultando && consultandoAPI === rota.id
                          ? "bg-red-500 hover:bg-red-700"
                          : "bg-blue-500 hover:bg-blue-700"
                      }`}
                      onClick={() => consultarAPI(rota.id)}
                    >
                      {isConsultando && consultandoAPI === rota.id ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Parar Consulta
                        </>
                      ) : (
                        <>
                          <RefreshCw
                            className={`h-4 w-4 mr-1 ${isConsultando && consultandoAPI === rota.id ? "animate-spin" : ""}`}
                          />
                          Consultar API
                        </>
                      )}
                    </button>
                  </div>

                  {consultaError && consultandoAPI === rota.id && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                      {consultaError}
                    </div>
                  )}

                  {consultandoAPI === rota.id && leituras.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-sm mb-2">Série Temporal de Leituras</h3>
                      <div className="border rounded overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b">
                          <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                            <div>Timestamp</div>
                            <div className="col-span-3">Dados</div>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {leituras.map((leitura, index) => (
                            <div
                              key={index}
                              className={`px-4 py-2 text-xs ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b last:border-b-0`}
                            >
                              <div className="grid grid-cols-4 gap-2">
                                <div className="font-mono">{formatTimestamp(leitura.timestamp)}</div>
                                <div className="col-span-3 overflow-x-auto">
                                  <pre className="text-xs whitespace-pre-wrap break-words">
                                    {JSON.stringify(leitura.dados, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma rota encontrada no catálogo</p>
          <p className="text-sm text-gray-400">Adicione uma nova federação para começar</p>
        </div>
      )}
    </div>
  )
}
