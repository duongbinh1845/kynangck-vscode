import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Trophy, Heart, RefreshCw, Award, CheckCircle, 
  AlertTriangle, HelpCircle, Gamepad2, Layers, Grid, ChevronRight, 
  ChevronLeft, Star, Volume2, Sparkles, Flame, ShieldAlert
} from 'lucide-react';
import { GuessingScreen } from '../types';

interface Scenario {
  id: number;
  question: string;
  image: string;
  options: {
    text: string;
    score: number;
    feedback: string;
    isCorrect: boolean;
  }[];
}

const FOREST_SCENARIOS: Scenario[] = [
  {
    id: 1,
    question: "Bạn đang thám hiểm rừng sâu và phát hiện mình bị lạc khỏi nhóm. Mặt trời đang lặn dần. Việc đầu tiên bạn cần làm là gì?",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80",
    options: [
      {
        text: "Hốt hoảng chạy thật nhanh đi tìm đường về nhà ngay lập tức.",
        score: -10,
        feedback: "Sai rồi! Chạy hỗn loạn trong lúc hoảng sợ dễ khiến bạn kiệt sức, bị thương và lạc sâu hơn. Hãy bình tĩnh lại!",
        isCorrect: false
      },
      {
        text: "Áp dụng quy tắc S.T.O.P: Dừng lại, Suy nghĩ, Quan sát tình hình xung quanh và Lên kế hoạch.",
        score: 20,
        feedback: "Tuyệt vời! S.T.O.P (Stop, Think, Observe, Plan) là quy tắc sinh tồn số một. Bình tĩnh giúp bạn đưa ra quyết định sáng suốt nhất.",
        isCorrect: true
      },
      {
        text: "Tìm một gốc cây cổ thụ và leo lên ngọn cao để ngủ qua đêm.",
        score: 5,
        feedback: "Khá mạo hiểm. Leo cây ban đêm rất dễ trượt chân ngã, đồng thời không bảo vệ bạn khỏi thời tiết lạnh dông rừng.",
        isCorrect: false
      }
    ]
  },
  {
    id: 2,
    question: "Bạn đang rất khát nhưng xung quanh chỉ có một vũng nước mưa đục ngầu đọng trên phiến đá. Bạn nên xử lý thế nào để uống an toàn?",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    options: [
      {
        text: "Uống trực tiếp luôn vì nước mưa tích tụ trên đá là sạch rồi.",
        score: -15,
        feedback: "Nguy hiểm! Nước đọng hoang dã chứa vô số vi khuẩn, ký sinh trùng gây đau bụng cấp tính.",
        isCorrect: false
      },
      {
        text: "Dùng cát, sỏi, than củi và vải để làm bộ lọc cát lọc sạch cặn bẩn, sau đó đun sôi nước trước khi uống.",
        score: 20,
        feedback: "Xuất sắc! Lọc thô loại bỏ bùn đất, còn đun sôi giúp tiêu diệt 99.9% vi khuẩn có hại. Bạn là chuyên gia thực thụ!",
        isCorrect: true
      },
      {
        text: "Tìm lá cây to hứng sương đêm hoặc quả mọng ăn thay thế uống nước vũng.",
        score: 10,
        feedback: "An toàn hơn uống trực tiếp, nhưng lá sương chỉ cung cấp lượng nước rất nhỏ, và quả mọng lạ có thể gây ngộ độc nếu không biết rõ.",
        isCorrect: false
      }
    ]
  },
  {
    id: 3,
    question: "Bạn cần nhóm một đống lửa nhỏ để giữ ấm và xua đuổi dã thú vào ban đêm. Đâu là cách sắp xếp củi nhóm lửa tối ưu nhất?",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
    options: [
      {
        text: "Xếp các khúc gỗ to đè lên nhau rồi dùng bật lửa đốt.",
        score: -5,
        feedback: "Không thành công. Gỗ to rất khó bắt lửa trực tiếp nếu không có mồi lửa nhỏ và củi khô làm chất dẫn.",
        isCorrect: false
      },
      {
        text: "Sử dụng cành khô nhỏ, lá thông rụng làm mồi, xếp củi theo hình kim tự tháp (hình lều) để có nhiều oxy thổi vào.",
        score: 20,
        feedback: "Chính xác! Cấu trúc hình lều xếp từ củi nhỏ đến lớn giúp ngọn lửa thông thoáng khí, dễ bắt cháy và cháy đượm.",
        isCorrect: true
      },
      {
        text: "Chất thật nhiều lá xanh tươi lên để ngọn lửa bùng cháy dữ dội.",
        score: -10,
        feedback: "Sai rồi. Lá xanh chứa nhiều nước sẽ dập tắt lửa và tạo ra rất nhiều khói đen cay mắt.",
        isCorrect: false
      }
    ]
  },
  {
    id: 4,
    question: "Bất ngờ có một cơn giông lớn ập đến kèm theo sấm sét dữ dội. Bạn đang ở bãi đất trống dốc núi. Đâu là nơi trú ẩn an toàn nhất?",
    image: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?auto=format&fit=crop&w=600&q=80",
    options: [
      {
        text: "Đứng trú dưới tán của một cây cổ thụ to lớn nhất, đứng độc lập giữa bãi đất.",
        score: -15,
        feedback: "Rất nguy hiểm! Sét luôn có xu hướng đánh vào các vật thể cao nhất. Đứng dưới cây cô đơn nguy cơ bị sét đánh gián tiếp cực cao.",
        isCorrect: false
      },
      {
        text: "Tìm một hang đá thấp hoặc thung lũng sâu, quỳ rạp người xuống đất, gót chân chạm nhau để giảm diện tích tiếp xúc sấm sét.",
        score: 20,
        feedback: "Chính xác tuyệt đối! Tránh xa các đỉnh cao, thu nhỏ cơ thể tối đa và cách ly dòng điện chạy qua đất là tư thế sinh tồn kinh điển.",
        isCorrect: true
      },
      {
        text: "Chạy thật nhanh lên đỉnh núi cao để tìm hướng đi của mây đen.",
        score: -10,
        feedback: "Không an toàn. Đứng trên đỉnh cao dốc núi trong cơn giông sét làm tăng tối đa nguy cơ trở thành cột thu lôi di động.",
        isCorrect: false
      }
    ]
  }
];

export default function InteractiveGame({ cms }: { cms: any }) {
  const theme = cms?.theme || {
    primaryColor: '#5C7A3E',
    accentColor: '#F08C3A',
    webBgColor: '#FAF7F0',
    headerBgColor: '#FFFFFF',
    footerBgColor: '#1E293B',
    linkColor: '#5C7A3E'
  };

  const primaryColor = theme.primaryColor || '#5C7A3E';
  const accentColor = theme.accentColor || '#F08C3A';

  const [gameMode, setGameMode] = useState<'forest' | 'guessing'>('forest');
  
  // Custom Hover States for Exact Colors
  const [isForestHovered, setIsForestHovered] = useState(false);
  const [isGuessingHovered, setIsGuessingHovered] = useState(false);

  const getForestStyle = () => {
    if (gameMode === 'forest') {
      return { backgroundColor: '#5C7A3E', color: '#FFFFFF' };
    }
    if (isForestHovered) {
      return { backgroundColor: '#E8EFD9', color: '#5C7A3E' };
    }
    return { color: '#5C7A3E' };
  };

  const getGuessingStyle = () => {
    if (gameMode === 'guessing') {
      return { backgroundColor: '#F08C3A', color: '#FFFFFF' };
    }
    if (isGuessingHovered) {
      return { backgroundColor: '#F3ECDC', color: '#F08C3A' };
    }
    return { color: '#F08C3A' };
  };

  // --- Forest Adventure States ---
  const [forestIndex, setForestIndex] = useState(0);
  const [forestScore, setForestScore] = useState(0);
  const [forestLives, setForestLives] = useState(3);
  const [forestSelectedOption, setForestSelectedOption] = useState<number | null>(null);
  const [forestShowFeedback, setForestShowFeedback] = useState(false);
  const [forestCompleted, setForestCompleted] = useState(false);
  const [forestBadges, setForestBadges] = useState<string[]>([]);

  // --- Guessing Game States ---
  const [guessScreens, setGuessScreens] = useState<GuessingScreen[]>([]);
  const [loadingScreens, setLoadingScreens] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(1); // 1 to 10
  const [guessScore, setGuessScore] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]); // User's placed letters
  const [screenLettersPool, setScreenLettersPool] = useState<string[]>([]); // Decoy + Answer letters
  const [isGuessCorrect, setIsGuessCorrect] = useState(false);
  const [showGuessHint, setShowGuessHint] = useState(false);

  // Load Guessing Game Screens from DB API
  const loadGuessingScreens = async () => {
    setLoadingScreens(true);
    try {
      const res = await fetch('/api/guessing-screens');
      if (res.ok) {
        const data = await res.json();
        setGuessScreens(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải màn chơi đoán chữ:", err);
    } finally {
      setLoadingScreens(false);
    }
  };

  useEffect(() => {
    loadGuessingScreens();
  }, []);

  // Find the active screen based on Level and Screen Index
  const activeGuessScreen = guessScreens.find(
    s => s.level === currentLevel && s.screenIndex === currentScreenIndex
  ) || guessScreens[0];

  // Set up letters pool when the active screen changes
  useEffect(() => {
    if (activeGuessScreen) {
      const answer = activeGuessScreen.answer.toUpperCase().replace(/\s/g, '');
      const uniqueLetters = Array.from(new Set(answer.split('')));
      
      // Decoy pool padding
      const alphabet = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY";
      const pool = [...answer.split('')];
      
      // Add random decoys
      while (pool.length < Math.max(answer.length + 6, 12)) {
        const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        pool.push(randLetter);
      }

      // Shuffle pool
      const shuffled = pool.sort(() => Math.random() - 0.5);
      setScreenLettersPool(shuffled);
      setGuessedLetters(new Array(answer.length).fill(''));
      setIsGuessCorrect(false);
      setShowGuessHint(false);
    }
  }, [activeGuessScreen, currentLevel, currentScreenIndex]);

  // Forest Game Actions
  const handleForestSelect = (optionIndex: number) => {
    if (forestSelectedOption !== null) return;
    setForestSelectedOption(optionIndex);
    setForestShowFeedback(true);

    const option = FOREST_SCENARIOS[forestIndex].options[optionIndex];
    setForestScore(prev => Math.max(0, prev + option.score));

    if (!option.isCorrect) {
      setForestLives(prev => Math.max(0, prev - 1));
    }
  };

  const handleForestNext = () => {
    setForestSelectedOption(null);
    setForestShowFeedback(false);

    if (forestIndex < FOREST_SCENARIOS.length - 1) {
      setForestIndex(prev => prev + 1);
    } else {
      setForestCompleted(true);
      const earned: string[] = [];
      if (forestScore >= 60) earned.push("Chiến Binh Rừng Xanh Xuất Sắc");
      if (forestLives === 3) earned.push("Nhà Sinh Tồn Cẩn Trọng");
      if (forestScore >= 40) earned.push("Huy Hiệu La Bàn Bạc");
      setForestBadges(earned);
    }
  };

  const resetForest = () => {
    setForestIndex(0);
    setForestScore(0);
    setForestLives(3);
    setForestSelectedOption(null);
    setForestShowFeedback(false);
    setForestCompleted(false);
    setForestBadges([]);
  };

  // Guessing Game Actions
  const handleLetterClick = (letter: string, poolIndex: number) => {
    if (isGuessCorrect) return;

    // Find first empty slot
    const nextEmptyIdx = guessedLetters.indexOf('');
    if (nextEmptyIdx !== -1) {
      const nextGuessed = [...guessedLetters];
      nextGuessed[nextEmptyIdx] = letter;
      setGuessedLetters(nextGuessed);

      // Remove letter from pool visually by nullifying its index
      const nextPool = [...screenLettersPool];
      nextPool[poolIndex] = '';
      setScreenLettersPool(nextPool);

      // Check if complete and correct
      const fullAnswer = activeGuessScreen.answer.toUpperCase().replace(/\s/g, '');
      const currentGuessedStr = nextGuessed.join('');
      if (currentGuessedStr === fullAnswer) {
        setIsGuessCorrect(true);
        setGuessScore(prev => prev + 10);
      }
    }
  };

  const handleRemoveGuessedLetter = (idx: number) => {
    if (isGuessCorrect || !guessedLetters[idx]) return;

    const removedLetter = guessedLetters[idx];
    const nextGuessed = [...guessedLetters];
    nextGuessed[idx] = '';
    setGuessedLetters(nextGuessed);

    // Return letter back to the first empty slot in pool
    const emptyPoolIdx = screenLettersPool.indexOf('');
    if (emptyPoolIdx !== -1) {
      const nextPool = [...screenLettersPool];
      nextPool[emptyPoolIdx] = removedLetter;
      setScreenLettersPool(nextPool);
    } else {
      setScreenLettersPool(prev => [...prev, removedLetter]);
    }
  };

  const handleGuessNext = () => {
    if (currentScreenIndex < 10) {
      setCurrentScreenIndex(prev => prev + 1);
    } else if (currentLevel < 10) {
      setCurrentLevel(prev => prev + 1);
      setCurrentScreenIndex(1);
    } else {
      alert("Chúc mừng chiến binh nhí! Con đã chinh phục trọn vẹn 100 màn chơi đoán chữ kỹ năng của KidSkill!");
      setCurrentLevel(1);
      setCurrentScreenIndex(1);
      setGuessScore(0);
    }
  };

  const skipToLevelScreen = (lvl: number, scr: number) => {
    setCurrentLevel(lvl);
    setCurrentScreenIndex(scr);
  };

  return (
    <div id="game-dashboard-section" className="bg-[#FAF7F0] min-h-screen py-8 text-slate-800 font-sans selection:bg-amber-100 selection:text-slate-900">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* Top Header branding & Mode Selector */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 text-emerald-700">
              <Gamepad2 className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">Sân Chơi Kỹ Năng Tương Tác</h2>
              <p className="text-xs text-slate-500 font-sans">Vừa chơi vừa rèn luyện phản xạ sinh tồn & kiến thức đời sống</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 space-x-2 w-full md:w-auto">
            <button
              onClick={() => setGameMode('forest')}
              onMouseEnter={() => setIsForestHovered(true)}
              onMouseLeave={() => setIsForestHovered(false)}
              style={getForestStyle()}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                gameMode === 'forest' ? 'shadow-sm' : ''
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Thám Hiểm Rừng Xanh</span>
            </button>
            <button
              onClick={() => setGameMode('guessing')}
              onMouseEnter={() => setIsGuessingHovered(true)}
              onMouseLeave={() => setIsGuessingHovered(false)}
              style={getGuessingStyle()}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                gameMode === 'guessing' ? 'shadow-sm' : ''
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Nhìn Hình Đoán Chữ</span>
            </button>
          </div>
        </div>

        {/* --- GAME 1: FOREST SURVIVAL --- */}
        {gameMode === 'forest' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Game Stats Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <Compass className="h-5 w-5 animate-spin" style={{ color: primaryColor, animationDuration: '8s' }} />
                <div>
                  <h3 className="text-sm font-mono tracking-wider uppercase font-bold" style={{ color: primaryColor }}>Thám Hiểm Rừng Xanh</h3>
                  <p className="text-[10px] text-slate-500">Rèn kỹ năng sinh tồn thực tế dã ngoại</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Điểm Bản Lĩnh</p>
                  <div className="flex items-center justify-center space-x-1 text-amber-600 font-bold font-mono">
                    <Trophy className="h-4 w-4" />
                    <span>{forestScore}</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Mạng Sống</p>
                  <div className="flex items-center space-x-1 justify-center">
                    {[1, 2, 3].map(heartId => (
                      <Heart
                        key={heartId}
                        className={`h-4.5 w-4.5 transition ${
                          heartId <= forestLives ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Forest main view */}
            <AnimatePresence mode="wait">
              {!forestCompleted && forestLives > 0 ? (
                <motion.div
                  key={forestIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-mono font-bold" style={{ color: primaryColor }}>Tình huống {forestIndex + 1} / {FOREST_SCENARIOS.length}</span>
                    <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${((forestIndex + 1) / FOREST_SCENARIOS.length) * 100}%`, backgroundColor: primaryColor }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                    <div className="md:col-span-5 rounded-2xl overflow-hidden shadow-inner h-48 md:h-64 relative border border-slate-200 bg-slate-50">
                      <img
                        src={FOREST_SCENARIOS[forestIndex].image}
                        alt="Bối cảnh"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                    </div>

                    <div className="md:col-span-7 flex flex-col justify-center">
                      <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-800 leading-relaxed">
                        {FOREST_SCENARIOS[forestIndex].question}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {FOREST_SCENARIOS[forestIndex].options.map((option, idx) => {
                      const isSelected = forestSelectedOption === idx;
                      let btnStyle = "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700";

                      if (forestSelectedOption !== null) {
                        if (option.isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-medium";
                        } else if (isSelected) {
                          btnStyle = "bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500 font-medium";
                        } else {
                          btnStyle = "bg-slate-50/40 border-slate-200/50 text-slate-400 opacity-50 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={forestSelectedOption !== null}
                          onClick={() => handleForestSelect(idx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-sans flex items-start space-x-3 transition duration-200 cursor-pointer ${btnStyle}`}
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-grow">{option.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {forestShowFeedback && forestSelectedOption !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-xl border flex items-start space-x-3 ${
                        FOREST_SCENARIOS[forestIndex].options[forestSelectedOption].isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {FOREST_SCENARIOS[forestIndex].options[forestSelectedOption].isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold text-xs uppercase tracking-wider font-mono">
                          {FOREST_SCENARIOS[forestIndex].options[forestSelectedOption].isCorrect ? 'Tuyệt vời! +20 Điểm' : 'Cảnh báo an toàn! -1 Mạng'}
                        </p>
                        <p className="text-sm mt-1 leading-relaxed">
                          {FOREST_SCENARIOS[forestIndex].options[forestSelectedOption].feedback}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleForestNext}
                            style={{ backgroundColor: primaryColor }}
                            className="text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 cursor-pointer transition-all hover:opacity-90 shadow-sm"
                          >
                            <span>Tiếp Tục Thám Hiểm</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center max-w-2xl mx-auto"
                >
                  {forestLives <= 0 ? (
                    <>
                      <div className="w-16 h-16 bg-red-50 rounded-full border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
                        <ShieldAlert className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold font-sans text-red-600">Thử Thách Thất Bại!</h3>
                      <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-md mx-auto">
                        Con đã mất hết số mạng do các quyết định nguy hiểm dã ngoại. Đừng buồn nhé, đây là bài học rất tốt giúp con trưởng thành hơn!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-amber-50 rounded-full border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
                        <Award className="h-10 w-10 animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-bold font-sans text-amber-600">Chúc Mừng Chiến Binh Nhí!</h3>
                      <p className="text-slate-600 mt-2 text-sm max-w-md mx-auto">
                        Con đã xuất sắc hoàn thành trọn vẹn bản lĩnh thám hiểm rừng sâu thực tế của KynangCK!
                      </p>

                      <div className="mt-6">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Huy Hiệu Nhận Được:</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                          {forestBadges.length > 0 ? (
                            forestBadges.map((badge, idx) => (
                              <div key={idx} className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs text-emerald-800 font-medium flex items-center space-x-1.5 shadow-sm">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span>{badge}</span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-600">
                              Học Viên Rèn Luyện Thường Niên
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={resetForest}
                      style={{ backgroundColor: primaryColor }}
                      className="text-white font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 transition cursor-pointer hover:opacity-90 shadow"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Chơi Lại Trải Nghiệm</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* --- GAME 2: IMAGE GUESSING (NHÌN HÌNH ĐOÁN CHỮ) --- */}
        {gameMode === 'guessing' && (
          <div className="space-y-6">
            
            {/* Level & Screen selection drawer / panel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: accentColor }}>Màn chơi trí tuệ</span>
                  <h3 className="text-lg font-serif text-slate-800 font-bold">Lựa Chọn Cấp Độ (10 Levels x 10 Màn)</h3>
                </div>
                <div className="flex items-center space-x-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-mono text-amber-800 font-bold">Điểm Trí Tuệ: {guessScore}</span>
                </div>
              </div>

              {/* Levels Horizontal Switcher */}
              <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
                {Array.from({ length: 10 }).map((_, i) => {
                  const lvl = i + 1;
                  const isCurrent = currentLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => skipToLevelScreen(lvl, 1)}
                      style={isCurrent ? { backgroundColor: '#F08C3A', color: '#FFFFFF' } : undefined}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        isCurrent
                          ? 'shadow-sm bg-[#F08C3A] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-[#F3ECDC] hover:text-[#F08C3A] active:bg-[#F08C3A] active:text-white'
                      }`}
                    >
                      Cấp Độ {lvl}
                    </button>
                  );
                })}
              </div>

              {/* Screens Grid for current level */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, i) => {
                  const scrIndex = i + 1;
                  const isCurrent = currentScreenIndex === scrIndex;
                  return (
                    <button
                      key={scrIndex}
                      onClick={() => setCurrentScreenIndex(scrIndex)}
                      style={isCurrent ? { borderColor: '#F08C3A', color: '#F08C3A', backgroundColor: '#F08C3A12' } : undefined}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer text-center border ${
                        isCurrent
                          ? 'border-[#F08C3A] text-[#F08C3A] font-black'
                          : 'bg-slate-50 text-slate-500 hover:border-[#F3ECDC] border-slate-200/60 active:border-[#F08C3A]'
                      }`}
                    >
                      Màn {scrIndex}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Guessing Play Area */}
            {loadingScreens ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
                <p className="text-xs text-slate-400 font-mono">Đang tải cấu hình màn chơi từ CRM...</p>
              </div>
            ) : activeGuessScreen ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Visual clue card */}
                <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
                  <div className="relative aspect-video sm:aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <img
                      src={activeGuessScreen.image}
                      alt="KidSkill guessing clue"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      style={{ color: accentColor, backgroundColor: 'rgba(255, 255, 255, 0.9)' }} 
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono border border-slate-200 shadow-sm font-bold"
                    >
                      Cấp độ {currentLevel} • Màn {currentScreenIndex}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                    <button
                      onClick={() => setShowGuessHint(prev => !prev)}
                      style={{ color: accentColor }}
                      className="text-xs font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>{showGuessHint ? 'Ẩn gợi ý sinh tồn' : 'Xem gợi ý sinh tồn từ HLV'}</span>
                    </button>
                    
                    {showGuessHint && (
                      <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2 italic">
                        {activeGuessScreen.hint}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Interactive Slots and Letters Pool */}
                <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 space-y-8 shadow-sm">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-mono text-slate-500 uppercase tracking-widest">Nhấp Vào Ký Tự Gợi Ý Để Trả Lời</h4>
                    <p className="text-xs text-slate-400">Nhấp vào ô chữ đáp án để rút lại nếu con gõ sai nhé!</p>
                  </div>

                  {/* Guessing Slots (Grouped by word boundaries for clean spacing) */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {activeGuessScreen.answer.split(' ').map((word, wordIdx) => (
                      <div key={wordIdx} className="flex gap-1 border-r-2 border-slate-200 last:border-0 pr-2 last:pr-0">
                        {word.split('').map((_, charIdx) => {
                          const absoluteIdx = activeGuessScreen.answer
                            .split(' ')
                            .slice(0, wordIdx)
                            .join('').length + charIdx;
                          
                          const placedChar = guessedLetters[absoluteIdx];

                          return (
                            <button
                              key={charIdx}
                              onClick={() => handleRemoveGuessedLetter(absoluteIdx)}
                              style={placedChar ? { backgroundColor: '#009966' } : undefined}
                              className={`w-10 h-12 rounded-xl text-lg font-mono font-black flex items-center justify-center transition border cursor-pointer ${
                                placedChar
                                  ? 'text-white border-none scale-105 shadow-md'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {placedChar || ''}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Letter selection pool */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider text-center">Bảng ký tự gợi ý & đánh lừa tư duy</p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {screenLettersPool.map((letter, idx) => {
                        if (!letter) {
                          return (
                            <div
                              key={idx}
                              className="w-10 h-10 bg-slate-100 border border-dashed border-slate-200 rounded-lg opacity-40"
                            />
                          );
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => handleLetterClick(letter, idx)}
                            className="w-10 h-10 rounded-xl bg-slate-50 text-sm font-mono font-black text-slate-800 hover:bg-[#FFB900] hover:text-white hover:border-[#FFB900] transition border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset/Clear Action button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        const answer = activeGuessScreen.answer.toUpperCase().replace(/\s/g, '');
                        setGuessedLetters(new Array(answer.length).fill(''));
                        const pool = [...answer.split('')];
                        const alphabet = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY";
                        while (pool.length < Math.max(answer.length + 6, 12)) {
                          const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
                          pool.push(randLetter);
                        }
                        setScreenLettersPool(pool.sort(() => Math.random() - 0.5));
                      }}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-mono border border-slate-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Xóa hết làm lại màn này</span>
                    </button>
                  </div>

                  {/* Interactive Correct Feedback overlay */}
                  <AnimatePresence>
                    {isGuessCorrect && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl text-center space-y-4"
                      >
                        <div className="w-12 h-12 bg-white rounded-full border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                          <CheckCircle className="h-6 w-6 animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-emerald-800 font-serif">ĐÁP ÁN CHÍNH XÁC!</h4>
                          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                            Tuyệt vời! Từ khóa chính là: <span className="font-mono font-bold text-amber-600 text-sm tracking-wider uppercase">{activeGuessScreen.answer}</span>
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <button
                            onClick={handleGuessNext}
                            style={{ backgroundColor: primaryColor }}
                            className="text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center space-x-1 hover:opacity-90"
                          >
                            <span>Sang Màn Tiếp Theo</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-sm mt-2 text-slate-500">Không tìm thấy dữ liệu màn chơi đoán chữ nào phù hợp.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
