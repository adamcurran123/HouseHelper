import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Dashboard() {
  const [flatId, setFlatId] = useState(null);
  const [activeTab, setActiveTab] = useState('chores');
  const [chores, setChores] = useState([]);
  const [bills, setBills] = useState([]);
  const [shopping, setShopping] = useState([]);
  const navigate = useNavigate();
  
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
    if (userDoc.exists() && userDoc.data().flatId) {
      setFlatId(userDoc.data().flatId);
    } else {
      navigate('/setup');
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
    <div className="dashboard-container">
      <div className="header">
        <h1>🏠 HouseHelper</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Flat Code: <strong>{flatId}</strong></span>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </div>

      <div className="tabs">
        <button 
          onClick={() => setActiveTab('chores')}
          className={`tab-button ${activeTab === 'chores' ? 'active' : ''}`}
        >
          🧹 Chores
        </button>
        <button 
          onClick={() => setActiveTab('bills')}
          className={`tab-button ${activeTab === 'bills' ? 'active' : ''}`}
        >
          💰 Bills
        </button>
        <button 
          onClick={() => setActiveTab('shopping')}
          className={`tab-button ${activeTab === 'shopping' ? 'active' : ''}`}
        >
          🛒 Shopping
        </button>
      </div>

      <div className="content">
        {activeTab === 'chores' && (
          <div>
            <h2>Household Chores</h2>
            <div className="input-group">
              <input
                placeholder="Add new chore..."
                value={newChore}
                onChange={(e) => setNewChore(e.target.value)}
              />
              <button onClick={addChore}>Add Chore</button>
            </div>
            {chores.map(chore => (
              <div key={chore.id} className="item-card">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={chore.completed}
                  onChange={() => toggleChore(chore.id, chore.completed)}
                />
                <span className={`item-text ${chore.completed ? 'completed' : ''}`}>
                  {chore.task}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bills' && (
          <div>
            <h2>Shared Bills</h2>
            <div className="input-group">
              <input
                placeholder="Bill name..."
                value={newBill.name}
                onChange={(e) => setNewBill({...newBill, name: e.target.value})}
              />
              <input
                placeholder="Amount"
                type="number"
                value={newBill.amount}
                onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                style={{ maxWidth: '150px' }}
              />
              <button onClick={addBill}>Add Bill</button>
            </div>
            {bills.map(bill => (
              <div key={bill.id} className="item-card">
                <span className="item-text">{bill.name}</span>
                <span className="bill-amount">€{bill.amount}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shopping' && (
          <div>
            <h2>Shopping List</h2>
            <div className="input-group">
              <input
                placeholder="Add item to shopping list..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <button onClick={addShoppingItem}>Add Item</button>
            </div>
            {shopping.map(item => (
              <div key={item.id} className="item-card">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={item.purchased}
                  onChange={() => toggleShopping(item.id, item.purchased)}
                />
                <span className={`item-text ${item.purchased ? 'completed' : ''}`}>
                  {item.item}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;