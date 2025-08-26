import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path if needed
import type { User } from '../types';

export async function getUserById(userId: string): Promise<User | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}