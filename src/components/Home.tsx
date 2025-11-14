export function Home({ 
  onStartAll, 
  onStartSelect,
  onMyRecord,
  onLeaderboard,
  onReview
}: { 
  onStartAll: () => void;
  onStartSelect: () => void;
  onMyRecord: () => void;
  onLeaderboard: () => void;
  onReview: () => void;
}) {
  return (
    <div className="min-h-full flex items-center justify-center px-8 pt-8 pb-16 mx-auto w-full md:max-w-[768px]" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="w-full max-w-[480px] md:max-w-[540px]">
        <div className="text-center mb-20">
          <div className="mb-6" style={{ fontSize: '80px', lineHeight: '1' }}>✨</div>
          <h1 style={{ fontSize: '28px', color: '#333333', lineHeight: '1.4' }}>九九れんしゅう</h1>
        </div>
        
        <div className="w-full space-y-4 flex flex-col items-center">
          <button
            onClick={onStartAll}
            className="w-full max-w-[360px] rounded-2xl active:scale-95 transition-transform"
            style={{ 
              height: '72px',
              backgroundColor: '#4A90E2',
              color: '#FFFFFF',
              fontSize: '22px'
            }}
          >
            ぜんぶの だん
          </button>
          
          <button
            onClick={onStartSelect}
            className="w-full max-w-[360px] rounded-2xl active:scale-95 transition-transform"
            style={{ 
              height: '72px',
              backgroundColor: '#F6C744',
              color: '#333333',
              fontSize: '22px'
            }}
          >
            だんを えらぶ
          </button>
          
          <div className="flex gap-3 mb-4 w-full max-w-[360px]">
            <button
              onClick={onMyRecord}
              className="flex-1 rounded-2xl active:scale-95 transition-transform"
              style={{ 
                height: '64px',
                backgroundColor: '#FFFFFF',
                color: '#333333',
                fontSize: '16px',
                border: '2px solid #4A90E2'
              }}
            >
              わたしの きろく
            </button>
            
            <button
              onClick={onLeaderboard}
              className="flex-1 rounded-2xl active:scale-95 transition-transform"
              style={{ 
                height: '64px',
                backgroundColor: '#FFFFFF',
                color: '#333333',
                fontSize: '16px',
                border: '2px solid #F6C744'
              }}
            >
              ランキング
            </button>
          </div>
          
          <button
            onClick={onReview}
            className="w-full max-w-[360px] rounded-2xl active:scale-95 transition-transform"
            style={{ 
              height: '64px',
              backgroundColor: '#FFFFFF',
              color: '#333333',
              fontSize: '16px',
              border: '2px solid #F5977A'
            }}
          >
            📊 ふりかえり
          </button>
        </div>
      </div>
    </div>
  );
}