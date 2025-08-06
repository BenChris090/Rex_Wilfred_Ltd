import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path
import type { User } from "../types"; // define your User type here or inline below

export const getTeamMembers = async (currentUser: User): Promise<User[]> => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    const allUsers: User[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        state: data.state || "",
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });

    // 🔐 Apply filter logic based on current user's role
    if (currentUser.role === "state_head") {
      return allUsers.filter(
        (user) => user.role === "team_member" && user.state === currentUser.state
      );
    }

    // super_admin and others see all team-related roles
    return allUsers.filter((user) =>
      ["team_member", "state_head"].includes(user.role)
    );
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
};
