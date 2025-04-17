import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodbConfig';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("federatedb");
    const collection = db.collection("cps-routing");

    const body = await request.json();

    const result = await collection.insertMany(body);

    return NextResponse.json({ success: true, insertedCount: result.insertedCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: 'Failed to insert documents' }, 
      { status: 500 });
  }
}

