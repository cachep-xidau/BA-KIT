'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CreditCard, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PaymentPage() {
    const [amount, setAmount] = useState(50000);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const formRef = useRef<HTMLFormElement>(null);
    const [checkoutData, setCheckoutData] = useState<{
        checkoutUrl: string;
        formFields: Record<string, string>;
    } | null>(null);

    // Auto-submit the hidden form when checkout data arrives
    useEffect(() => {
        if (checkoutData && formRef.current) {
            formRef.current.submit();
        }
    }, [checkoutData]);

    const handleCheckout = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    description: description || `Thanh toán BSA Kit #${Date.now()}`,
                }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to create checkout');
                setLoading(false);
                return;
            }

            // Set checkout data — useEffect will auto-submit the form
            setCheckoutData(data.data);
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    const presetAmounts = [10000, 50000, 100000, 500000];

    return (
        <div style={{
            maxWidth: '28rem', margin: '3rem auto', padding: '0 1.5rem',
        }}>
            <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '2rem',
                textDecoration: 'none',
            }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                padding: '2rem',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '0.625rem',
                        background: '#6366f120', border: '1px solid #6366f130',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CreditCard size={20} style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '1.125rem', fontWeight: 700,
                            color: 'var(--text-primary)', margin: 0,
                        }}>
                            Sandbox Payment
                        </h2>
                        <p style={{
                            fontSize: '0.8125rem', color: 'var(--text-dim)', margin: 0,
                        }}>
                            SePay Bank Transfer (Test Mode)
                        </p>
                    </div>
                </div>

                {/* Amount presets */}
                <label style={{
                    display: 'block', fontSize: '0.875rem', fontWeight: 500,
                    color: 'var(--text-dim)', marginBottom: '0.5rem',
                }}>
                    Amount (VND)
                </label>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem', marginBottom: '0.75rem',
                }}>
                    {presetAmounts.map(a => (
                        <button
                            key={a}
                            onClick={() => setAmount(a)}
                            style={{
                                padding: '0.5rem',
                                fontSize: '0.8125rem', fontWeight: 600,
                                background: amount === a ? '#6366f115' : 'var(--bg-input)',
                                border: amount === a ? '1px solid #6366f150' : '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: amount === a ? '#6366f1' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {a.toLocaleString('vi-VN')}đ
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    min={1000}
                    style={{
                        display: 'block', width: '100%',
                        padding: '0.625rem 0.875rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)', fontSize: '1rem',
                        fontFamily: 'var(--font-sans)',
                        marginBottom: '1rem', outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />

                {/* Description */}
                <label style={{
                    display: 'block', fontSize: '0.875rem', fontWeight: 500,
                    color: 'var(--text-dim)', marginBottom: '0.5rem',
                }}>
                    Description (optional)
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. BSA Kit Pro subscription"
                    style={{
                        display: 'block', width: '100%',
                        padding: '0.625rem 0.875rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)', fontSize: '1rem',
                        fontFamily: 'var(--font-sans)',
                        marginBottom: '1.5rem', outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem', marginBottom: '1rem',
                        background: '#ef444415', border: '1px solid #ef444430',
                        borderRadius: '0.5rem', color: '#ef4444', fontSize: '0.875rem',
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Pay button */}
                <button
                    onClick={handleCheckout}
                    disabled={loading || amount < 1000}
                    style={{
                        width: '100%', padding: '0.75rem',
                        background: loading ? '#6366f180' : '#6366f1',
                        border: 'none', borderRadius: '0.5rem',
                        color: 'white', fontSize: '1rem', fontWeight: 600,
                        cursor: loading ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', transition: 'background 0.15s',
                    }}
                >
                    {loading ? (
                        <><Loader size={18} className="spin" /> Redirecting to SePay...</>
                    ) : (
                        <>Pay {amount.toLocaleString('vi-VN')}đ</>
                    )}
                </button>

                <p style={{
                    textAlign: 'center', fontSize: '0.75rem',
                    color: 'var(--text-dim)', marginTop: '1rem',
                }}>
                    🔒 Sandbox mode — no real money charged
                </p>
            </div>

            {/* Hidden form for SePay redirect */}
            {checkoutData && (
                <form
                    ref={formRef}
                    action={checkoutData.checkoutUrl}
                    method="POST"
                    style={{ display: 'none' }}
                >
                    {Object.entries(checkoutData.formFields).map(([key, value]) => (
                        <input key={key} type="hidden" name={key} value={value} />
                    ))}
                </form>
            )}
        </div>
    );
}
