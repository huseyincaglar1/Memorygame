import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; 
import { collection, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth"; 
import '../styles/dashboard.css'; 

//kullanıcı verileri çekilir
const fetchLeaderboardData = async () => {
  const usersRef = collection(db, "Users"); 
  const snapshot = await getDocs(usersRef);
  const users = [];

  for (const doc of snapshot.docs) {
    const userData = doc.data();
    const userId = doc.id;

    // 'levels' koleksiyonunu alıyoruz
    const levelsRef = collection(db, "Users", userId, "levels");
    const levelsSnapshot = await getDocs(levelsRef);
    const levels = {};

    levelsSnapshot.forEach((levelDoc) => {
      const levelData = levelDoc.data();
      levels[levelDoc.id] = levelData;
    });

    users.push({
      userId: userId,
      username: userData.username,
      levels: levels,
    });
  }

  return users;
};


//Kullanıcıların liderlik tablolarını ve kendi skorlarını görüntülediği bileşen
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); 

  //liderlik tabloları için gerekli veriler çekilir
  useEffect(() => {
    const fetchData = async () => {
      const leaderboardData = await fetchLeaderboardData();
      setUsers(leaderboardData);

      
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user.uid); 
      }
    };

    fetchData();
  }, []);

  const handleStartGame = () => {
    navigate("/game"); // Oyuna başlama sayfasına yönlendirir
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/login"); // Çıkış yapıldığında login sayfasına yönlendir
      })
      .catch((error) => {
        console.error("Çıkış yaparken hata oluştu:", error);
      });
  };

  // Seviyelere göre skor sıralama fonksiyonu
  const sortByLevel = (level) => {
    return users
      .filter((user) => {
        const levelData = user.levels[level];
        return levelData && levelData.highestScore > 0;
      })
      .map((user) => {
        const levelData = user.levels[level];
        return {
          username: user.username,
          highestScore: levelData ? levelData.highestScore : 0,
        };
      })
      .sort((a, b) => b.highestScore - a.highestScore)
      .slice(0, 10);
  };

  
  const renderUserScores = () => {
    // sadece kullanıcının skorlarını gösteren tablo
    if (currentUser) {
      const user = users.find((user) => user.userId === currentUser);
      if (user) {
        return (
          <tr key={user.userId}>
            <td>{user.username}</td>
            <td>{user.levels.level1 ? user.levels.level1.highestScore : "N/A"}</td>
            <td>{user.levels.level2 ? user.levels.level2.highestScore : "N/A"}</td>
            <td>{user.levels.level3 ? user.levels.level3.highestScore : "N/A"}</td>
            <td>{user.levels.level4 ? user.levels.level4.highestScore : "N/A"}</td>
          </tr>
        );
      }
    }
    return null; 
  };

  return (
    <div className="dashboard-container">
      <h1>ANASAYFA</h1>
      <button onClick={handleStartGame} className="dashboard-button">
        Oyuna Başla
      </button>

      
      <button onClick={handleSignOut} className="dashboard-button">
        Çıkış Yap
      </button>

      <div className="leaderboard-container">
        
        <div className="leaderboard-table">
          <h2>Seviye 1 Liderlik Tablosu</h2>
          <table>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>En Yüksek Skor</th>
              </tr>
            </thead>
            <tbody>
              {sortByLevel("level1").map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.highestScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="leaderboard-table">
          <h2>Seviye 2 Liderlik Tablosu</h2>
          <table>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>En Yüksek Skor</th>
              </tr>
            </thead>
            <tbody>
              {sortByLevel("level2").map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.highestScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="leaderboard-table">
          <h2>Seviye 3 Liderlik Tablosu</h2>
          <table>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>En Yüksek Skor</th>
              </tr>
            </thead>
            <tbody>
              {sortByLevel("level3").map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.highestScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="leaderboard-table">
          <h2>Seviye 4 Liderlik Tablosu</h2>
          <table>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>En Yüksek Skor</th>
              </tr>
            </thead>
            <tbody>
              {sortByLevel("level4").map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.highestScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="leaderboard-table">
          <h2>Kendi Skorlarım</h2>
          <table>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>Seviye 1 Skoru</th>
                <th>Seviye 2 Skoru</th>
                <th>Seviye 3 Skoru</th>
                <th>Seviye 4 Skoru</th>
              </tr>
            </thead>
            <tbody>{renderUserScores()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
