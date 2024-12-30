import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import app from '../firebaseConfig'; 
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 
import '../styles/signup.css';

const auth = getAuth(app);
const db = getFirestore(app); // Firestore veritabanı bağlantısı

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Kullanıcı adı
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Firebase Authentication ile kullanıcı kaydı
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kullanıcı bilgilerini Firestore'a kaydetme
      await setDoc(doc(db, 'Users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
      });

      // Başarılı kayıt sonrası yönlendirme
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>KAYIT OL</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Kayıt Ol</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default SignUp;
