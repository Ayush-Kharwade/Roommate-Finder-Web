import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Deterministic chat ID from two user IDs — sorting means the same
 * pair always maps to the same thread, so no duplicates.
 */
export function getChatId(uidA, uidB) {
  return uidA > uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`;
}

/**
 * Creates the chat document if it doesn't exist, then returns its ID.
 * Denormalizes both participants' names/photos so the conversations
 * list renders without extra user lookups.
 */
export async function getOrCreateChat({ currentUser, otherUser, context = {} }) {
  const chatId = getChatId(currentUser.uid, otherUser.uid);
  const chatRef = doc(db, 'chats', chatId);

  // setDoc with merge handles both cases: creates if new, updates if existing.
  // No read first, so we never hit the non-existent-doc rule problem.
  // Deliberately omits lastMessage fields — those are written when the
  // first message is actually sent.
  await setDoc(chatRef, {
    participants: [currentUser.uid, otherUser.uid],
    participantNames: {
      [currentUser.uid]: currentUser.displayName || 'User',
      [otherUser.uid]: otherUser.name || 'User',
    },
    participantPhotos: {
      [currentUser.uid]: currentUser.photoURL || null,
      [otherUser.uid]: otherUser.photoUrl || null,
    },
    propertyId: context.propertyId || null,
    propertyTitle: context.propertyTitle || null,
  }, { merge: true });

  return chatId;
}

/** True if the other person's latest message arrived after my last read. */
export function isUnread(chat, myUid) {
    if (!chat.lastMessageAt || chat.lastMessageSender === myUid) return false;
    const lastRead = chat.lastReadBy?.[myUid];
    if (!lastRead) return true;
    return chat.lastMessageAt.toMillis() > lastRead.toMillis();
}