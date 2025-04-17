import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodbConfig';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseConfig';

export async function POST(request: NextRequest) {
  try {
    const { selectedEquipment, connectionInfo } = await request.json();

    // Save selected equipment data to Firebase
    for (const equipment of selectedEquipment) {
      await addDoc(collection(firestore, 'equipment'), equipment);
    }

    // Save connection info to MongoDB
    const client = await clientPromise;
    const db = client.db('your_database_name');
    const routesCollection = db.collection('routes');

    for (const equipment of selectedEquipment) {
      await routesCollection.insertOne({
        equipmentId: equipment.id,
        ...connectionInfo
      });
    }

    return NextResponse.json({ success: true, message: 'Federation completed successfully' });
  } catch (error) {
    console.error('Federation error:', error);
    return NextResponse.json({ success: false, message: 'Federation failed' }, { status: 500 });
  }
}

