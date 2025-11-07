interface ResultProps {
  correctCount: number;
  score: number;
  maxCombo: number;
  onRetry: () => void;
  onHome: () => void;
}

export function Result({ correctCount, score, maxCombo, onRetry, onHome }: ResultProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="flex-1 flex flex-col items-center justify-start px-8 py-12">
        <div className="w-full max-w-[360px]">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="mb-4" style={{ fontSize: '64px' }}>✨</div>
            <h2 style={{ fontSize: '28px', color: '#333333' }}>おつかれさま！</h2>
          </div>

          {/* Stats */}
          <div className="space-y-4 mb-8">
            {/* Score */}
            <div 
              className="rounded-3xl p-6 text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div 
                className="mb-2"
                style={{ 
                  fontSize: '56px',
                  color: '#4A90E2',
                  lineHeight: '1'
                }}
              >
                {score}
              </div>
              <div style={{ fontSize: '20px', color: '#666666' }}>
                スコア
              </div>
            </div>

            {/* Correct Count */}
            <div 
              className="rounded-3xl p-5 text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div 
                className="mb-2"
                style={{ 
                  fontSize: '40px',
                  color: '#4A90E2',
                  lineHeight: '1'
                }}
              >
                {correctCount}
              </div>
              <div style={{ fontSize: '18px', color: '#666666' }}>
                せいかい
              </div>
            </div>

            {/* Max Combo */}
            <div 
              className="rounded-3xl p-5 text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div 
                className="mb-2"
                style={{ 
                  fontSize: '40px',
                  color: '#F6C744',
                  lineHeight: '1'
                }}
              >
                {maxCombo}
              </div>
              <div style={{ fontSize: '18px', color: '#666666' }}>
                さいこう コンボ
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="text-center mb-6">
            <div style={{ fontSize: '32px' }}>
              {score >= 200 ? '🌟 すごい！' : correctCount >= 10 ? '💪 よく がんばった！' : '✨ いいね！'}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4 pb-8">
            <button
              onClick={onRetry}
              className="w-full rounded-2xl active:scale-95 transition-transform"
              style={{ 
                height: '72px',
                backgroundColor: '#4A90E2',
                color: '#FFFFFF',
                fontSize: '22px',
                minHeight: '72px'
              }}
            >
              もういちど
            </button>
            
            <button
              onClick={onHome}
              className="w-full rounded-2xl active:scale-95 transition-transform"
              style={{ 
                height: '72px',
                backgroundColor: '#FFFFFF',
                color: '#333333',
                fontSize: '18px',
                border: '2px solid #E0E0E0',
                minHeight: '72px'
              }}
            >
              ホームに もどる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
