import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Welcome } from './components/Welcome';
import { DanSelection } from './components/DanSelection';
import { Practice } from './components/Practice';
import { My } from './components/My';
import { Result } from './components/Result';
import { Leaderboard } from './components/Leaderboard';

type Screen = 'login' | 'welcome' | 'home' | 'dan-selection' | 'practice' | 'weak-practice' | 'my' | 'result' | 'leaderboard';

interface Stats {
  todayCount: number;
  consecutiveDays: number;
  lastDate: string;
  danMistakes: Record<number, number>;
  problemMistakes: Record<string, number>; // e.g., "3x7": 5
  totalScore: number;
  highScore: number;
}

interface UserData {
  userId: string;
  nickname: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    consecutiveDays: 0,
    lastDate: new Date().toDateString(),
    danMistakes: {},
    problemMistakes: {},
    totalScore: 0,
    highScore: 0
  });
  const [lastGameResult, setLastGameResult] = useState({ correctCount: 0, score: 0, maxCombo: 0 });
  const [selectedDans, setSelectedDans] = useState<number[]>([]);

  // Load user and stats from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('kuku-user-v2');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setScreen('home');
      
      // Load stats
      const savedStats = localStorage.getItem('kuku-stats-v2');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        const today = new Date().toDateString();
        
        if (parsed.lastDate === today) {
          setStats(parsed);
        } else {
          // New day
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const wasYesterday = parsed.lastDate === yesterday.toDateString();
          
          const newStats = {
            todayCount: 0,
            consecutiveDays: wasYesterday ? parsed.consecutiveDays + 1 : 1,
            lastDate: today,
            danMistakes: parsed.danMistakes || {},
            problemMistakes: parsed.problemMistakes || {},
            totalScore: parsed.totalScore || 0,
            highScore: parsed.highScore || 0
          };
          setStats(newStats);
          
          // Sync to server
          if (parsedUser.userId) {
            syncStatsToServer(parsedUser.userId, newStats);
          }
        }
      }
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('kuku-user-v2', JSON.stringify(user));
    }
  }, [user]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('kuku-stats-v2', JSON.stringify(stats));
  }, [stats]);

  const syncStatsToServer = async (userId: string, statsToSync: Stats) => {
    try {
      const { updateUserStats } = await import('./utils/api');
      await updateUserStats(userId, {
        consecutiveDays: statsToSync.consecutiveDays,
        totalScore: statsToSync.totalScore,
        highScore: statsToSync.highScore,
        lastDate: statsToSync.lastDate
      });
    } catch (error) {
      console.error('Failed to sync stats to server:', error);
    }
  };

  const handlePracticeComplete = (correctCount: number, score: number, maxCombo: number) => {
    setLastGameResult({ correctCount, score, maxCombo });
    
    const newStats = {
      ...stats,
      todayCount: stats.todayCount + correctCount,
      totalScore: stats.totalScore + score,
      highScore: Math.max(stats.highScore, score)
    };
    
    setStats(newStats);
    
    // Sync to server
    if (user) {
      syncStatsToServer(user.userId, newStats);
    }
    
    setScreen('result');
  };

  const handleLogin = (userId: string, nickname: string) => {
    setUser({ userId, nickname });
    setScreen('home');
  };

  const handleShowWelcome = (userId: string, nickname: string) => {
    setUser({ userId, nickname });
    setScreen('welcome');
  };

  const handleLogout = () => {
    localStorage.removeItem('kuku-user-v2');
    localStorage.removeItem('kuku-stats-v2');
    setUser(null);
    setStats({
      todayCount: 0,
      consecutiveDays: 0,
      lastDate: new Date().toDateString(),
      danMistakes: {},
      problemMistakes: {},
      totalScore: 0,
      highScore: 0
    });
    setScreen('login');
  };

  const handleMistake = (dan: number, num2: number) => {
    const problemKey = `${dan}x${num2}`;

    setStats(prev => ({
      ...prev,
      danMistakes: {
        ...prev.danMistakes,
        [dan]: (prev.danMistakes[dan] || 0) + 1
      },
      problemMistakes: {
        ...prev.problemMistakes,
        [problemKey]: (prev.problemMistakes[problemKey] || 0) + 1
      }
    }));
  };

  const getWeakDans = () => {
    const dans = Object.entries(stats.danMistakes)
      .map(([dan, mistakes]) => ({ dan: parseInt(dan), mistakes }))
      .sort((a, b) => b.mistakes - a.mistakes);

    return dans;
  };

  const getWeakProblems = () => {
    const problems = Object.entries(stats.problemMistakes)
      .map(([problem, mistakes]) => {
        const [dan, num2] = problem.split('x').map(n => parseInt(n));
        return { dan, num2, problem, mistakes };
      })
      .sort((a, b) => b.mistakes - a.mistakes);

    return problems;
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5E5E5' }}>
      {/* Responsive Container */}
      <div 
        className="w-full h-screen md:h-auto md:max-w-[480px] md:rounded-3xl md:shadow-2xl overflow-hidden relative"
        style={{ 
          backgroundColor: '#F9F9F6',
          maxHeight: '100vh'
        }}
      >
        <div className="h-full flex flex-col md:min-h-[700px] md:max-h-[900px]">
          {/* Content */}
          <div className="flex-1 overflow-hidden relative">
            {screen === 'login' && (
              <Login 
                onLogin={handleLogin}
                onShowWelcome={handleShowWelcome}
              />
            )}
            {screen === 'welcome' && user && (
              <Welcome
                userId={user.userId}
                nickname={user.nickname}
                onContinue={() => setScreen('home')}
              />
            )}
            {screen === 'home' && (
              <Home
                onStartAll={() => {
                  setSelectedDans([]);
                  setScreen('practice');
                }}
                onStartSelect={() => setScreen('dan-selection')}
                onStartWeakProblems={() => setScreen('weak-practice')}
                onMyRecord={() => setScreen('my')}
                onLeaderboard={() => setScreen('leaderboard')}
              />
            )}
            {screen === 'dan-selection' && (
              <DanSelection
                onStart={(dans) => {
                  setSelectedDans(dans);
                  setScreen('practice');
                }}
                onBack={() => setScreen('home')}
              />
            )}
            {screen === 'practice' && (
              <Practice
                onComplete={handlePracticeComplete}
                onBack={() => setScreen('home')}
                selectedDans={selectedDans.length > 0 ? selectedDans : undefined}
                onMistake={handleMistake}
              />
            )}
            {screen === 'weak-practice' && (
              <Practice
                onComplete={handlePracticeComplete}
                onBack={() => setScreen('home')}
                specificProblems={getWeakProblems().length > 0
                  ? getWeakProblems().map(p => ({ dan: p.dan, num2: p.num2 }))
                  : undefined}
                onMistake={handleMistake}
              />
            )}
            {screen === 'result' && (
              <Result
                correctCount={lastGameResult.correctCount}
                score={lastGameResult.score}
                maxCombo={lastGameResult.maxCombo}
                onRetry={() => setScreen('practice')}
                onHome={() => setScreen('home')}
              />
            )}
            {screen === 'my' && user && (
              <My
                stats={{
                  todayCount: stats.todayCount,
                  consecutiveDays: stats.consecutiveDays,
                  weakDans: getWeakDans(),
                  weakProblems: getWeakProblems()
                }}
                userId={user.userId}
                nickname={user.nickname}
                onBack={() => setScreen('home')}
                onLogout={handleLogout}
              />
            )}
            {screen === 'leaderboard' && user && (
              <Leaderboard
                onBack={() => setScreen('home')}
                currentUserId={user.userId}
              />
            )}
          </div>

          {/* Home Indicator - Only on mobile */}
          <div className="h-5 flex items-center justify-center md:hidden" style={{ backgroundColor: '#F9F9F6' }}>
            <div className="w-32 h-1 rounded-full" style={{ backgroundColor: '#999999' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
