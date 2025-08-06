import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path
import type { Task } from "../types"; // define your User type here or inline below

export const getTasks = async (): Promise<Task[]> => {
  try {
    const snapshot = await getDocs(collection(db, "tasks"));
    const allTasks: Task[] = snapshot.docs.map((doc) => {
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

    

    // super_admin and others see all team-related roles
    return allTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};
