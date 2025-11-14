import { Home } from 'lucide-react';

interface WelcomeProps {
  userId: string;
  nickname: string;
  onContinue: () => void;
}

export function Welcome({ userId, nickname, onContinue }: WelcomeProps) {
  return (
    <div className="flex flex-col min-h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10" style={{ backgroundColor: '#F9F9F6' }}>
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-4 h-12 rounded-full active:scale-95 transition-transform"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Home size={20} color="#4A90E2" />
          <span style={{ fontSize: '16px', color: '#4A90E2' }}>ホーム</span>
        </button>

        <div className="flex-1" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-8 pt-12 pb-24">
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

          {/* ニックネームとPIN保管のお知らせ */}
          <div
            className="rounded-3xl p-6 mb-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="text-center mb-4">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
              <div style={{ fontSize: '20px', color: '#333333', marginBottom: '8px' }}>
                あなたの ニックネーム
              </div>
              <div
                className="rounded-xl p-4 mb-3"
                style={{
                  backgroundColor: '#F9F9F6',
                  border: '2px solid #4A90E2'
                }}
              >
                <div style={{ fontSize: '24px', color: '#4A90E2', fontWeight: '600' }}>
                  {nickname}
                </div>
              </div>
            </div>
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
                  ニックネーム「<span style={{ color: '#4A90E2', fontWeight: '600' }}>{nickname}</span>」と、さっき きめた <span style={{ color: '#F5977A' }}>4けたの ばんごう</span>を ノートや メモに かいて おこう
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
                  ニックネームと ばんごうが あれば、べつの たんまつ（タブレットや パソコン）でも ログイン できるよ！
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div style={{ fontSize: '20px', flexShrink: 0 }}>🔑</div>
                <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>
                  ログインする ときは「もう つかってる」を えらんでね
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
