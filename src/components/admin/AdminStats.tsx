import { ArrowLeft, BarChart3, Users } from 'lucide-react';

interface AdminStatsProps {
  onBack: () => void;
  onNavigateGradeStats: () => void;
  onNavigateUserStats: () => void;
}

export function AdminStats({ onBack, onNavigateGradeStats, onNavigateUserStats }: AdminStatsProps) {
  return (
    <div className="flex flex-col min-h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: '#F9F9F6' }}>
        <button
          onClick={onBack}
          className="active:scale-95 transition-transform"
          style={{ fontSize: '18px', color: '#4A90E2' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '20px', color: '#333333', fontWeight: 'bold' }}>
          成績管理
        </h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col justify-center">
        <p style={{ fontSize: '16px', color: '#666666', marginBottom: '24px', textAlign: 'center' }}>
          閲覧する統計を選択してください
        </p>

        <div className="space-y-4">
          {/* Grade Stats Button */}
          <button
            onClick={onNavigateGradeStats}
            className="w-full rounded-xl p-6 flex flex-col items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #4A90E2' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: '#E6F7FF' }}
            >
              <BarChart3 size={32} color="#4A90E2" />
            </div>
            <p style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
              全体統計を見る
            </p>
            <p style={{ fontSize: '14px', color: '#666666', textAlign: 'center' }}>
              学年・クラスごとの統計情報を確認
            </p>
          </button>

          {/* User Stats Button */}
          <button
            onClick={onNavigateUserStats}
            className="w-full rounded-xl p-6 flex flex-col items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #F6C744' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: '#FFF9E6' }}
            >
              <Users size={32} color="#F6C744" />
            </div>
            <p style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
              個人統計を見る
            </p>
            <p style={{ fontSize: '14px', color: '#666666', textAlign: 'center' }}>
              ユーザーごとの詳細な成績を確認
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
