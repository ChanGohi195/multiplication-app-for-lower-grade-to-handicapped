interface WelcomeProps {
  userId: string;
  nickname: string;
  onContinue: () => void;
}

export function Welcome({ userId, nickname, onContinue }: WelcomeProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    // Show a brief feedback
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = '✓ コピーしたよ！';
      setTimeout(() => {
        btn.innerText = originalText;
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full mx-auto w-full md:max-w-[480px] overflow-y-auto" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-[360px]">
          {/* Success Emoji */}
          <div className="text-center mb-8">
            <div style={{ fontSize: '80px', lineHeight: '1' }}>🎉</div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h1 style={{ fontSize: '24px', color: '#333333', lineHeight: '1.4', marginBottom: '8px' }}>
              ようこそ、{nickname}さん！
            </h1>
            <p style={{ fontSize: '16px', color: '#666666', lineHeight: '1.6' }}>
              とうろく かんりょう！
            </p>
          </div>

          {/* User ID Display */}
          <div 
            className="rounded-3xl p-6 mb-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="text-center mb-4">
              <div style={{ fontSize: '18px', color: '#333333', marginBottom: '8px' }}>
                📱 あなたの ユーザーID
              </div>
              <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                この ばんごうを おぼえて おいてね！
              </p>
            </div>

            <div 
              className="rounded-xl p-4 mb-4"
              style={{ 
                backgroundColor: '#F9F9F6',
                border: '2px dashed #4A90E2'
              }}
            >
              <div 
                className="break-all text-center"
                style={{ 
                  fontSize: '16px', 
                  color: '#4A90E2',
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px'
                }}
              >
                {userId}
              </div>
            </div>

            <button
              id="copy-btn"
              onClick={handleCopy}
              className="w-full rounded-xl active:scale-95 transition-transform"
              style={{
                height: '48px',
                backgroundColor: '#4A90E2',
                color: '#FFFFFF',
                fontSize: '16px'
              }}
            >
              📋 コピーする
            </button>
          </div>

          {/* PIN保管の重要なお知らせ */}
          <div 
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: '#FFEBE6', border: '2px solid #F5977A' }}
          >
            <div className="text-center mb-3">
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>📝</div>
              <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.8' }}>
                <span style={{ color: '#F5977A' }}>たいせつな おねがい</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div style={{ fontSize: '20px', flexShrink: 0 }}>✏️</div>
                <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>
                  この ユーザーIDと、さっき きめた <span style={{ color: '#F5977A' }}>4けたの ばんごう</span>を ノートや メモに かいて おこう
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div style={{ fontSize: '20px', flexShrink: 0 }}>🔒</div>
                <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>
                  おうちの ひとと いっしょに だいじに しまって おいてね
                </p>
              </div>
            </div>
          </div>

          {/* その他のヒント */}
          <div 
            className="rounded-2xl p-5 mb-8"
            style={{ backgroundColor: '#FFF4E6', border: '2px solid #F6C744' }}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div style={{ fontSize: '20px', flexShrink: 0 }}>💡</div>
                <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>
                  この ばんごうが あれば、べつの たんまつ（タブレットや パソコン）でも つづきから できるよ！
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div style={{ fontSize: '20px', flexShrink: 0 }}>📸</div>
                <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>
                  スクリーンショットを とって おくのも いいね！
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full rounded-2xl active:scale-95 transition-transform"
            style={{
              height: '64px',
              backgroundColor: '#4A90E2',
              color: '#FFFFFF',
              fontSize: '20px'
            }}
          >
            はじめる ▶
          </button>
        </div>
      </div>
    </div>
  );
}
