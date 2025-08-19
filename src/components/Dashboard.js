import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

function Dashboard() {
  const [flatId, setFlatId] = useState(null);
  const [activeTab, setActiveTab] = useState('chores');
  const [chores, setChores] = useState([]);
  const [bills, setBills] = useState([]);
  const [shopping, setShopping] = useState([]);
  
  // Form states
  const [newChore, setNewChore] = useState('');
  const [newBill, setNewBill] = useState({ name: '', amount: '' });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadUserFlat();
  }, []);

  useEffect(() => {
    if (flatId) {
      const choresUnsub = onSnapshot(
        query(collection(db, 'chores'), where('flatId', '==', flatId)),
        (snapshot) => setChores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      );
      
      const billsUnsub = onSnapshot(
        query(collection(db, 'bills'), where('flatId', '==', flatId)),
        (snapshot) => setBills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      );
      
      const shoppingUnsub = onSnapshot(
        query(collection(db, 'shopping'), where('flatId', '==', flatId)),
        (snapshot) => setShopping(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      );

      return () => {
        choresUnsub();
        billsUnsub();
        shoppingUnsub();
      };
    }
  }, [flatId]);

  const loadUserFlat = async () => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setFlatId(userDoc.data().flatId);
    }
  };

  const addChore = async () => {
    if (newChore) {
      await addDoc(collection(db, 'chores'), {
        task: newChore,
        flatId,
        completed: false,
        createdAt: new Date()
      });
      setNewChore('');
    }
  };

  const toggleChore = async (choreId, completed) => {
    await updateDoc(doc(db, 'chores', choreId), { completed: !completed });
  };

  const addBill = async () => {
    if (newBill.name && newBill.amount) {
      await addDoc(collection(db, 'bills'), {
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        flatId,
        createdAt: new Date()
      });
      setNewBill({ name: '', amount: '' });
    }
  };

  const addShoppingItem = async () => {
    if (newItem) {
      await addDoc(collection(db, 'shopping'), {
        item: newItem,
        flatId,
        purchased: false,
        createdAt: new Date()
      });
      setNewItem('');
    }
  };

  const toggleShopping = async (itemId, purchased) => {
    await updateDoc(doc(db, 'shopping', itemId), { purchased: !purchased });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>HouseHelper</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Flat Code: {flatId}</span>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button 
          onClick={() => setActiveTab('chores')}
          style={{ padding: '10px 20px', background: activeTab === 'chores' ? '#007bff' : '#ccc' }}
        >
          Chores
        </button>
        <button 
          onClick={() => setActiveTab('bills')}
          style={{ padding: '10px 20px', background: activeTab === 'bills' ? '#007bff' : '#ccc' }}
        >
          Bills
        </button>
        <button 
          onClick={() => setActiveTab('shopping')}
          style={{ padding: '10px 20px', background: activeTab === 'shopping' ? '#007bff' : '#ccc' }}
        >
          Shopping
        </button>
      </div>

      {activeTab === 'chores' && (
        <div>
          <h2>Chores</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              placeholder="Add new chore"
              value={newChore}
              onChange={(e) => setNewChore(e.target.value)}
              style={{ flex: 1, padding: '10px' }}
            />
            <button onClick={addChore}>Add</button>
          </div>
          {chores.map(chore => (
            <div key={chore.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
              <input
                type="checkbox"
                checked={chore.completed}
                onChange={() => toggleChore(chore.id, chore.completed)}
              />
              <span style={{ marginLeft: '10px', textDecoration: chore.completed ? 'line-through' : 'none' }}>
                {chore.task}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bills' && (
        <div>
          <h2>Bills</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              placeholder="Bill name"
              value={newBill.name}
              onChange={(e) => setNewBill({...newBill, name: e.target.value})}
              style={{ flex: 1, padding: '10px' }}
            />
            <input
              placeholder="Amount"
              type="number"
              value={newBill.amount}
              onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
              style={{ width: '100px', padding: '10px' }}
            />
            <button onClick={addBill}>Add</button>
          </div>
          {bills.map(bill => (
            <div key={bill.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
              <strong>{bill.name}</strong>: €{bill.amount}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'shopping' && (
        <div>
          <h2>Shopping List</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              placeholder="Add item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{ flex: 1, padding: '10px' }}
            />
            <button onClick={addShoppingItem}>Add</button>
          </div>
          {shopping.map(item => (
            <div key={item.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
              <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => toggleShopping(item.id, item.purchased)}
              />
              <span style={{ marginLeft: '10px', textDecoration: item.purchased ? 'line-through' : 'none' }}>
                {item.item}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;