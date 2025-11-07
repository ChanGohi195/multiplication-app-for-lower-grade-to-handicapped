import { ArrowLeft } from 'lucide-react';

interface ReviewProps {
  stats: {
    totalProblems: number;
    problemCorrect: Record<string, number>;
    problemMistakes: Record<string, number>;
    danCorrect: Record<number, number>;
    danMistakes: Record<number, number>;
  };
  onBack: () => void;
}

export function Review({ stats, onBack }: ReviewProps) {
  // 全体の正解率を計算
  const totalCorrect = Object.values(stats.problemCorrect).reduce((sum, count) => sum + count, 0);
  const totalMistakes = Object.values(stats.problemMistakes).reduce((sum, count) => sum + count, 0);
  const totalAttempts = totalCorrect + totalMistakes;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // 段ごとの正解率を計算
  const getDanAccuracy = (dan: number) => {
    const correct = stats.danCorrect[dan] || 0;
    const mistakes = stats.danMistakes[dan] || 0;
    const total = correct + mistakes;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  // 段ごとの統計データ
  const danStats = Array.from({ length: 9 }, (_, i) => {
    const dan = i + 1;
    const correct = stats.danCorrect[dan] || 0;
    const mistakes = stats.danMistakes[dan] || 0;
    const total = correct + mistakes;
    const accuracy = getDanAccuracy(dan);
    return { dan, correct, mistakes, total, accuracy };
  });

  // 問題別の詳細統計
  const getAllProblems = () => {
    const problemSet = new Set([
      ...Object.keys(stats.problemCorrect),
      ...Object.keys(stats.problemMistakes)
    ]);

    return Array.from(problemSet).map(key => {
      const [dan, num2] = key.split('x').map(n => parseInt(n));
      const correct = stats.problemCorrect[key] || 0;
      const mistakes = stats.problemMistakes[key] || 0;
      const total = correct + mistakes;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { dan, num2, key, correct, mistakes, total, accuracy };
    });
  };

  const allProblems = getAllProblems();
  const weakProblems = allProblems
    .filter(p => p.total >= 3) // 3回以上挑戦した問題のみ
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  const strongProblems = allProblems
    .filter(p => p.total >= 3 && p.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBack}
          className="active:scale-95 transition-transform flex items-center gap-2"
          style={{ fontSize: '18px', color: '#4A90E2' }}
        >
          <ArrowLeft size={20} />
          <span>もどる</span>
        </button>
        <h2 style={{ fontSize: '18px', color: '#333333' }}>ふりかえり</h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="space-y-5">
          {/* Title */}
          <div className="text-center mb-4">
            <div className="mb-2" style={{ fontSize: '48px' }}>📊</div>
            <h1 style={{ fontSize: '22px', color: '#333333' }}>あなたの せいせき</h1>
          </div>

          {/* 全体の統計 */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="text-center mb-4" style={{ fontSize: '18px', color: '#333333' }}>
              ぜんたいの せいせき
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '16px', color: '#666666' }}>そう もんだいすう</span>
                <span style={{ fontSize: '20px', color: '#333333' }}>{totalAttempts}もん</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '16px', color: '#666666' }}>せいかいりつ</span>
                <span style={{ fontSize: '24px', color: '#4A90E2', fontWeight: 'bold' }}>{overallAccuracy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '16px', color: '#666666' }}>ごとうりつ</span>
                <span style={{ fontSize: '20px', color: '#F5977A' }}>{100 - overallAccuracy}%</span>
              </div>
            </div>
          </div>

          {/* 段ごとの正解率 */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="text-center mb-5" style={{ fontSize: '18px', color: '#333333' }}>
              だんごとの せいかいりつ
            </div>
            <div className="space-y-3">
              {danStats.map((item) => (
                <div key={item.dan}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: '16px', color: '#333333' }}>{item.dan}のだん</span>
                    <span style={{ fontSize: '16px', color: '#4A90E2', fontWeight: 'bold' }}>
                      {item.total > 0 ? `${item.accuracy}%` : '-'}
                    </span>
                  </div>
                  {item.total > 0 && (
                    <div className="relative rounded-full overflow-hidden" style={{ height: '12px', backgroundColor: '#E5E5E5' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.accuracy}%`,
                          backgroundColor: item.accuracy >= 80 ? '#4A90E2' : item.accuracy >= 50 ? '#F6C744' : '#F5977A'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-between mt-1">
                    <span style={{ fontSize: '12px', color: '#999999' }}>
                      せいかい {item.correct}かい
                    </span>
                    <span style={{ fontSize: '12px', color: '#999999' }}>
                      まちがい {item.mistakes}かい
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 苦手な問題トップ10 */}
          {weakProblems.length > 0 && (
            <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="text-center mb-4" style={{ fontSize: '18px', color: '#333333' }}>
                にがての もんだい トップ10
              </div>
              <div className="space-y-3">
                {weakProblems.map((item, index) => (
                  <div
                    key={item.key}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#FFF4E6', border: '2px solid #F5977A' }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '20px', color: '#F5977A', fontWeight: 'bold' }}>#{index + 1}</span>
                        <span style={{ fontSize: '20px', color: '#333333' }}>
                          {item.dan} × {item.num2}
                        </span>
                      </div>
                      <span style={{ fontSize: '18px', color: '#F5977A', fontWeight: 'bold' }}>
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontSize: '14px', color: '#666666' }}>
                        せいかい {item.correct} / まちがい {item.mistakes}
                      </span>
                      <span style={{ fontSize: '14px', color: '#666666' }}>
                        ごうけい {item.total}かい
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 得意な問題トップ5 */}
          {strongProblems.length > 0 && (
            <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="text-center mb-4" style={{ fontSize: '18px', color: '#333333' }}>
                とくいな もんだい トップ5
              </div>
              <div className="space-y-3">
                {strongProblems.map((item, index) => (
                  <div
                    key={item.key}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#E8F4FD', border: '2px solid #4A90E2' }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '20px', color: '#4A90E2', fontWeight: 'bold' }}>#{index + 1}</span>
                        <span style={{ fontSize: '20px', color: '#333333' }}>
                          {item.dan} × {item.num2}
                        </span>
                      </div>
                      <span style={{ fontSize: '18px', color: '#4A90E2', fontWeight: 'bold' }}>
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontSize: '14px', color: '#666666' }}>
                        せいかい {item.correct} / まちがい {item.mistakes}
                      </span>
                      <span style={{ fontSize: '14px', color: '#666666' }}>
                        ごうけい {item.total}かい
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* データがない場合 */}
          {totalAttempts === 0 && (
            <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
              <p style={{ fontSize: '18px', color: '#666666', lineHeight: '1.6' }}>
                まだ データが ありません。<br />
                れんしゅうを はじめて みよう！
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
