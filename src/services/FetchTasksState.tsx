import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from "../firebase";
import type { Task } from "../types"; // Ensure Task type is imported

export const getTasksByState = async (state: string): Promise<Task[]> => {
  const q = query(
    collection(db, 'tasks'),
    where('state', '==', state)
  );
  const snapshot = await getDocs(q);

  const tasks: Task[] = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedBy,
      state: data.state || "",
      reward: data.reward,
      status: data.status,
      dueDate: data.dueDate?.toDate?.() || new Date(),
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      approvedBy: data.approvedBy,
      verifiedBy: data.verifiedBy,
      approvedAt: data.approvedAt?.toDate?.(),
      verifiedAt: data.verifiedAt?.toDate?.()
    };
  });

  return tasks;
};
