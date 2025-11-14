import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Welcome } from './components/Welcome';
import { DanSelection } from './components/DanSelection';
import { Practice, type ProblemRecord } from './components/Practice';
import { My } from './components/My';
import { Result } from './components/Result';
import { Leaderboard } from './components/Leaderboard';
import { Review } from './components/Review';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminImport } from './components/admin/AdminImport';
import { AdminExport } from './components/admin/AdminExport';
import { AdminReset } from './components/admin/AdminReset';
import { AdminStats } from './components/admin/AdminStats';
import { AdminGradeStats } from './components/admin/AdminGradeStats';

type Screen = 'login' | 'welcome' | 'home' | 'dan-selection' | 'practice' | 'my' | 'result' | 'leaderboard' | 'review' | 'admin-login' | 'admin-dashboard' | 'admin-users' | 'admin-import' | 'admin-export' | 'admin-reset' | 'admin-stats' | 'admin-grade-stats';

interface Stats {
  todayCount: number;
  consecutiveDays: number;
  lastDate: string;
  danMistakes: Record<number, number>;
  totalScore: number;
  highScore: number;
  problemHistory: ProblemRecord[];
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
    totalScore: 0,
    highScore: 0,
    problemHistory: []
  });
  const [lastGameResult, setLastGameResult] = useState({ correctCount: 0, score: 0, maxCombo: 0 });
  const [selectedDans, setSelectedDans] = useState<number[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(crypto.randomUUID());

  // Load user and stats from localStorage
  useEffect(() => {
    // Check if accessing admin URL
    if (window.location.pathname === '/admin') {
      const adminSession = localStorage.getItem('kuku-admin-session');
      if (adminSession === 'true') {
        setScreen('admin-dashboard');
      } else {
        setScreen('admin-login');
      }
      return;
    }

    const savedUser = localStorage.getItem('kuku-user-v2');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setScreen('home');

      // Load stats using user-specific key
      const savedStats = localStorage.getItem(`kuku-stats-${parsedUser.userId}`);
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
            totalScore: parsed.totalScore || 0,
            highScore: parsed.highScore || 0,
            problemHistory: parsed.problemHistory || []
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

  // Save stats to localStorage (user-specific)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`kuku-stats-${user.userId}`, JSON.stringify(stats));
    }
  }, [stats, user]);

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

  const handlePracticeComplete = (correctCount: number, score: number, maxCombo: number, problemHistory: ProblemRecord[]) => {
    setLastGameResult({ correctCount, score, maxCombo });
    
    const newStats = {
      ...stats,
      todayCount: stats.todayCount + correctCount,
      totalScore: stats.totalScore + score,
      highScore: Math.max(stats.highScore, score),
      problemHistory: [...stats.problemHistory, ...problemHistory]
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

    // Load user's saved stats from localStorage
    const savedStats = localStorage.getItem(`kuku-stats-${userId}`);
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
          totalScore: parsed.totalScore || 0,
          highScore: parsed.highScore || 0,
          problemHistory: parsed.problemHistory || []
        };
        setStats(newStats);
      }
    }

    setScreen('home');
  };

  const handleShowWelcome = (userId: string, nickname: string) => {
    setUser({ userId, nickname });
    setScreen('welcome');
  };

  const handleLogout = () => {
    // Save current user's stats before logout
    if (user) {
      localStorage.setItem(`kuku-stats-${user.userId}`, JSON.stringify(stats));
    }

    // Only remove current user info, keep stats data
    localStorage.removeItem('kuku-user-v2');
    setUser(null);
    setStats({
      todayCount: 0,
      consecutiveDays: 0,
      lastDate: new Date().toDateString(),
      danMistakes: {},
      totalScore: 0,
      highScore: 0,
      problemHistory: []
    });
    setScreen('login');
  };

  const getWeakDans = () => {
    const dans = Object.entries(stats.danMistakes)
      .map(([dan, mistakes]) => ({ dan: parseInt(dan), mistakes }))
      .sort((a, b) => b.mistakes - a.mistakes);

    return dans;
  };

  const handleAdminLogin = () => {
    setScreen('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('kuku-admin-session');
    setScreen('admin-login');
  };

  const handleAdminNavigate = (destination: 'users' | 'import' | 'export' | 'reset' | 'stats') => {
    const screenMap = {
      'users': 'admin-users' as Screen,
      'import': 'admin-import' as Screen,
      'export': 'admin-export' as Screen,
      'reset': 'admin-reset' as Screen,
      'stats': 'admin-stats' as Screen
    };
    setScreen(screenMap[destination]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5E5E5' }}>
      {/* Responsive Container */}
      <div
        className="w-full h-screen md:h-auto md:max-w-[768px] md:rounded-3xl md:shadow-2xl overflow-hidden relative"
        style={{
          backgroundColor: '#F9F9F6',
          maxHeight: '100vh'
        }}
      >
        <div className="h-full flex flex-col md:min-h-[700px] md:max-h-[900px]">
          {/* Content */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
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
                  setCurrentSessionId(crypto.randomUUID());
                  setScreen('practice');
                }}
                onStartSelect={() => setScreen('dan-selection')}
                onMyRecord={() => setScreen('my')}
                onLeaderboard={() => setScreen('leaderboard')}
                onReview={() => setScreen('review')}
              />
            )}
            {screen === 'dan-selection' && (
              <DanSelection
                onStart={(dans) => {
                  setSelectedDans(dans);
                  setCurrentSessionId(crypto.randomUUID());
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
                sessionId={currentSessionId}
              />
            )}
            {screen === 'result' && (
              <Result
                correctCount={lastGameResult.correctCount}
                score={lastGameResult.score}
                maxCombo={lastGameResult.maxCombo}
                onRetry={() => {
                  setCurrentSessionId(crypto.randomUUID());
                  setScreen('practice');
                }}
                onHome={() => setScreen('home')}
              />
            )}
            {screen === 'my' && user && (
              <My
                stats={{
                  todayCount: stats.todayCount,
                  consecutiveDays: stats.consecutiveDays,
                  weakDans: getWeakDans(),
                  totalScore: stats.totalScore,
                  highScore: stats.highScore,
                  problemHistory: stats.problemHistory
                }}
                userId={user.userId}
                nickname={user.nickname}
                onBack={() => setScreen('home')}
                onLogout={handleLogout}
                onStartPractice={(dans) => {
                  setSelectedDans(dans);
                  setCurrentSessionId(crypto.randomUUID());
                  setScreen('practice');
                }}
              />
            )}
            {screen === 'leaderboard' && user && (
              <Leaderboard
                onBack={() => setScreen('home')}
                currentUserId={user.userId}
              />
            )}
            {screen === 'review' && (
              <Review
                problemHistory={stats.problemHistory}
                onBack={() => setScreen('home')}
              />
            )}
            {screen === 'admin-login' && (
              <AdminLogin
                onLogin={handleAdminLogin}
                onBack={() => setScreen('login')}
              />
            )}
            {screen === 'admin-dashboard' && (
              <AdminDashboard
                onNavigate={handleAdminNavigate}
                onLogout={handleAdminLogout}
              />
            )}
            {screen === 'admin-users' && (
              <AdminUsers
                onBack={() => setScreen('admin-dashboard')}
              />
            )}
            {screen === 'admin-import' && (
              <AdminImport
                onBack={() => setScreen('admin-dashboard')}
              />
            )}
            {screen === 'admin-export' && (
              <AdminExport
                onBack={() => setScreen('admin-dashboard')}
              />
            )}
            {screen === 'admin-reset' && (
              <AdminReset
                onBack={() => setScreen('admin-dashboard')}
              />
            )}
            {screen === 'admin-stats' && (
              <AdminStats
                onBack={() => setScreen('admin-dashboard')}
                onNavigateGradeStats={() => setScreen('admin-grade-stats')}
                onNavigateUserStats={() => setScreen('admin-users')}
              />
            )}
            {screen === 'admin-grade-stats' && (
              <AdminGradeStats
                onBack={() => setScreen('admin-stats')}
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