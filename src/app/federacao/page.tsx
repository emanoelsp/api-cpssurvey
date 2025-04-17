"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { Database, Upload, Search, X } from "lucide-react"

// Configuração do Firebase (substitua com suas credenciais)
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

// Tipos de API
const API_TYPES = ["REST", "GraphQL", "SOAP", "OPC-UA", "MQTT", "WebSocket", "gRPC", "Outro"]

// Interface para os dados da API
interface ApiDataItem {
  [key: string]: unknown
}

export default function FederacaoPage() {
  const router = useRouter()
  const [connectionType, setConnectionType] = useState<"restapi" | "database" | "file">("restapi")
  const [apiUrl, setApiUrl] = useState("")
  const [apiName, setApiName] = useState("")
  const [apiType, setApiType] = useState(API_TYPES[0])
  const [apiDescription, setApiDescription] = useState("")
  const [apiData, setApiData] = useState<ApiDataItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const handleConnectionTypeSelect = (type: "restapi" | "database" | "file") => {
    setConnectionType(type)
    setStep(2)
  }

  const fetchApiData = async () => {
    if (!apiUrl) {
      setError("Por favor, insira uma URL válida")
      return
    }

    if (!apiName) {
      setError("Por favor, insira um nome para a API")
      return
    }

    if (!apiDescription) {
      setError("Por favor, insira uma descrição para a API")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }
      const data = await response.json()

      // Verifica se os dados são um array ou converte objeto para array
      const dataArray = Array.isArray(data) ? data : [data]
      setApiData(dataArray)
      setStep(3)
    } catch (error) {
      setError(`Falha ao buscar dados: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const realizarExchange = async () => {
    try {
      // Adiciona entrada no Firebase
      await addDoc(collection(db, "catalogoRotas"), {
        nome: apiName,
        tipo: apiType,
        descricao: apiDescription,
        url: apiUrl,
        dataAdicionado: new Date(),
        tipoConexao: connectionType,
        dadosObtidos: apiData.length,
      })

      alert("Exchange realizado com sucesso! Rota adicionada ao catálogo.")
      router.push("/catalogo") // Redireciona para o catálogo após o sucesso
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error)
      setError(`Erro ao realizar exchange: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Federação de Dados</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {step === 1 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl mb-4">Escolha o Tipo de Conexão</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleConnectionTypeSelect("restapi")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              REST API
            </button>
            <button
              onClick={() => handleConnectionTypeSelect("database")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Database className="h-5 w-5" />
              Banco de Dados
            </button>
            <button
              onClick={() => handleConnectionTypeSelect("file")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Arquivo
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/conformidade")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Voltar para Conformidade
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl mb-4">Configuração de Conexão</h2>

          {connectionType === "restapi" && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiName">
                  Nome da API
                </label>
                <input
                  id="apiName"
                  type="text"
                  placeholder="Ex: API de Produtos"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiType">
                  Tipo da API
                </label>
                <select
                  id="apiType"
                  value={apiType}
                  onChange={(e) => setApiType(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {API_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiDescription">
                  Descrição da API
                </label>
                <textarea
                  id="apiDescription"
                  placeholder="Descreva a finalidade e os dados desta API"
                  value={apiDescription}
                  onChange={(e) => setApiDescription(e.target.value)}
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiUrl">
                  URL da API
                </label>
                <div className="relative">
                  <input
                    id="apiUrl"
                    type="text"
                    placeholder="https://api.exemplo.com/dados"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  />
                  {apiUrl && (
                    <button
                      onClick={() => setApiUrl("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Voltar
                </button>
                <button
                  onClick={fetchApiData}
                  disabled={isLoading || !apiUrl || !apiName || !apiDescription}
                  className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 ${
                    isLoading || !apiUrl || !apiName || !apiDescription
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Buscar Dados
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {connectionType === "database" && (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center gap-1 text-center">
                <Database className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500">Conexão com banco de dados não implementada nesta simulação</p>
              </div>
            </div>
          )}

          {connectionType === "file" && (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center gap-1 text-center">
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500">Upload de arquivo não implementado nesta simulação</p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <h2 className="text-xl mb-4">Detalhes da API</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
              <div>
                <p className="text-sm font-semibold">Nome:</p>
                <p className="text-gray-700">{apiName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Tipo:</p>
                <p className="text-gray-700">{apiType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold">Descrição:</p>
                <p className="text-gray-700">{apiDescription}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold">URL:</p>
                <p className="text-gray-700 break-all">{apiUrl}</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl mb-4">Dados Obtidos</h2>

          {apiData.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    {Object.keys(apiData[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left border border-gray-300">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apiData.map((item, index) => (
                    <tr key={index} className="border-t">
                      {Object.values(item).map((value: unknown, i) => (
                        <td key={i} className="px-4 py-2 border border-gray-300">
                          {typeof value === "object"
                            ? JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? "..." : "")
                            : String(value).substring(0, 50) + (String(value).length > 50 ? "..." : "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center border border-dashed rounded">
              <p className="text-gray-500">Nenhum dado disponível</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Voltar
            </button>
            <button
              onClick={realizarExchange}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Database className="h-5 w-5" />
              Realizar Exchange
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
