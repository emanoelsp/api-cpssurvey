import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseConfig'; // Ajuste conforme o caminho correto do seu arquivo de configuração Firebase
import fs from 'fs'
import path from 'path'


export async function GET() {
  try {
    // Obter todos os documentos da coleção 'CPS-SURVEY'
    const querySnapshot = await getDocs(collection(firestore, 'cps-catalog'));
    const cpsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir)
    }
    fs.writeFileSync(path.join(dataDir, 'cps-data.json'), JSON.stringify(cpsData, null, 2))

    return NextResponse.json(cpsData, {
      headers: {
        'Access-Control-Allow-Origin': '*', // Permite acesso de qualquer origem
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados da coleção CPS-SURVEY:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar dados da coleção CPS-SURVEY', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
