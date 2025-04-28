"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { firestore } from "@/lib/firebaseConfig"
import { ChevronDown, ChevronUp, X, RefreshCw, AlertTriangle } from "lucide-react"

interface Route {
  id: string
  name: string
  type: string
  description: string
  url: string
  dateAdded: any
  connectionType: string
  dataCount: number
}

interface Reading {
  timestamp: Date
  data: any
}

export default function CatalogPage() {
  const router = useRouter()
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [queryingAPI, setQueryingAPI] = useState<string | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [isQuerying, setIsQuerying] = useState(false)
  const [queryError, setQueryError] = useState("")
  const [showComplianceModal, setShowComplianceModal] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [complianceChecked, setComplianceChecked] = useState({
    terms: false,
    gdpr: false,
    purpose: false,
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Fetch routes from Firebase
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routesCollection = collection(firestore, "catalogoRotas")
        const routesSnapshot = await getDocs(routesCollection)
        const routesList = routesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Route[]

        setRoutes(routesList)
      } catch (error) {
        console.error("Error fetching routes:", error)
        setError("Failed to load routes catalog")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoutes()
  }, [])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const handleComplianceCheck = (routeId: string) => {
    setSelectedRouteId(routeId)
    setComplianceChecked({
      terms: false,
      gdpr: false,
      purpose: false,
    })
    setShowComplianceModal(true)
  }

  const handleComplianceSubmit = () => {
    if (!complianceChecked.terms || !complianceChecked.gdpr || !complianceChecked.purpose) {
      alert("You must accept all compliance items to proceed")
      return
    }

    setShowComplianceModal(false)
    if (selectedRouteId) {
      queryAPI(selectedRouteId)
    }
  }

  const queryAPI = async (routeId: string) => {
    // If already querying the same API, stop the query
    if (queryingAPI === routeId && isQuerying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsQuerying(false)
      return
    }

    // Clear previous query if querying another API
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const route = routes.find((r) => r.id === routeId)
    if (!route) return

    setQueryingAPI(routeId)
    setReadings([])
    setQueryError("")
    setIsQuerying(true)
    setExpandedCard(routeId)

    // Function to fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch(route.url)
        if (!response.ok) {
          throw new Error(`Error querying API: ${response.status}`)
        }
        const data = await response.json()

        // Add new reading to the beginning of the array (most recent first)
        setReadings((prev) => {
          const newReading = { timestamp: new Date(), data: data }
          // Limit to 10 readings to avoid overloading the interface
          const newReadings = [newReading, ...prev].slice(0, 10)
          return newReadings
        })
      } catch (error) {
        console.error("Error querying API:", error)
        setQueryError(`Failed to query API: ${error instanceof Error ? error.message : String(error)}`)
        // Stop the query in case of error
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsQuerying(false)
      }
    }

    // Make the first query immediately
    await fetchData()

    // Set up interval for queries every second
    intervalRef.current = setInterval(fetchData, 1000)
  }

  const stopQuery = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsQuerying(false)
  }

  const toggleCardExpansion = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)

    // If closing the card that is being queried, stop the query
    if (expandedCard === id && isQuerying && queryingAPI === id) {
      stopQuery()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Routes Catalog</h1>
        <button
          onClick={() => router.push("/compliance")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          New Federation
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : routes.length > 0 ? (
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleCardExpansion(route.id)}
                >
                  <div className="flex-1">
                    <h2 className="font-bold text-lg truncate" title={route.name}>
                      {route.name}
                    </h2>
                    <div className="flex items-center mt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{route.type}</span>
                      <span className="text-xs text-gray-500 ml-2">{route.connectionType}</span>
                      <span className="text-xs text-gray-500 ml-2">{route.dataCount} records</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{route.description}</p>
                  </div>
                  <div>
                    {expandedCard === route.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {expandedCard === route.id && (
                <div className="p-4">
                  <p className="text-sm mb-3">{route.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                    <div>
                      <span className="font-semibold">URL:</span>
                      <span className="ml-1 break-all">{route.url}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Connection Type:</span>
                      <span className="ml-1">{route.connectionType}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Records:</span>
                      <span className="ml-1">{route.dataCount}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Added on:</span>
                      <span className="ml-1">{formatDate(route.dateAdded)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <button
                      className={`flex items-center px-4 py-2 rounded text-white ${
                        isQuerying && queryingAPI === route.id
                          ? "bg-red-500 hover:bg-red-700"
                          : "bg-blue-500 hover:bg-blue-700"
                      }`}
                      onClick={() =>
                        isQuerying && queryingAPI === route.id ? stopQuery() : handleComplianceCheck(route.id)
                      }
                    >
                      {isQuerying && queryingAPI === route.id ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Stop Query
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Query API
                        </>
                      )}
                    </button>
                  </div>

                  {queryError && queryingAPI === route.id && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                      {queryError}
                    </div>
                  )}

                  {queryingAPI === route.id && readings.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-sm mb-2">Time Series Readings</h3>
                      <div className="border rounded overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b">
                          <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                            <div>Timestamp</div>
                            <div className="col-span-3">Data</div>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {readings.map((reading, index) => (
                            <div
                              key={index}
                              className={`px-4 py-2 text-xs ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b last:border-b-0`}
                            >
                              <div className="grid grid-cols-4 gap-2">
                                <div className="font-mono">{formatTimestamp(reading.timestamp)}</div>
                                <div className="col-span-3 overflow-x-auto">
                                  <pre className="text-xs whitespace-pre-wrap break-words">
                                    {JSON.stringify(reading.data, null, 2)}
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
          <p className="text-gray-500 mb-4">No routes found in the catalog</p>
          <p className="text-sm text-gray-400">Add a new federation to get started</p>
        </div>
      )}

      {/* Compliance Modal */}
      {showComplianceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Data Access Compliance</h2>
              <button onClick={() => setShowComplianceModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-3 p-2 bg-yellow-50 rounded">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm text-gray-700">
                  You must confirm compliance with data protection regulations before accessing this data.
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-start">
                  <input
                    id="terms-modal"
                    type="checkbox"
                    className="mt-1 mr-2"
                    checked={complianceChecked.terms}
                    onChange={(e) => setComplianceChecked({ ...complianceChecked, terms: e.target.checked })}
                  />
                  <label htmlFor="terms-modal" className="text-sm">
                    I confirm that I have the authority to access this data and will handle it in accordance with all
                    applicable laws.
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="gdpr-modal"
                    type="checkbox"
                    className="mt-1 mr-2"
                    checked={complianceChecked.gdpr}
                    onChange={(e) => setComplianceChecked({ ...complianceChecked, gdpr: e.target.checked })}
                  />
                  <label htmlFor="gdpr-modal" className="text-sm">
                    I will process this data in compliance with GDPR, LGPD, CCPA, and other relevant data protection
                    regulations.
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="purpose-modal"
                    type="checkbox"
                    className="mt-1 mr-2"
                    checked={complianceChecked.purpose}
                    onChange={(e) => setComplianceChecked({ ...complianceChecked, purpose: e.target.checked })}
                  />
                  <label htmlFor="purpose-modal" className="text-sm">
                    I will only use this data for the specific purpose for which it was shared and will not transfer it
                    to unauthorized parties.
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowComplianceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleComplianceSubmit}
                className={`px-4 py-2 rounded text-white bg-blue-500 ${
                  !complianceChecked.terms || !complianceChecked.gdpr || !complianceChecked.purpose
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
                disabled={!complianceChecked.terms || !complianceChecked.gdpr || !complianceChecked.purpose}
              >
                Confirm & Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
