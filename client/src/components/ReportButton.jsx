import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const REASONS = [
    { value: 'scam', label: 'Scam or fraud', hint: 'Asking for money upfront, fake listing' },
    { value: 'inaccurate', label: 'Inaccurate or misleading', hint: 'Wrong photos, price, or location' },
    { value: 'unavailable', label: 'No longer available', hint: 'Already rented or taken down' },
    { value: 'offensive', label: 'Offensive or discriminatory', hint: 'Harassment, hate speech, discrimination' },
    { value: 'safety', label: 'Safety concern', hint: 'Threatening behaviour or unsafe situation' },
    { value: 'other', label: 'Something else', hint: '' },
];

/**
 * Report button + modal, reusable across listings, seeker profiles and users.
 *
 * One report per reporter per target (deterministic doc ID) so a single user
 * can't inflate the report count on something they dislike.
 */
function ReportButton({ targetType, targetId, targetTitle, targetOwnerId }) {
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Don't offer a report button on your own content
    if (currentUser && targetOwnerId === currentUser.uid) return null;

    const handleOpen = () => {
        if (!currentUser) {
            toast.error('Please log in to report.');
            navigate('/login');
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setReason('');
        setDetails('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            toast.error('Please choose a reason.');
            return;
        }

        setSubmitting(true);
        try {
            await setDoc(
                doc(db, 'reports', `${targetType}_${targetId}_${currentUser.uid}`),
                {
                    targetType,
                    targetId,
                    targetTitle: targetTitle || '',
                    targetOwnerId: targetOwnerId || null,
                    reporterId: currentUser.uid,
                    reporterName: currentUser.displayName || 'User',
                    reason,
                    details: details.trim().slice(0, 1000),
                    status: 'open',
                    createdAt: serverTimestamp(),
                }
            );
            toast.success('Report submitted. Thank you — we\'ll review it.');
            handleClose();
        } catch (err) {
            console.error('Failed to submit report:', err);
            toast.error('Could not submit the report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="text-sm text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Report
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <div
                        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-1">
                                <h2 className="font-serif text-2xl font-bold text-brand-ink">
                                    Report this {targetType === 'property' ? 'listing' : targetType}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-5">
                                Reports are private. We review each one and act where needed.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <fieldset className="space-y-2 mb-5">
                                    <legend className="text-sm font-semibold text-brand-ink mb-2">
                                        What's the problem?
                                    </legend>
                                    {REASONS.map((r) => (
                                        <label
                                            key={r.value}
                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                reason === r.value
                                                    ? 'border-brand-green bg-brand-cream'
                                                    : 'border-brand-sand hover:bg-brand-cream/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={r.value}
                                                checked={reason === r.value}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="mt-1 accent-brand-green"
                                            />
                                            <span className="min-w-0">
                                                <span className="block text-brand-ink font-medium">{r.label}</span>
                                                {r.hint && (
                                                    <span className="block text-xs text-gray-500">{r.hint}</span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>

                                <label className="block text-sm font-semibold text-brand-ink mb-2">
                                    Anything else we should know? <span className="font-normal text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Add any detail that helps us understand what happened."
                                    className="w-full px-3 py-2 border border-brand-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-ink mb-5"
                                />

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 border border-brand-sand text-brand-ink font-semibold py-2.5 rounded-lg hover:bg-brand-cream"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !reason}
                                        className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-40"
                                    >
                                        {submitting ? 'Submitting…' : 'Submit report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ReportButton;