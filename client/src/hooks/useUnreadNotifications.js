import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/** Live count of the current user's unread notifications. */
export function useUnreadNotifications(user) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setCount(0);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => setCount(snap.size),
            (err) => console.error('Unread notifications listener error:', err)
        );

        return () => unsubscribe();
    }, [user]);

    return count;
}