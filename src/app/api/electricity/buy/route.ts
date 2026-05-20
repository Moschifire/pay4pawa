import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const { userId, meterId, amount } = await request.json();

        // Generate Token
        const token = Array.from({ length: 5 }, () =>
            Math.floor(1000 + Math.random() * 9000)
        ).join('-');

        const batch = adminDb.batch();

        // 1. Log Transaction
        const transRef = adminDb.collection("transactions").doc();
        batch.set(transRef, {
            userId,
            meterId,
            amount,
            token,
            status: 'success',
            timestamp: Date.now(),
        });

        // 2. Update Meter
        const meterRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('meters')
            .doc(meterId);

        batch.update(meterRef, {
            lastBalance: FieldValue.increment(amount / 100),
            lastToken: token,
            updatedAt: Date.now()
        });

        await batch.commit();

        return NextResponse.json({ success: true, token });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}