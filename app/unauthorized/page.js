"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <h1 className="page-title" style={{ color: 'var(--error)' }}>Access Denied</h1>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    You do not have permission to view this page. This area is restricted to teachers only.
                </p>
                <div className="flex-row" style={{ justifyContent: 'center', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => router.push("/student")}
                    >
                        Go to Student Mode
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => router.push("/")}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}
