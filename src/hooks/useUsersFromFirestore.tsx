import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { User } from '../../typings';
import { db } from '../../firebase';


const useUsersFromFirestore = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const usersCollectionRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCollectionRef, (querySnapshot) => {
          const users: User[] = [];
          querySnapshot.forEach((doc) => {
            // Extract the user data from each document
            const user = doc.data() as User;
            user.id = doc.id
            users.push(user);
          });
    
          // Process the retrieved users or update the state
          setUsers(users)
        });
    
        return () => {
          // Unsubscribe from the real-time listener when the component unmounts
          unsubscribe();
        };
      }, []);
  return {users}
}

export default useUsersFromFirestore