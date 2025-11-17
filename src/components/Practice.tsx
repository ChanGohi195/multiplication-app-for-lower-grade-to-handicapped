import { useState, useEffect } from 'react';
import { Volume2, ArrowLeft } from 'lucide-react';

export interface ProblemRecord {
  dan: number;
  num2: number;
  isCorrect: boolean;
  responseTime: number; // in milliseconds
  timestamp: number; // Unix timestamp
  sessionId: string; // Session identifier
}

interface PracticeProps {
  onComplete: (correctCount: number, score: number, maxCombo: number, problemHistory: ProblemRecord[]) => void;
  onBack: () => void;
  selectedDans?: number[]; // If provided, only generate problems from these dans
  sessionId: string; // Session identifier for tracking
}

export function Practice({ onComplete, onBack, selectedDans, sessionId }: PracticeProps) {
  const [dan, setDan] = useState(3);
  const [num2, setNum2] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  
  // Game state
  const [timeLeft, setTimeLeft] = useState(40);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [comboLevel, setComboLevel] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  
  // Score popup animation
  const [scorePopup, setScorePopup] = useState<{ points: number; show: boolean }>({ points: 0, show: false });
  const [comboUpEffect, setComboUpEffect] = useState(false);
  
  // Problem tracking
  const [problemHistory, setProblemHistory] = useState<ProblemRecord[]>([]);
  const [problemStartTime, setProblemStartTime] = useState<number>(Date.now());

  const baseScore = 10;

  // Calculate score based on combo level
  // Level 0: 10, Level 1: 15, Level 2: 23, Level 3: 35, Level 4: 53...
  // Each level multiplies by 1.5 and rounds up
  const getScoreForLevel = (level: number): number => {
    return Math.ceil(baseScore * Math.pow(1.5, level));
  };

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    
    if (timeLeft <= 0) {
      onComplete(correctCount, score, maxCombo, problemHistory);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPlaying, correctCount, score, maxCombo, problemHistory, onComplete]);

  useEffect(() => {
    generateNewProblem();
  }, []);

  const generateNewProblem = () => {
    // Generate dan from selected dans or all dans (1-9)
    let newDan: number;
    if (selectedDans && selectedDans.length > 0) {
      newDan = selectedDans[Math.floor(Math.random() * selectedDans.length)];
    } else {
      newDan = Math.floor(Math.random() * 9) + 1;
    }
    
    const newNum2 = Math.floor(Math.random() * 9) + 1;
    const answer = newDan * newNum2;
    
    setDan(newDan);
    setNum2(newNum2);
    setCorrectAnswer(answer);
    setFeedback('none');
    setSelectedChoice(null);
    setProblemStartTime(Date.now()); // Reset timer for new problem
    
    // Generate 4 choices including the correct answer
    const wrongChoices: number[] = [];
    while (wrongChoices.length < 3) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrongAnswer = answer + offset;
      if (wrongAnswer !== answer && wrongAnswer > 0 && wrongAnswer <= 81 && !wrongChoices.includes(wrongAnswer)) {
        wrongChoices.push(wrongAnswer);
      }
    }
    
    const allChoices = [...wrongChoices, answer];
    // Shuffle choices
    for (let i = allChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
    }
    
    setChoices(allChoices);
  };

  const handleChoiceClick = (choice: number) => {
    if (feedback !== 'none' || !isPlaying) return;
    
    setSelectedChoice(choice);
    
    const responseTime = Date.now() - problemStartTime;
    const isCorrect = choice === correctAnswer;
    
    // Record the problem
    setProblemHistory(prev => [...prev, {
      dan,
      num2,
      isCorrect,
      responseTime,
      timestamp: Date.now(),
      sessionId
    }]);
    
    if (isCorrect) {
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);
      
      // Increase consecutive correct count
      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);
      
      // Level up every 2 correct answers
      let newComboLevel = comboLevel;
      let leveledUp = false;
      if (newConsecutiveCorrect >= 2) {
        newComboLevel = comboLevel + 1;
        setComboLevel(newComboLevel);
        setMaxCombo(current => Math.max(current, newComboLevel));
        setConsecutiveCorrect(0);
        leveledUp = true;
      }
      
      // Calculate score gain
      const scoreGain = getScoreForLevel(newComboLevel);
      setScore(prev => prev + scoreGain);
      
      // Show score popup
      setScorePopup({ points: scoreGain, show: true });
      setTimeout(() => setScorePopup({ points: 0, show: false }), 800);
      
      // Show combo up effect only when leveled up
      if (leveledUp) {
        setComboUpEffect(true);
        setTimeout(() => setComboUpEffect(false), 500);
      }
      
      // Immediately generate next problem - no delay
      setTimeout(() => {
        generateNewProblem();
      }, 300);
    } else {
      setFeedback('incorrect');
      
      // Reset consecutive correct count
      setConsecutiveCorrect(0);
      
      // Penalty: -3 levels
      setComboLevel(prev => Math.max(prev - 3, 0));
      
      // Time penalty: -5 seconds
      setTimeLeft(prev => Math.max(prev - 5, 0));
      
      setTimeout(() => {
        setFeedback('none');
        setSelectedChoice(null);
      }, 600);
    }
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(`${dan} かける ${num2} は？`);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const getTimeColor = () => {
    if (timeLeft > 20) return '#4A90E2';
    if (timeLeft > 10) return '#F6C744';
    return '#F5977A'; // Soft orange, not strong red
  };

  return (
    <div className="flex flex-col min-h-full mx-auto w-full" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10" style={{ backgroundColor: '#F9F9F6' }}>
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <ArrowLeft size={24} color="#333333" />
        </button>
        
        {/* Score and Combo Display */}
        <div className="flex flex-col items-end gap-1">
          <div 
            className="px-4 py-1 rounded-full"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <span style={{ fontSize: '20px', color: '#4A90E2' }}>{score}</span>
            <span style={{ fontSize: '14px', color: '#999999', marginLeft: '4px' }}>pt</span>
          </div>
          <div 
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
              comboUpEffect ? 'animate-pulse scale-110' : ''
            }`}
            style={{ backgroundColor: comboLevel > 0 ? '#F6C744' : '#FFFFFF' }}
          >
            <span style={{ fontSize: '16px' }}>🔥</span>
            <span style={{ fontSize: '16px', color: '#333333' }}>×{comboLevel}</span>
          </div>
        </div>
        
        <button
          onClick={handleSpeak}
          className="w-12 h-12 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ backgroundColor: '#4A90E2' }}
        >
          <Volume2 size={24} color="#FFFFFF" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-4">
        {/* Timer */}
        <div className="mt-4 w-full max-w-[420px] md:max-w-[620px]">
          <div className="text-center mb-2">
            <div 
              style={{ 
                fontSize: '16px',
                color: '#666666'
              }}
            >
              のこり じかん
            </div>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{
              height: '8px',
              backgroundColor: '#E0E0E0'
            }}
          >
            <div 
              className="h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ 
                width: `${(timeLeft / 40) * 100}%`,
                backgroundColor: getTimeColor()
              }}
            />
          </div>
          <div className="text-center mt-2">
            <span
              style={{
                fontSize: '20px',
                color: getTimeColor()
              }}
            >
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Problem with Score Popup */}
        <div className="text-center relative mt-8 md:mt-12">
          <div
            style={{
              fontSize: '100px',
              color: '#333333',
              lineHeight: '1.1',
              fontWeight: 'bold'
            }}
          >
            {dan} × {num2} = ?
          </div>
          
          {/* Score Popup Animation */}
          {scorePopup.show && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 animate-float-up"
              style={{ 
                top: '-40px',
                fontSize: '32px',
                color: '#F6C744',
                fontWeight: 'bold',
                pointerEvents: 'none'
              }}
            >
              +{scorePopup.points}
            </div>
          )}
        </div>

        {/* Choices */}
        <div className="w-full max-w-[380px] md:max-w-full mt-12 md:mt-16">
          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-4">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceClick(choice)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (feedback === 'none' && isPlaying) {
                    handleChoiceClick(choice);
                  }
                }}
                disabled={feedback !== 'none' || !isPlaying}
                className={`rounded-2xl transition-all font-bold active:scale-95 ${
                  feedback === 'incorrect' && selectedChoice === choice
                    ? 'animate-wiggle'
                    : ''
                } ${
                  feedback === 'correct' && selectedChoice === choice
                    ? 'scale-110'
                    : ''
                }`}
                style={{
                  height: '120px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    feedback === 'correct' && selectedChoice === choice
                      ? '#F6C744'
                      : feedback === 'incorrect' && selectedChoice === choice
                      ? '#F5977A'
                      : '#FFFFFF',
                  color: '#333333',
                  border: '2px solid #E0E0E0',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
              >
                {choice}
              </button>
            ))}
          </div>
          
          {/* Helper Text */}
          <div 
            className="text-center"
            style={{ 
              fontSize: '16px',
              color: '#666666'
            }}
          >
            こたえを えらんでね
          </div>
        </div>
      </div>
    </div>
  );
}