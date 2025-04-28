"use client"

import { useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle } from "lucide-react"

export default function CompliancePage() {
  const router = useRouter()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lgpdCompliance, setLgpdCompliance] = useState(false)
  const [gdprCompliance, setGdprCompliance] = useState(false)
  const [ccpaCompliance, setCcpaCompliance] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileUploaded(true)
      setFileName(e.target.files[0].name)
    }
  }

  const handleProceed = () => {
    if (!termsAccepted) {
      setError("You must accept the terms and conditions to continue.")
      return
    }

    if (!(lgpdCompliance || gdprCompliance || ccpaCompliance)) {
      setError("You must select at least one applicable regulation.")
      return
    }

    if (!fileUploaded) {
      setError("You must upload a data contract.")
      return
    }

    // Redirect to federation page
    router.push("/federation")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Compliance Verification</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-xl mb-2">Terms and Agreements</h2>
          <div className="border p-4 mb-4 rounded">
            <p className="text-sm text-gray-600">
              By accepting these terms, you agree to comply with all applicable laws and regulations regarding personal
              data protection and privacy. You confirm that you have the authority to process the data you are about to
              share.
            </p>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="terms"
              type="checkbox"
              className="mr-2"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">I accept the terms and conditions</label>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl mb-2">Applicable Regulations</h2>
          <p className="text-sm text-gray-600 mb-2">Select the data protection laws that apply to your data:</p>
          <div className="mb-2">
            <div className="flex items-center mb-2">
              <input
                id="lgpd"
                type="checkbox"
                className="mr-2"
                checked={lgpdCompliance}
                onChange={(e) => setLgpdCompliance(e.target.checked)}
              />
              <label htmlFor="lgpd">LGPD (General Data Protection Law - Brazil)</label>
            </div>
            <div className="flex items-center mb-2">
              <input
                id="gdpr"
                type="checkbox"
                className="mr-2"
                checked={gdprCompliance}
                onChange={(e) => setGdprCompliance(e.target.checked)}
              />
              <label htmlFor="gdpr">GDPR (General Data Protection Regulation - Europe)</label>
            </div>
            <div className="flex items-center">
              <input
                id="ccpa"
                type="checkbox"
                className="mr-2"
                checked={ccpaCompliance}
                onChange={(e) => setCcpaCompliance(e.target.checked)}
              />
              <label htmlFor="ccpa">CCPA (California Consumer Privacy Act - USA)</label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl mb-2">Data Contract</h2>
          <p className="text-sm text-gray-600 mb-2">Upload your data contract or consent document:</p>
          <div className="flex items-center gap-4">
            <input id="contract" type="file" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => document.getElementById("contract")?.click()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Select file
            </button>
            {fileUploaded && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="mr-1 h-4 w-4" />
                {fileName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleProceed}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${
              !termsAccepted || !(lgpdCompliance || gdprCompliance || ccpaCompliance) || !fileUploaded
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
