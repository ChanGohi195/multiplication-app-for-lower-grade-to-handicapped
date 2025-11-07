import { useState } from 'react';

interface MyProps {
  stats: {
    todayCount: number;
    consecutiveDays: number;
    weakDans: { dan: number; mistakes: number }[];
    weakProblems: { dan: number; num2: number; problem: string; mistakes: number }[];
  };
  userId: string;
  nickname: string;
  onBack: () => void;
  onLogout: () => void;
}

export function My({ stats, userId, nickname, onBack, onLogout }: MyProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserId, setShowUserId] = useState(false);

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    const btn = document.getElementById('copy-user-id-btn');
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = '✓ コピーした！';
      setTimeout(() => {
        btn.innerText = originalText;
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header with Back Button */}
      <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#F9F9F6' }}>
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
      <div className="flex-1 flex flex-col items-center px-8 pb-8 overflow-auto">
        <div className="w-full max-w-[360px]">
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

            {/* Weak Dans */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div
                className="text-center mb-4"
                style={{ fontSize: '18px', color: '#333333' }}
              >
                にがての だん トップ3
              </div>
              <div className="space-y-3">
                {stats.weakDans.length > 0 ? (
                  stats.weakDans.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <div style={{ fontSize: '20px', color: '#333333' }}>
                        {item.dan}の だん
                      </div>
                      <div style={{ fontSize: '18px', color: '#F5977A' }}>
                        {item.mistakes}かい
                      </div>
                    </div>
                  ))
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

            {/* Weak Problems */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div
                className="text-center mb-4"
                style={{ fontSize: '18px', color: '#333333' }}
              >
                にがての もんだい トップ5
              </div>
              <div className="space-y-3">
                {stats.weakProblems.length > 0 ? (
                  stats.weakProblems.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <div style={{ fontSize: '20px', color: '#333333' }}>
                        {item.dan} × {item.num2}
                      </div>
                      <div style={{ fontSize: '18px', color: '#F5977A' }}>
                        {item.mistakes}かい
                      </div>
                    </div>
                  ))
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

          {/* User ID Section */}
          <div 
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <button
              onClick={() => setShowUserId(!showUserId)}
              className="w-full text-left flex items-center justify-between active:scale-95 transition-transform"
            >
              <div style={{ fontSize: '16px', color: '#333333' }}>
                📱 ユーザーID を みる
              </div>
              <div style={{ fontSize: '20px', color: '#999999' }}>
                {showUserId ? '▼' : '▶'}
              </div>
            </button>
            
            {showUserId && (
              <div className="mt-4 space-y-3">
                <div 
                  className="rounded-xl p-3"
                  style={{ backgroundColor: '#F9F9F6' }}
                >
                  <div 
                    className="break-all text-center"
                    style={{ 
                      fontSize: '14px', 
                      color: '#4A90E2',
                      fontFamily: 'monospace'
                    }}
                  >
                    {userId}
                  </div>
                </div>
                <button
                  id="copy-user-id-btn"
                  onClick={handleCopyUserId}
                  className="w-full rounded-xl active:scale-95 transition-transform"
                  style={{
                    height: '40px',
                    backgroundColor: '#4A90E2',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  📋 コピー
                </button>
                <p style={{ fontSize: '12px', color: '#999999', textAlign: 'center', lineHeight: '1.5' }}>
                  べつの たんまつで ログインする ときに つかうよ
                </p>
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
                ユーザーID が ひつよう だよ
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
