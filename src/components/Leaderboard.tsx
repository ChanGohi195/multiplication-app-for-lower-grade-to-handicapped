import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Flame, Star } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
  currentUserId: string;
}

type LeaderboardType = 'streak' | 'totalScore' | 'highScore';

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  consecutiveDays?: number;
  totalScore?: number;
  highScore?: number;
}

export function Leaderboard({ onBack, currentUserId }: LeaderboardProps) {
  const [type, setType] = useState<LeaderboardType>('streak');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const { getStreakLeaderboard, getTotalScoreLeaderboard, getHighScoreLeaderboard } = await import('../utils/api');
      
      let result;
      if (type === 'streak') {
        result = await getStreakLeaderboard();
      } else if (type === 'totalScore') {
        result = await getTotalScoreLeaderboard();
      } else {
        result = await getHighScoreLeaderboard();
      }
      
      setData(result);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTabStyle = (tabType: LeaderboardType) => ({
    flex: 1,
    height: '48px',
    borderRadius: '12px',
    backgroundColor: type === tabType ? '#4A90E2' : '#FFFFFF',
    color: type === tabType ? '#FFFFFF' : '#666666',
    fontSize: '14px',
    transition: 'all 0.2s'
  });

  const getValueForEntry = (entry: LeaderboardEntry) => {
    if (type === 'streak') return `${entry.consecutiveDays}日`;
    if (type === 'totalScore') return `${entry.totalScore}点`;
    return `${entry.highScore}点`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#F6C744'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#E0E0E0';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy size={20} color="#FFFFFF" />;
    return null;
  };

  return (
    <div className="flex flex-col min-h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10" style={{ backgroundColor: '#F9F9F6' }}>
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <ArrowLeft size={24} color="#333333" />
        </button>
        
        <h2 style={{ fontSize: '20px', color: '#333333' }}>ランキング</h2>
        
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 p-1 rounded-2xl" style={{ backgroundColor: '#E5E5E5' }}>
          <button
            onClick={() => setType('streak')}
            className="flex items-center justify-center gap-1 active:scale-95 transition-transform"
            style={getTabStyle('streak')}
          >
            <Flame size={16} />
            <span>れんぞく</span>
          </button>
          <button
            onClick={() => setType('totalScore')}
            className="flex items-center justify-center gap-1 active:scale-95 transition-transform"
            style={getTabStyle('totalScore')}
          >
            <Star size={16} />
            <span>そうとくてん</span>
          </button>
          <button
            onClick={() => setType('highScore')}
            className="flex items-center justify-center gap-1 active:scale-95 transition-transform"
            style={getTabStyle('highScore')}
          >
            <Trophy size={16} />
            <span>さいこうてん</span>
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontSize: '16px', color: '#999999' }}>よみこみ ちゅう...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontSize: '16px', color: '#999999' }}>まだ データが ありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((entry) => (
              <div
                key={entry.rank}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                {/* Rank */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: getRankColor(entry.rank)
                  }}
                >
                  {getRankIcon(entry.rank) || (
                    <span style={{ fontSize: '16px', color: '#666666' }}>
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Nickname */}
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{ fontSize: '16px', color: '#333333' }}
                  >
                    {entry.nickname}
                  </p>
                </div>

                {/* Value */}
                <div className="flex-shrink-0">
                  <p style={{ fontSize: '18px', color: '#4A90E2' }}>
                    {getValueForEntry(entry)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Home Button */}
      <div className="px-6 pb-6 pt-4">
        <button
          onClick={onBack}
          className="w-full rounded-2xl active:scale-95 transition-transform"
          style={{ 
            height: '64px',
            backgroundColor: '#4A90E2',
            color: '#FFFFFF',
            fontSize: '20px'
          }}
        >
          ホームに もどる
        </button>
      </div>
    </div>
  );
}