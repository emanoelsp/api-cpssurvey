'use client'

import React, { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebaseConfig';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';

// Definindo a interface dos dados
interface CPSData {
  id: string;
  tipo: string;
  localizacao: string;
  status: string;
  velocidade: number;
  protocolo: string;
}

export default function Dashboard() {
  const [cpsData, setCpsData] = useState<CPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [apiConfig, setApiConfig] = useState({ ip: '', port: '' });
  const [federate, setFederate] = useState<Map<string, boolean>>(new Map());
  const [exchangeStatus, setExchangeStatus] = useState('');

  // Função para buscar dados da API
  const fetchData = async () => {
    if (!apiConfig.ip || !apiConfig.port) {
      alert("Por favor, insira o IP e a porta.");
      return;
    }
    
    setLoading(true); // Inicia o carregamento
    try {
      const response = await fetch(`http://${apiConfig.ip}:${apiConfig.port}/api/cps-data`);

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.statusText}`);
      }

      const data: CPSData[] = await response.json();
      setCpsData(data);

      // Inicializa o mapeamento de federação
      const initialFederateState = new Map(data.map(item => [item.id, false]));
      setFederate(initialFederateState);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Erro ao consumir a API:', error.message);
      } else {
        console.error('Erro desconhecido:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async () => {
    const federatedItems = cpsData.filter(item => federate.get(item.id));
  
    if (federatedItems.length === 0) {
      setExchangeStatus('Nenhum dado foi federado.');
      return;
    }
  
    try {
      const batch = writeBatch(firestore);
  
      federatedItems.forEach(item => {
        const docRef = doc(collection(firestore, 'CPS-SURVEY'), item.id);
        batch.set(docRef, item);
      });
  
      await batch.commit();
  
      setExchangeStatus('Dados federados e adicionados ao Firestore.');
      console.log('Dados federados e salvos:', federatedItems);
    } catch (error) {
      setExchangeStatus('Erro ao federar e salvar dados no Firestore.');
      console.error('Erro ao salvar dados federados:', error);
    }
  };

  if (showTerms) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow-lg w-1/2">
          <h1 className="text-xl font-bold mb-4">Termos e Condições</h1>
          <p className="mb-4">
            Ao utilizar este sistema, você concorda com os termos e condições e as políticas de acesso
            para uso do CPS. [Conteúdo completo dos termos e condições]
          </p>
          <div className="flex justify-between">
            <button 
              onClick={() => setTermsAccepted(true)} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Aceitar
            </button>
            <button 
              onClick={() => setShowTerms(false)} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!termsAccepted) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <h1 className="text-xl font-bold text-center">Por favor, aceite os termos e condições para continuar</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configuração CPS</h1>

      {/* Configuração do IP e Porta da API */}
      <div className="mb-6">
        <div className="mb-4">
          <label htmlFor="ip" className="block text-lg font-medium text-gray-700">IP da API:</label>
          <input
            id="ip"
            type="text"
            value={apiConfig.ip}
            onChange={(e) => setApiConfig({ ...apiConfig, ip: e.target.value })}
            placeholder="Digite o IP da API"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="port" className="block text-lg font-medium text-gray-700">Porta da API:</label>
          <input
            id="port"
            type="text"
            value={apiConfig.port}
            onChange={(e) => setApiConfig({ ...apiConfig, port: e.target.value })}
            placeholder="Digite a porta da API"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
      </div>

      {/* Botão para buscar os dados */}
      <div className="flex justify-center mb-6">
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Buscar Dados
        </button>
      </div>

      {/* Carregando ou Listando os Dados */}
      {loading && <p className="text-center text-gray-600">Carregando dados...</p>}
      
      {!loading && cpsData.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Dados CPS</h2>
          <table className="w-full table-auto border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Localização</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Velocidade</th>
                <th className="px-4 py-2 text-left">Protocólo</th>
                <th className="px-4 py-2 text-left">Federar</th>
              </tr>
            </thead>
            <tbody>
              {cpsData.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.tipo}</td>
                  <td className="px-4 py-2">{item.localizacao}</td>
                  <td className="px-4 py-2">{item.status}</td>
                  <td className="px-4 py-2">{item.velocidade}</td>
                  <td className="px-4 py-2">{item.protocolo}</td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={federate.get(item.id)}
                      onChange={() =>
                        setFederate(new Map(federate.set(item.id, !federate.get(item.id))))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botão para realizar a troca de dados */}
      <div className="flex justify-center">
        <button
          onClick={handleExchange}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Realizar Exchange
        </button>
      </div>

      {exchangeStatus && (
        <p className="mt-4 text-center text-green-600">{exchangeStatus}</p>
      )}
    </div>
  );
}
