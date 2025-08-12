import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

function FlatSetup() {
  const [flatCode, setFlatCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingFlat();
  }, []);

  const checkExistingFlat = async () => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists() && userDoc.data().flatId) {
      navigate('/');
    }
  };

  const createFlat = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, 'flats', code), {
      createdBy: auth.currentUser.uid,
      members: [auth.currentUser.uid],
      createdAt: new Date()
    });
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      email: auth.currentUser.email,
      flatId: code
    });
    navigate('/');
  };

  const joinFlat = async () => {
    const flatDoc = await getDoc(doc(db, 'flats', flatCode));
    if (flatDoc.exists()) {
      await setDoc(doc(db, 'flats', flatCode), {
        ...flatDoc.data(),
        members: [...flatDoc.data().members, auth.currentUser.uid]
      });
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: auth.currentUser.email,
        flatId: flatCode
      });
      navigate('/');
    } else {
      alert('Invalid flat code');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Setup Your Flat</h2>
      <button onClick={createFlat} style={{ width: '100%', padding: '15px', margin: '10px 0' }}>
        Create New Flat
      </button>
      <div style={{ margin: '30px 0' }}>OR</div>
      <input
        placeholder="Enter Flat Code"
        value={flatCode}
        onChange={(e) => setFlatCode(e.target.value.toUpperCase())}
        style={{ width: '100%', padding: '10px', margin: '10px 0' }}
      />
      <button onClick={joinFlat} style={{ width: '100%', padding: '15px' }}>
        Join Existing Flat
      </button>
    </div>
  );
}

export default FlatSetup;