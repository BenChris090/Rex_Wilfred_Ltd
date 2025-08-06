import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // adjust your Firebase config path
import type { User } from '../types'; // assuming you have a type

interface TeamGroupedByState {
  [state: string]: User[];
}

const AllTeams: React.FC = () => {
  const [teams, setTeams] = useState<TeamGroupedByState>({});

  useEffect(() => {
    const fetchTeams = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });

      const grouped: TeamGroupedByState = {};

      users.forEach(user => {
      if (!user.state) return; // Skip users without a state

      if (!grouped[user.state]) {
        grouped[user.state] = [];
    }

    grouped[user.state].push(user);
    });

    setTeams(grouped);

    };

    fetchTeams();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">All Teams</h1>
      {Object.entries(teams).map(([state, members]) => {
        const stateHead = members.find(m => m.role === 'state_head');
        const others = members.filter(m => m.role === 'team_member');

        return (
          <div key={state} className="mb-8 bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">{state} Team</h2>

            {stateHead && (
              <div className="mb-4 border-b pb-2">
                <p className="font-bold text-green-700">State Head: {stateHead.name}</p>
                <p className="text-sm text-gray-500">{stateHead.email}</p>
              </div>
            )}

            <div className="space-y-2">
              {others.map(member => (
                <div key={member.id} className="flex justify-between items-center border-b pb-1">
                  <span className="text-gray-800">{member.name}</span>
                  <span className="text-sm text-gray-500">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllTeams;
