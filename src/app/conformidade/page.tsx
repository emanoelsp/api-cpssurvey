"use client"

import { useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle } from "lucide-react"

export default function ConformidadePage() {
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
      setError("Você precisa aceitar os termos e condições para continuar.")
      return
    }

    if (!(lgpdCompliance || gdprCompliance || ccpaCompliance)) {
      setError("Você precisa selecionar pelo menos uma legislação aplicável.")
      return
    }

    if (!fileUploaded) {
      setError("Você precisa fazer upload do contrato de dados.")
      return
    }

    // Redireciona para a página de federação
    router.push("/federacao")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simulação de Conformidade</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-xl mb-2">Termos e Acordos</h2>
          <div className="border p-4 mb-4 rounded">
            <p className="text-sm text-gray-600">
              Ao aceitar estes termos, você concorda em cumprir todas as leis e regulamentos aplicáveis à proteção de
              dados pessoais e privacidade. Você confirma que tem autoridade para processar os dados que está prestes a
              compartilhar.
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
            <label htmlFor="terms">Eu aceito os termos e condições</label>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl mb-2">Legislação Aplicável</h2>
          <p className="text-sm text-gray-600 mb-2">
            Selecione as leis de proteção de dados que se aplicam aos seus dados:
          </p>
          <div className="mb-2">
            <div className="flex items-center mb-2">
              <input
                id="lgpd"
                type="checkbox"
                className="mr-2"
                checked={lgpdCompliance}
                onChange={(e) => setLgpdCompliance(e.target.checked)}
              />
              <label htmlFor="lgpd">LGPD (Lei Geral de Proteção de Dados - Brasil)</label>
            </div>
            <div className="flex items-center mb-2">
              <input
                id="gdpr"
                type="checkbox"
                className="mr-2"
                checked={gdprCompliance}
                onChange={(e) => setGdprCompliance(e.target.checked)}
              />
              <label htmlFor="gdpr">GDPR (General Data Protection Regulation - Europa)</label>
            </div>
            <div className="flex items-center">
              <input
                id="ccpa"
                type="checkbox"
                className="mr-2"
                checked={ccpaCompliance}
                onChange={(e) => setCcpaCompliance(e.target.checked)}
              />
              <label htmlFor="ccpa">CCPA (California Consumer Privacy Act - EUA)</label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl mb-2">Contrato de Dados</h2>
          <p className="text-sm text-gray-600 mb-2">Faça upload do contrato de dados ou documento de consentimento:</p>
          <div className="flex items-center gap-4">
            <input id="contract" type="file" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => document.getElementById("contract")?.click()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Selecionar arquivo
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
            Prosseguir
          </button>
        </div>
      </div>
    </div>
  )
}
