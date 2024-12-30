import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import "../App.css"; 
import { useNavigate } from "react-router-dom"; 


const auth = getAuth();
const db = getFirestore(); // Firestore bağlantısı

const Game = () => {
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); 
    //Kullanıcı doğrulama
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

    //kartlar karıştırılması
    const shuffleArray = (array) => {
      const shuffledArray = array.slice();
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
      }
      return shuffledArray;
    };




  //tıklanan kartın durumunu günceller
  const handleCardClick = (clickedCard) => {
    if (flippedCards.length < 2 && !clickedCard.isFlipped && !clickedCard.isMatched) {
      setFlippedCards((prevFlippedCards) => [...prevFlippedCards, clickedCard]);
      setCards((prevCards) =>
        prevCards.map((c) =>
          c === clickedCard ? { ...c, isFlipped: true } : c
        )
      );
    }
  };

    const [flippedCards, setFlippedCards] = useState([]);

    //eşleşen kartları kontrol etme
    const checkForMatch = useCallback(() => {
      const [card1, card2] = flippedCards;
    
      setMoves((prevMoves) => prevMoves + 1);
    
      if (card1.value === card2.value) {
        // Her eşleşme için 20 puan ekle
        setScore((prevScore) => prevScore + 20);
        setCards((prevCards) =>
          prevCards.map((c) => (c.value === card1.value ? { ...c, isMatched: true } : c))
        );
      } else {
        // Eşleşme yoksa -5 puan ver ve puan eksiye düşebilir
        setScore((prevScore) => prevScore - 5);
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.isFlipped && !c.isMatched ? { ...c, isFlipped: false } : c
          )
        );
      }
    
      setFlippedCards([]);
    }, [flippedCards]);







  //seviyelere göre kullanılacak kart değerleri
  const levelCardValues = {
    1: ["A", "B", "C", "D"],
    2: ["A", "B", "C", "D", "E", "F", "G", "H"],
    3: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
    4: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  };

  const resetGame = () => {
    // Yeni seviyeyi belirle
    const newLevel = level === 4 ? 4 : level + 1;
    setLevel(newLevel);
  
    // Yeni kart değerlerini belirle
    const newCardValues = levelCardValues[newLevel];
    const newCards = newCardValues.reduce((acc, value) => {
      acc.push({ value, isFlipped: false, isMatched: false });
      acc.push({ value, isFlipped: false, isMatched: false });
      return acc;
    }, []);
    setCards(shuffleArray(newCards));  // Kartları karıştır
  
    // Diğer oyun durumlarını sıfırla
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
    setIsGameStarted(true);  // Oyunu başlat
  
    // Oyun bitişini sıfırla
    setHasGameEnded(false);
  
     
    if (userId) {
      saveScoreToFirestore(userId, newLevel, 0);  // Yeni seviyedeki skoru sıfırla
    }
  };

  const initialLevel = 1;
  const [level, setLevel] = useState(initialLevel);//mevcut seviye
  const cardValues = levelCardValues[level];//mevcut seviyeye göre kart değerleri

  const initialCards = cardValues.reduce((acc, value) => {
    acc.push({ value, isFlipped: false, isMatched: false });//kartlarrın başlangıç durumunu oluşturur.
    acc.push({ value, isFlipped: false, isMatched: false });
    return acc;
  }, []);

  const [cards, setCards] = useState(shuffleArray(initialCards));//kartlar rastgele sıralanır
  
  const [moves, setMoves] = useState(0);// Kullanıcının yaptığı hamle sayısı
  const [score, setScore] = useState(0);// Kullanıcının skoru
  const [gameOver, setGameOver] = useState(false);// Oyunun bitip bitmediğini kontrol eder
  const [isGameStarted, setIsGameStarted] = useState(false);// Oyunun başlayıp başlamadığını kontrol eder


  

  useEffect(() => {
    if (flippedCards.length === 2) {
      setTimeout(() => checkForMatch(), 1000);
    }
  }, [flippedCards, checkForMatch]);



  const [hasGameEnded, setHasGameEnded] = useState(false);

  //oyun bitiş kontrolü
  useEffect(() => {
    if (cards.every((card) => card.isMatched) && !hasGameEnded) {
      setHasGameEnded(true); // Oyunun bittiğini işaretle
      setGameOver(true); // Oyun bittiği bilgisini ver
  
      // Hareket sayısının -2 ile çarpımını toplam puana ekle
      const finalScore = score + moves * -2;
      setScore(finalScore);
  
      
      const highestScore = Math.max(finalScore, 0); 
  
      if (userId) {
        saveScoreToFirestore(userId, level, highestScore); 
      }
  
      const userRef = doc(db, "Users", userId);
      const levelRef = doc(userRef, "levels", `level${level}`);
  
    
      getDoc(levelRef).then((levelDoc) => {
        if (levelDoc.exists()) {
          const existingHighestScore = levelDoc.data().highestScore || 0;
          const newHighestScore = Math.max(existingHighestScore, highestScore);
  
          setDoc(levelRef, {
            highestScore: newHighestScore,  // En yüksek skoru güncelle
            timestamp: new Date().toISOString(),  // Skor kaydedildiği zaman
          }, { merge: true });
        }
      });
    }
  }, [cards, score, level, userId, moves, hasGameEnded]);


  
    /*Skor Kaydetme:
    Her seviyedeki en yüksek skor, Firestore'daki ilgili kullanıcı dokümanına kaydedilir.
    Yeni skor, önceki skordan büyükse güncellenir.*/

    const saveScoreToFirestore = async (userId, level, score) => {
      const user = auth.currentUser; 
      if (user && userId && score >= 0) {  
        try {
          const userRef = doc(db, "Users", userId);  // Firestore'daki 'Users' koleksiyonu
          const levelRef = doc(userRef, "levels", `level${level}`);  // Seviye için bir alt koleksiyon
        
          // Mevcut seviyedeki kullanıcı skorunu al
          const levelDoc = await getDoc(levelRef);
          const existingScore = levelDoc.exists() ? levelDoc.data().score : 0;
          const existingHighestScore = levelDoc.exists() ? levelDoc.data().highestScore : 0;
    
          // En yüksek skoru kontrol et ve güncelle
          const newHighestScore = Math.max(existingHighestScore, score);
    
          // Eğer mevcut skor yeni skordan küçükse, Firestore'daki skoru güncelle
          if (score > existingScore || existingHighestScore < newHighestScore) {
            await setDoc(levelRef, {
              highestScore: newHighestScore,  
              timestamp: new Date().toISOString(),  
            }, { merge: true });
        
            console.log("Skor başarıyla Firestore'a kaydedildi.");
          } else {
            console.log("Yeni skor mevcut skordan düşük, güncelleme yapılmadı.");
          }
        
          
          await setDoc(userRef, {
            email: user.email,
          }, { merge: true });
        
          console.log("Kullanıcı bilgileri başarıyla güncellendi.");
        } catch (error) {
          console.error("Skor kaydetme hatası:", error.message);
        }
      } else {
        console.log("Geçersiz kullanıcı kimliği veya geçerli bir skor bulunmuyor.");
      }
    };
 
  

    // Kart bileşeni: Her bir kartın görünümünü ve tıklanma olayını tanımlar.
    const Card = ({ card, onCardClick }) => {
      const imagePath = `images/${card.value}.png`;

      return (
        <div className={`card ${card.isMatched ? "matched" : ""}`} onClick={() => onCardClick(card)}>
          <div className="card-inner">
            {card.isFlipped ? (
              <img className="card-image" src={imagePath} alt={card.value} />
            ) : (
              <span className="card-back">?</span>
            )}
          </div>
        </div>
      );
    };
  
  

  const startGame = () => {
    setIsGameStarted(true);
  };

  const gridSize = level + 3;

  return (
    <div className="Game">
      <h1>HAFIZA OYUNU</h1>
      {!isGameStarted ? (
        <div>
          <button onClick={startGame}>Oyuna Başla</button>
        </div>
      ) : (
        <>
          <div className="score-container">
            <p>Seviye: {level}</p>
            <p>Hareket sayısı: {moves}</p>
            <p>Puan: {score}</p>
          </div>
          {gameOver ? (
            <div>
            <h2>Oyun Bitti!</h2>

            <button 
              onClick={() => {
                if (level === 4) {
                  navigate("/dashboard");
                } else {
                  resetGame();
                }
              }}
            >
              {level === 4 ? "Anasayfaya dön" : "Sonraki Seviye"}
            </button>

            </div>
          
          
          ) : (
            <div
              className="card-container"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gap: "10px",
                width: "80%",
                margin: "0 auto",
              }}
            >
              {cards.map((card, index) => (
                <Card key={index} card={card} onCardClick={handleCardClick} />
              ))}
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default Game;
