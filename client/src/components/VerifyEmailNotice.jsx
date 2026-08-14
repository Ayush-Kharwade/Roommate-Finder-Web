import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import SEO from './SEO.jsx';

/**
 * Shown instead of the posting screens when the signed-in account hasn't
 * confirmed its email yet.
 *
 * Posting is what exposes a phone number and gets someone to turn up at a real
 * address, so it's the line worth drawing. Browsing, saving and chat stay open —
 * gating those would just make the site look broken to a new user.
 */
function VerifyEmailNotice() {
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [sentOnce, setSentOnce] = useState(false);

    const email = auth.currentUser?.email;

    const handleResend = async () => {
        if (!auth.currentUser) return;
        setSending(true);
        try {
            await sendEmailVerification(auth.currentUser);
            setSentOnce(true);
            toast.success('Verification email sent.');
        } catch (err) {
            console.error('Failed to resend verification email:', err);
            toast.error(
                err.code === 'auth/too-many-requests'
                    ? 'Too many attempts. Wait a few minutes and try again.'
                    : 'Could not send the email. Please try again.'
            );
        } finally {
            setSending(false);
        }
    };

    const handleRecheck = async () => {
        if (!auth.currentUser) return;
        setChecking(true);
        try {
            // emailVerified is baked into the cached token, so it stays false
            // until we refetch the account from Firebase.
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                toast.success('Email verified — thanks!');
                // A full reload re-runs onAuthStateChanged so the rest of the
                // app picks up the new status.
                window.location.reload();
            } else {
                toast('Not verified yet. Open the link in your inbox, then try again.');
            }
        } catch (err) {
            console.error('Failed to refresh verification status:', err);
            toast.error('Could not check your status. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="flex-grow bg-brand-cream flex items-center justify-center px-4 py-16">
            <SEO title="Verify your email" />
            <div className="bg-white border border-brand-sand rounded-xl max-w-md w-full p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-brand-marigold/15 text-brand-marigold flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h1 className="font-serif text-2xl font-bold text-brand-ink mb-3">
                    Confirm your email first
                </h1>
                <p className="text-gray-600 mb-2">
                    Before you can post a room or a roommate profile, we need to know your
                    email address is really yours. It keeps the listings people rely on honest.
                </p>
                {email && (
                    <p className="text-sm text-gray-500 mb-6">
                        We sent a link to <span className="font-semibold text-brand-ink">{email}</span>.
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleRecheck}
                        disabled={checking}
                        className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50"
                    >
                        {checking ? 'Checking…' : "I've verified — continue"}
                    </button>
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="w-full border border-brand-sand text-brand-ink font-semibold py-3 rounded-lg hover:bg-brand-cream transition-colors disabled:opacity-50"
                    >
                        {sending ? 'Sending…' : sentOnce ? 'Send it again' : 'Resend the email'}
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-5">
                    Check your spam folder if it hasn't arrived within a minute.
                </p>

                <div className="mt-6 pt-5 border-t border-brand-sand">
                    <Link to="/listings" className="text-sm font-semibold text-brand-green hover:underline">
                        Browse rooms in the meantime →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailNotice;
