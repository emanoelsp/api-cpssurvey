"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc } from "firebase/firestore"
import { firestore } from "@/lib/firebaseConfig"
import { Database, Upload, Search, X } from "lucide-react"

// API types
const API_TYPES = ["REST", "GraphQL", "SOAP", "OPC-UA", "MQTT", "WebSocket", "Other"]

// Interface for API data
interface ApiDataItem {
  [key: string]: unknown
}

export default function FederationPage() {
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
      setError("Please enter a valid URL")
      return
    }

    if (!apiName) {
      setError("Please enter an API name")
      return
    }

    if (!apiDescription) {
      setError("Please enter an API description")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`)
      }
      const data = await response.json()

      // Check if data is an array or convert object to array
      const dataArray = Array.isArray(data) ? data : [data]
      setApiData(dataArray)
      setStep(3)
    } catch (error) {
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const performExchange = async () => {
    try {
      // Add entry to Firebase using the imported firestore
      await addDoc(collection(firestore, "catalogoRotas"), {
        name: apiName,
        type: apiType,
        description: apiDescription,
        url: apiUrl,
        dateAdded: new Date(),
        connectionType: connectionType,
        dataCount: apiData.length,
      })

      alert("Exchange completed successfully! Route added to catalog.")
      router.push("/catalog")
    } catch (error) {
      console.error("Error saving to Firebase:", error)
      setError(`Error performing exchange: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data Federation</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {step === 1 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl mb-4">Choose Connection Type</h2>
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
              Database
            </button>
            <button
              onClick={() => handleConnectionTypeSelect("file")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              File
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/compliance")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Back to Compliance
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl mb-4">Connection Configuration</h2>

          {connectionType === "restapi" && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiName">
                  API Name
                </label>
                <input
                  id="apiName"
                  type="text"
                  placeholder="E.g.: Product API"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiType">
                  API Type
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
                  API Description
                </label>
                <textarea
                  id="apiDescription"
                  placeholder="Describe the purpose and data of this API"
                  value={apiDescription}
                  onChange={(e) => setApiDescription(e.target.value)}
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiUrl">
                  API URL
                </label>
                <div className="relative">
                  <input
                    id="apiUrl"
                    type="text"
                    placeholder="https://api.example.com/data"
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
                  Back
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
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Fetch Data
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
                <p className="text-sm text-gray-500">Database connection not implemented in this demo</p>
              </div>
            </div>
          )}

          {connectionType === "file" && (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center gap-1 text-center">
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500">File upload not implemented in this demo</p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <h2 className="text-xl mb-4">API Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
              <div>
                <p className="text-sm font-semibold">Name:</p>
                <p className="text-gray-700">{apiName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Type:</p>
                <p className="text-gray-700">{apiType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold">Description:</p>
                <p className="text-gray-700">{apiDescription}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold">URL:</p>
                <p className="text-gray-700 break-all">{apiUrl}</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl mb-4">Retrieved Data</h2>

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
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center border border-dashed rounded">
              <p className="text-gray-500">No data available</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Back
            </button>
            <button
              onClick={performExchange}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Database className="h-5 w-5" />
              Complete Exchange
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
