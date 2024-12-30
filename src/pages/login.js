
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';  
import { useNavigate } from 'react-router-dom';  
import app from '../firebaseConfig';
import '../styles/login.css';  



const auth = getAuth(app);  

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();  // navigate() ile yönlendirme işlemleri 

  const handleLogin = async (e) => {
    e.preventDefault();  
    try {
      await signInWithEmailAndPassword(auth, email, password);  // Firebase ile giriş yapıyoruz
      navigate('/dashboard');  // Giriş başarılı olursa ana sayfaya yönlendiriyoruz
    } catch (error) {
      setError(error.message);  
    }
  };

  // Kayıt ol sayfasına yönlendirme 
  const handleSignUpRedirect = () => {
    navigate('/signup');  
  };

  return (
    <div>
      <h2>GİRİŞ</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Giriş</button>
      </form>
      {error && <p style={{ color: 'red' }}>"KULLANICI ADI veya ŞİFRE yanlış!!!"</p>}  

      
      <button onClick={handleSignUpRedirect}>Kayıt Ol</button>
    </div>
  );
}

export default Login;
