import { useState } from 'react';
import { type ProblemRecord } from './Practice';

interface MyProps {
  stats: {
    todayCount: number;
    consecutiveDays: number;
    weakDans: { dan: number; mistakes: number }[];
    totalScore: number;
    highScore: number;
    problemHistory: ProblemRecord[];
  };
  userId: string;
  nickname: string;
  onBack: () => void;
  onLogout: () => void;
  onStartPractice: (dans: number[]) => void;
}

export function My({ stats, userId, nickname, onBack, onLogout, onStartPractice }: MyProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // 全体正解率を計算
  const calculateOverallAccuracy = (): number => {
    if (stats.problemHistory.length === 0) return 0;
    const correctCount = stats.problemHistory.filter(p => p.isCorrect).length;
    return Math.round((correctCount / stats.problemHistory.length) * 100);
  };

  // 得意な段を計算（正解率が高い順、試行回数3回以上）
  const calculateStrongDans = (): { dan: number; accuracy: number; attempts: number }[] => {
    const danStats: Record<number, { correct: number; total: number }> = {};

    // 各段の統計を集計
    stats.problemHistory.forEach(record => {
      if (!danStats[record.dan]) {
        danStats[record.dan] = { correct: 0, total: 0 };
      }
      danStats[record.dan].total++;
      if (record.isCorrect) {
        danStats[record.dan].correct++;
      }
    });

    // 試行回数3回以上の段を抽出し、正解率を計算
    const result = Object.entries(danStats)
      .filter(([_, stat]) => stat.total >= 3)
      .map(([dan, stat]) => ({
        dan: parseInt(dan),
        accuracy: Math.round((stat.correct / stat.total) * 100),
        attempts: stat.total
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);

    return result;
  };

  const overallAccuracy = calculateOverallAccuracy();
  const strongDans = calculateStrongDans();

  const handleExportData = () => {
    const userData = localStorage.getItem(`kuku-user-data-${userId}`);
    const userStats = localStorage.getItem(`kuku-stats-${userId}`);

    const exportData = {
      userData: userData ? JSON.parse(userData) : null,
      stats: userStats ? JSON.parse(userStats) : stats,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kuku-backup-${nickname}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target?.result as string);

        if (importData.userData) {
          localStorage.setItem(`kuku-user-data-${userId}`, JSON.stringify(importData.userData));
        }

        if (importData.stats) {
          localStorage.setItem(`kuku-stats-${userId}`, JSON.stringify(importData.stats));
        }

        alert('データを ふっきゅう しました！\nページを さいどう してね。');
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        alert('データの ふっきゅうに しっぱい しました');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-full mx-auto w-full" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header with Back Button */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{ backgroundColor: '#F9F9F6' }}>
        <button
          onClick={onBack}
          className="active:scale-95 transition-transform flex items-center gap-2"
          style={{ fontSize: '18px', color: '#4A90E2' }}
        >
          <span>←</span>
          <span>もどる</span>
        </button>
        <div style={{ fontSize: '18px', color: '#333333' }}>
          {nickname}さん
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="active:scale-95 transition-transform"
          style={{ fontSize: '16px', color: '#999999' }}
        >
          ログアウト
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-8 pb-16 overflow-auto">
        <div className="w-full max-w-[360px] md:max-w-[540px]">
          {/* Title */}
          <div className="text-center mb-10 mt-2">
            <div className="mb-4" style={{ fontSize: '56px' }}>📊</div>
            <h2 style={{ fontSize: '24px', color: '#333333' }}>わたしの きろく</h2>
          </div>

          {/* Stats Cards */}
          <div className="space-y-5 mb-8">
            {/* Today Count */}
            <div
              className="rounded-3xl p-6 text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div
                className="mb-2"
                style={{
                  fontSize: '48px',
                  color: '#4A90E2',
                  lineHeight: '1'
                }}
              >
                {stats.todayCount}
              </div>
              <div style={{ fontSize: '18px', color: '#666666' }}>
                きょう <span style={{ color: '#4A90E2' }}>{stats.todayCount}</span>かい がんばった！
              </div>
            </div>

            {/* Consecutive Days */}
            <div
              className="rounded-3xl p-6 text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div
                className="mb-2"
                style={{
                  fontSize: '48px',
                  color: '#F6C744',
                  lineHeight: '1'
                }}
              >
                {stats.consecutiveDays}
              </div>
              <div style={{ fontSize: '18px', color: '#666666' }}>
                つづけて <span style={{ color: '#F6C744' }}>{stats.consecutiveDays}</span>にち
              </div>
            </div>

            {/* Overall Accuracy */}
            <div
              className="rounded-3xl p-6 text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div
                className="mb-2"
                style={{
                  fontSize: '48px',
                  color: '#4A90E2',
                  lineHeight: '1'
                }}
              >
                {overallAccuracy}%
              </div>
              <div style={{ fontSize: '18px', color: '#666666' }}>
                ぜんたい せいかいりつ
              </div>
              {stats.problemHistory.length > 0 && (
                <div style={{ fontSize: '14px', color: '#999999', marginTop: '8px' }}>
                  {stats.problemHistory.length}もんだい ちょうせん
                </div>
              )}
            </div>

            {/* Strong Dans */}
            {strongDans.length > 0 && (
              <div
                className="rounded-3xl p-6"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div
                  className="text-center mb-4"
                  style={{ fontSize: '18px', color: '#333333' }}
                >
                  とくい トップ3
                </div>
                <div className="space-y-3">
                  {strongDans.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ backgroundColor: '#E6F7FF' }}
                    >
                      <div style={{ fontSize: '20px', color: '#333333' }}>
                        {item.dan}の だん
                      </div>
                      <div style={{ fontSize: '18px', color: '#4A90E2', fontWeight: 'bold' }}>
                        {item.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Dans */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div
                className="text-center mb-4"
                style={{ fontSize: '18px', color: '#333333' }}
              >
                にがて トップ3
              </div>
              <div className="space-y-3">
                {stats.weakDans.length > 0 ? (
                  <>
                    {stats.weakDans.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-xl p-4"
                        style={{ backgroundColor: '#FEE' }}
                      >
                        <div className="flex-1">
                          <div style={{ fontSize: '20px', color: '#333333' }}>
                            {item.dan}の だん
                          </div>
                          <div style={{ fontSize: '14px', color: '#F5977A' }}>
                            {item.mistakes}かい まちがえた
                          </div>
                        </div>
                        <button
                          onClick={() => onStartPractice([item.dan])}
                          className="rounded-lg px-4 py-2 active:scale-95 transition-transform"
                          style={{
                            backgroundColor: '#E74C3C',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          れんしゅう
                        </button>
                      </div>
                    ))}
                    {stats.weakDans.length >= 2 && (
                      <button
                        onClick={() => onStartPractice(stats.weakDans.slice(0, 3).map(d => d.dan))}
                        className="w-full rounded-xl py-4 active:scale-95 transition-transform"
                        style={{
                          backgroundColor: '#E74C3C',
                          color: '#FFFFFF',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        まとめて れんしゅう
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    className="text-center py-4"
                    style={{ fontSize: '16px', color: '#999999' }}
                  >
                    まだ データが ありません
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Encouragement */}
          {stats.todayCount > 0 && (
            <div className="text-center mb-8">
              <div style={{ fontSize: '32px' }}>
                {stats.todayCount >= 10 ? '🌟 すごい！' : '💪 がんばってるね！'}
              </div>
            </div>
          )}

          {/* Login Info Section */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <button
              onClick={() => setShowUserId(!showUserId)}
              className="w-full text-left flex items-center justify-between active:scale-95 transition-transform"
            >
              <div style={{ fontSize: '16px', color: '#333333' }}>
                🔑 ログイン じょうほう
              </div>
              <div style={{ fontSize: '20px', color: '#999999' }}>
                {showUserId ? '▼' : '▶'}
              </div>
            </button>

            {showUserId && (
              <div className="mt-4 space-y-3">
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#F9F9F6' }}
                >
                  <div style={{ fontSize: '14px', color: '#666666', marginBottom: '8px' }}>
                    ニックネーム
                  </div>
                  <div
                    className="text-center"
                    style={{
                      fontSize: '20px',
                      color: '#4A90E2',
                      fontWeight: '600'
                    }}
                  >
                    {nickname}
                  </div>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#FFF4E6', border: '1px dashed #F6C744' }}
                >
                  <div className="flex items-start gap-2">
                    <div style={{ fontSize: '16px' }}>🔒</div>
                    <p style={{ fontSize: '13px', color: '#666666', lineHeight: '1.6' }}>
                      ログインには このニックネームと<br />
                      とうろく したときの <span style={{ color: '#F6C744' }}>4けたの ばんごう</span> が ひつようだよ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Backup Section */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <button
              onClick={() => setShowBackup(!showBackup)}
              className="w-full text-left flex items-center justify-between active:scale-95 transition-transform"
            >
              <div style={{ fontSize: '16px', color: '#333333' }}>
                💾 データを バックアップ
              </div>
              <div style={{ fontSize: '20px', color: '#999999' }}>
                {showBackup ? '▼' : '▶'}
              </div>
            </button>

            {showBackup && (
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full rounded-xl active:scale-95 transition-transform"
                  style={{
                    height: '48px',
                    backgroundColor: '#4A90E2',
                    color: '#FFFFFF',
                    fontSize: '16px'
                  }}
                >
                  📥 データを ほぞん
                </button>

                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file-input"
                  />
                  <label
                    htmlFor="import-file-input"
                    className="w-full rounded-xl active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                    style={{
                      height: '48px',
                      backgroundColor: '#F6C744',
                      color: '#333333',
                      fontSize: '16px'
                    }}
                  >
                    📤 データを ふっきゅう
                  </label>
                </div>

                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: '#FFF4E6', border: '1px dashed #F6C744' }}
                >
                  <p style={{ fontSize: '12px', color: '#666666', lineHeight: '1.7' }}>
                    💡 データを ファイルに ほぞん できるよ！<br />
                    べつの たんまつに うつす ときや、<br />
                    データが きえた ときに つかえるよ
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50 }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="rounded-3xl p-8 max-w-[320px] w-full"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
              <h3 style={{ fontSize: '20px', color: '#333333', marginBottom: '12px' }}>
                ログアウト しますか？
              </h3>
              <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                また ログインする ときは<br />
                ニックネームと ばんごう が ひつよう だよ
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={onLogout}
                className="w-full rounded-2xl active:scale-95 transition-transform"
                style={{
                  height: '56px',
                  backgroundColor: '#E74C3C',
                  color: '#FFFFFF',
                  fontSize: '18px'
                }}
              >
                ログアウト
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full rounded-2xl active:scale-95 transition-transform"
                style={{
                  height: '56px',
                  backgroundColor: '#E5E5E5',
                  color: '#333333',
                  fontSize: '18px'
                }}
              >
                やめる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}