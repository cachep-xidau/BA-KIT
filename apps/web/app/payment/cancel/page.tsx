'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { MinusCircle } from 'lucide-react';
import Link from 'next/link';

function CancelContent() {
    const params = useSearchParams();
    const order = params.get('order') || 'Unknown';

    return (
        <div style={{
            maxWidth: '24rem', margin: '6rem auto', padding: '0 1.5rem',
            textAlign: 'center',
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#f59e0b20', border: '2px solid #f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
            }}>
                <MinusCircle size={32} style={{ color: '#f59e0b' }} />
            </div>
            <h1 style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: '0.5rem',
            }}>
                Đã hủy thanh toán
            </h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                Order: <strong style={{ color: 'var(--text-secondary)' }}>{order}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Link href="/payment" style={{
                    display: 'inline-block', padding: '0.625rem 1.5rem',
                    background: '#6366f1', color: 'white', borderRadius: '0.5rem',
                    textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem',
                }}>
                    Try Again
                </Link>
                <Link href="/" style={{
                    display: 'inline-block', padding: '0.625rem 1.5rem',
                    background: 'var(--bg-input)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem', textDecoration: 'none',
                    fontWeight: 600, fontSize: '0.9375rem',
                }}>
                    Dashboard
                </Link>
            </div>
        </div>
    );
}

export default function PaymentCancelPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem' }}>Loading...</div>}>
            <CancelContent />
        </Suspense>
    );
}
