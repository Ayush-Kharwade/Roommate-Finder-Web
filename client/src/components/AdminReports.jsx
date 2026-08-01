import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
    collection, query, where, orderBy, onSnapshot,
    doc, updateDoc, getDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';

const REASON_LABELS = {
    scam: 'Scam or fraud',
    inaccurate: 'Inaccurate or misleading',
    unavailable: 'No longer available',
    offensive: 'Offensive or discriminatory',
    safety: 'Safety concern',
    other: 'Something else',
};

const STATUS_STYLES = {
    open: 'bg-red-100 text-red-700',
    reviewed: 'bg-brand-sand text-brand-ink',
    actioned: 'bg-brand-green/15 text-brand-green',
    dismissed: 'bg-gray-100 text-gray-500',
};

function AdminReports() {
    const currentUser = auth.currentUser;

    const [isAdmin, setIsAdmin] = useState(null); // null = still checking
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('open');

    // Check admin flag on the user document
    useEffect(() => {
        if (!currentUser) {
            setIsAdmin(false);
            return;
        }
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'users', currentUser.uid));
                setIsAdmin(snap.exists() && snap.data().isAdmin === true);
            } catch (err) {
                console.error('Admin check failed:', err);
                setIsAdmin(false);
            }
        })();
    }, [currentUser]);

    // Subscribe to reports once we know we're allowed
    useEffect(() => {
        if (!isAdmin) return;

        const q = statusFilter === 'all'
            ? query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
            : query(
                collection(db, 'reports'),
                where('status', '==', statusFilter),
                orderBy('createdAt', 'desc')
              );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setReports(snap.docs.map(d => ({ ...d.data(), id: d.id })));
                setLoading(false);
            },
            (err) => {
                console.error('Reports listener error:', err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isAdmin, statusFilter]);

    const setStatus = async (reportId, status) => {
        try {
            await updateDoc(doc(db, 'reports', reportId), {
                status,
                reviewedBy: currentUser.uid,
                reviewedAt: new Date(),
            });
            toast.success(`Marked as ${status}.`);
        } catch (err) {
            console.error('Failed to update report:', err);
            toast.error('Could not update the report.');
        }
    };

    if (isAdmin === null) {
        return (
            <div className="flex-grow flex items-center justify-center py-20">
                <ClipLoader color="#1B4D3E" size={40} />
            </div>
        );
    }

    if (!isAdmin) return <Navigate to="/" replace />;

    return (
        <div className="flex-grow bg-brand-cream">
            <SEO title="Reports" />
            <div className="container mx-auto max-w-4xl px-4 py-10">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-ink mb-6">
                    Moderation queue
                </h1>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {['open', 'reviewed', 'actioned', 'dismissed', 'all'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setLoading(true); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                                statusFilter === s
                                    ? 'bg-brand-green text-white'
                                    : 'bg-white text-brand-ink border border-brand-sand hover:bg-brand-sand/40'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <ClipLoader color="#1B4D3E" size={40} />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-sand">
                        <h3 className="text-xl font-semibold text-brand-ink mb-2">Nothing here</h3>
                        <p className="text-gray-500">
                            No {statusFilter === 'all' ? '' : statusFilter} reports right now.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map(r => (
                            <div key={r.id} className="bg-white rounded-xl border border-brand-sand p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] || ''}`}>
                                                {r.status}
                                            </span>
                                            <span className="text-xs text-gray-400 capitalize">{r.targetType}</span>
                                        </div>
                                        <p className="font-semibold text-brand-ink">
                                            {REASON_LABELS[r.reason] || r.reason}
                                        </p>
                                        {r.targetTitle && (
                                            <p className="text-sm text-gray-500 truncate">{r.targetTitle}</p>
                                        )}
                                    </div>
                                    {r.targetType === 'property' && (
                                        <Link
                                            to={`/property/${r.targetId}`}
                                            className="text-sm font-semibold text-brand-green hover:underline flex-shrink-0"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>

                                {r.details && (
                                    <p className="text-sm text-brand-ink bg-brand-cream rounded-lg p-3 mb-3 whitespace-pre-wrap">
                                        {r.details}
                                    </p>
                                )}

                                <p className="text-xs text-gray-400 mb-4">
                                    Reported by {r.reporterName}
                                    {r.createdAt?.toDate && ` · ${r.createdAt.toDate().toLocaleString()}`}
                                </p>

                                <div className="flex gap-2 flex-wrap">
                                    {r.status !== 'reviewed' && (
                                        <button onClick={() => setStatus(r.id, 'reviewed')}
                                            className="px-3 py-1.5 text-sm border border-brand-sand rounded-lg hover:bg-brand-cream">
                                            Mark reviewed
                                        </button>
                                    )}
                                    {r.status !== 'actioned' && (
                                        <button onClick={() => setStatus(r.id, 'actioned')}
                                            className="px-3 py-1.5 text-sm bg-brand-green text-white rounded-lg hover:bg-brand-green-dark">
                                            Actioned
                                        </button>
                                    )}
                                    {r.status !== 'dismissed' && (
                                        <button onClick={() => setStatus(r.id, 'dismissed')}
                                            className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            Dismiss
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminReports;