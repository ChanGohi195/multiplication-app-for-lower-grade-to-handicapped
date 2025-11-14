import { useState, useEffect } from 'react';
import { Users, Upload, Download, RotateCcw, BarChart3 } from 'lucide-react';
import { getAllUsers, calculateGlobalStats, UserWithStats } from '../../utils/adminUtils';

interface AdminDashboardProps {
  onNavigate: (screen: 'users' | 'import' | 'export' | 'reset' | 'stats') => void;
  onLogout: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    averageScore: 0,
    maxScore: 0,
    averageStreak: 0,
    maxStreak: 0,
    danAccuracy: {} as Record<number, { correct: number, total: number }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
    setStats(calculateGlobalStats(allUsers));
  };

  return (
    <div className="flex flex-col min-h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: '#F9F9F6' }}>
        <h1 style={{ fontSize: '24px', color: '#333333', fontWeight: 'bold' }}>
          管理ダッシュボード
        </h1>
        <button
          onClick={onLogout}
          className="active:scale-95 transition-transform"
          style={{ fontSize: '16px', color: '#E74C3C' }}
        >
          ログアウト
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Statistics Cards */}
        <div className="mb-6">
          <h2 style={{ fontSize: '18px', color: '#666666', marginBottom: '12px' }}>
            📊 統計情報
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Total Users */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                総ユーザー数
              </p>
              <p style={{ fontSize: '28px', color: '#4A90E2', fontWeight: 'bold' }}>
                {stats.totalUsers}
              </p>
            </div>

            {/* Active Today */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                今日の練習者
              </p>
              <p style={{ fontSize: '28px', color: '#F6C744', fontWeight: 'bold' }}>
                {stats.activeToday}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Average Score */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                平均スコア
              </p>
              <p style={{ fontSize: '28px', color: '#333333', fontWeight: 'bold' }}>
                {stats.averageScore}
              </p>
            </div>

            {/* Max Score */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                最高スコア
              </p>
              <p style={{ fontSize: '28px', color: '#E74C3C', fontWeight: 'bold' }}>
                {stats.maxScore}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Average Streak */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                平均連続日数
              </p>
              <p style={{ fontSize: '28px', color: '#333333', fontWeight: 'bold' }}>
                {stats.averageStreak}
                <span style={{ fontSize: '14px', color: '#666666' }}>日</span>
              </p>
            </div>

            {/* Max Streak */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                最長連続日数
              </p>
              <p style={{ fontSize: '28px', color: '#333333', fontWeight: 'bold' }}>
                {stats.maxStreak}
                <span style={{ fontSize: '14px', color: '#666666' }}>日</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <h2 style={{ fontSize: '18px', color: '#666666', marginBottom: '12px' }}>
            🛠️ 管理機能
          </h2>

          <button
            onClick={() => onNavigate('users')}
            className="w-full rounded-xl p-4 flex items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #4A90E2' }}
          >
            <Users size={24} color="#4A90E2" />
            <div className="ml-4 text-left flex-1">
              <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                ユーザー管理
              </p>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                アカウントの閲覧・削除・検索
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('stats')}
            className="w-full rounded-xl p-4 flex items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #F6C744' }}
          >
            <BarChart3 size={24} color="#F6C744" />
            <div className="ml-4 text-left flex-1">
              <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                成績管理
              </p>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                全体・個人の成績を確認
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('import')}
            className="w-full rounded-xl p-4 flex items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #F6C744' }}
          >
            <Upload size={24} color="#F6C744" />
            <div className="ml-4 text-left flex-1">
              <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                CSV一括登録
              </p>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                複数ユーザーを一括登録
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('export')}
            className="w-full rounded-xl p-4 flex items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #4A90E2' }}
          >
            <Download size={24} color="#4A90E2" />
            <div className="ml-4 text-left flex-1">
              <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                データエクスポート
              </p>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                CSV・JSON形式でダウンロード
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('reset')}
            className="w-full rounded-xl p-4 flex items-center active:scale-95 transition-transform"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #E74C3C' }}
          >
            <RotateCcw size={24} color="#E74C3C" />
            <div className="ml-4 text-left flex-1">
              <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                データリセット
              </p>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                成績またはアカウントの削除
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
