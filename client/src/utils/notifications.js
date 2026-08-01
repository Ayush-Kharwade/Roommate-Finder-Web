import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Creates or refreshes a notification.
 *
 * Uses a deterministic document ID so repeated events collapse into one
 * notification instead of spamming the recipient.
 */
async function writeNotification(id, data) {
    try {
        await setDoc(doc(db, 'notifications', id), {
            ...data,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (err) {
        console.error('Failed to write notification:', err);
    }
}

/** Someone saved a listing → tell its owner. */
export async function notifyListingSaved({ listingId, listingTitle, ownerId, actor }) {
    if (!ownerId || ownerId === actor.uid) return;

    await writeNotification(`save_${listingId}_${actor.uid}`, {
        userId: ownerId,
        actorId: actor.uid,
        actorName: actor.displayName || 'Someone',
        type: 'save',
        message: `saved your listing "${listingTitle}"`,
        link: `/property/${listingId}`,
    });
}

/** Someone sent a chat message → tell the recipient. */
export async function notifyNewMessage({ chatId, recipientId, actor, preview }) {
    if (!recipientId || recipientId === actor.uid) return;

    await writeNotification(`msg_${chatId}_${recipientId}`, {
        userId: recipientId,
        actorId: actor.uid,
        actorName: actor.displayName || 'Someone',
        type: 'message',
        message: preview.length > 60 ? `${preview.slice(0, 60)}…` : preview,
        link: `/chat/${chatId}`,
    });
}