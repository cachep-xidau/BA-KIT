'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const params = useSearchParams();
    const order = params.get('order') || 'Unknown';

    return (
        <div style={{
            maxWidth: '24rem', margin: '6rem auto', padding: '0 1.5rem',
            textAlign: 'center',
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#10b98120', border: '2px solid #10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
            }}>
                <CheckCircle2 size={32} style={{ color: '#10b981' }} />
            </div>
            <h1 style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: '0.5rem',
            }}>
                Thanh toán thành công!
            </h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                Order: <strong style={{ color: 'var(--text-secondary)' }}>{order}</strong>
            </p>
            <p style={{
                fontSize: '0.8125rem', color: 'var(--text-dim)',
                marginBottom: '2rem',
            }}>
                🔒 Sandbox — no real money charged
            </p>
            <Link href="/" style={{
                display: 'inline-block', padding: '0.625rem 1.5rem',
                background: '#6366f1', color: 'white', borderRadius: '0.5rem',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem',
            }}>
                Back to Dashboard
            </Link>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem' }}>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
