import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodbConfig';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("federatedb");
    const collection = db.collection("cps-routing");

    const data = await collection.find({}).toArray();

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

