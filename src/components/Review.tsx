import { ArrowLeft } from 'lucide-react';
import type { ProblemRecord } from './Practice';

interface ReviewProps {
  problemHistory: ProblemRecord[];
  onBack: () => void;
}

interface MultiplicationAnalysis {
  dan: number;
  num2: number;
  totalAttempts: number;
  incorrectAttempts: number;
  errorRate: number; // 誤答率 (0-100)
  avgResponseTime: number; // 平均回答時間 (ms)
}

export function Review({ problemHistory, onBack }: ReviewProps) {
  // 九九ごとの問題を集計
  const analyzeProblems = (): MultiplicationAnalysis[] => {
    const problemMap = new Map<string, { attempts: number; incorrect: number; totalTime: number }>();
    
    problemHistory.forEach((record) => {
      const key = `${record.dan}x${record.num2}`;
      const existing = problemMap.get(key) || { attempts: 0, incorrect: 0, totalTime: 0 };
      
      problemMap.set(key, {
        attempts: existing.attempts + 1,
        incorrect: existing.incorrect + (record.isCorrect ? 0 : 1),
        totalTime: existing.totalTime + record.responseTime
      });
    });
    
    const analyses: MultiplicationAnalysis[] = [];
    
    problemMap.forEach((value, key) => {
      const [dan, num2] = key.split('x').map(Number);
      analyses.push({
        dan,
        num2,
        totalAttempts: value.attempts,
        incorrectAttempts: value.incorrect,
        errorRate: (value.incorrect / value.attempts) * 100,
        avgResponseTime: value.totalTime / value.attempts
      });
    });
    
    return analyses;
  };

  const analyses = analyzeProblems();
  
  // 誤答率が高い順にソート
  const sortedByErrorRate = [...analyses].sort((a, b) => {
    if (b.errorRate !== a.errorRate) {
      return b.errorRate - a.errorRate;
    }
    // 誤答率が同じ場合は回答時間が長い順
    return b.avgResponseTime - a.avgResponseTime;
  });
  
  // 回答時間が長い順にソート
  const sortedByTime = [...analyses].sort((a, b) => b.avgResponseTime - a.avgResponseTime);
  
  // 最も苦手な問題（誤答率と回答時間の総合）
  const weakestProblems = sortedByErrorRate.slice(0, 5);
  const slowestProblems = sortedByTime.slice(0, 5);
  
  // 段ごとに統計を集計
  const danStats = new Map<number, { totalAttempts: number; totalIncorrect: number; totalTime: number }>();
  
  analyses.forEach((analysis) => {
    const existing = danStats.get(analysis.dan) || { totalAttempts: 0, totalIncorrect: 0, totalTime: 0 };
    danStats.set(analysis.dan, {
      totalAttempts: existing.totalAttempts + analysis.totalAttempts,
      totalIncorrect: existing.totalIncorrect + analysis.incorrectAttempts,
      totalTime: existing.totalTime + (analysis.avgResponseTime * analysis.totalAttempts)
    });
  });
  
  const danAnalyses = Array.from(danStats.entries()).map(([dan, stats]) => ({
    dan,
    errorRate: (stats.totalIncorrect / stats.totalAttempts) * 100,
    avgResponseTime: stats.totalTime / stats.totalAttempts
  })).sort((a, b) => b.errorRate - a.errorRate);
  
  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}秒`;
  };
  
  const getErrorRateColor = (errorRate: number) => {
    if (errorRate >= 50) return '#F5977A'; // High error rate
    if (errorRate >= 25) return '#F6C744'; // Medium error rate
    return '#4A90E2'; // Low error rate
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
        
        <h2 style={{ fontSize: '20px', color: '#333333' }}>ふりかえり</h2>
        
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {problemHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
            <p style={{ fontSize: '18px', color: '#666666', textAlign: 'center' }}>
              まだ れんしゅうの データが<br />
              ありません
            </p>
            <p style={{ fontSize: '14px', color: '#999999', textAlign: 'center', marginTop: '12px' }}>
              れんしゅうを してみよう！
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-3xl p-6 text-center" style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📈</div>
              <div style={{ fontSize: '18px', color: '#333333', marginBottom: '8px' }}>
                ぜんぶで
              </div>
              <div style={{ fontSize: '40px', color: '#4A90E2', lineHeight: '1', marginBottom: '4px' }}>
                {problemHistory.length}
              </div>
              <div style={{ fontSize: '16px', color: '#666666' }}>
                もんだいに チャレンジしたよ！
              </div>
            </div>

            {/* Weakest Problems by Error Rate */}
            {weakestProblems.length > 0 && (
              <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ fontSize: '24px' }}>⚠️</div>
                  <h3 style={{ fontSize: '18px', color: '#333333' }}>まちがえやすい もんだい</h3>
                </div>
                <div className="space-y-3">
                  {weakestProblems.map((problem, index) => (
                    <div 
                      key={`${problem.dan}x${problem.num2}`}
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center justify-center"
                          style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: getErrorRateColor(problem.errorRate),
                            color: '#FFFFFF',
                            fontSize: '16px'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ fontSize: '20px', color: '#333333' }}>
                          {problem.dan} × {problem.num2}
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontSize: '18px', color: getErrorRateColor(problem.errorRate) }}>
                          {problem.errorRate.toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#999999' }}>
                          {problem.incorrectAttempts}/{problem.totalAttempts}かい
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slowest Problems by Response Time */}
            {slowestProblems.length > 0 && (
              <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ fontSize: '24px' }}>🐢</div>
                  <h3 style={{ fontSize: '18px', color: '#333333' }}>じかんが かかる もんだい</h3>
                </div>
                <div className="space-y-3">
                  {slowestProblems.map((problem, index) => (
                    <div 
                      key={`${problem.dan}x${problem.num2}`}
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center justify-center"
                          style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: '#F6C744',
                            color: '#333333',
                            fontSize: '16px'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ fontSize: '20px', color: '#333333' }}>
                          {problem.dan} × {problem.num2}
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontSize: '16px', color: '#F6C744' }}>
                          {formatTime(problem.avgResponseTime)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999999' }}>
                          へいきん
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dan Statistics */}
            {danAnalyses.length > 0 && (
              <div className="rounded-3xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ fontSize: '24px' }}>📊</div>
                  <h3 style={{ fontSize: '18px', color: '#333333' }}>だんごとの せいかく率</h3>
                </div>
                <div className="space-y-3">
                  {danAnalyses.map((danStat) => (
                    <div 
                      key={danStat.dan}
                      className="rounded-xl p-4"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div style={{ fontSize: '18px', color: '#333333' }}>
                          {danStat.dan}の だん
                        </div>
                        <div style={{ fontSize: '18px', color: getErrorRateColor(danStat.errorRate) }}>
                          {(100 - danStat.errorRate).toFixed(0)}%
                        </div>
                      </div>
                      <div 
                        className="w-full rounded-full overflow-hidden"
                        style={{ 
                          height: '8px',
                          backgroundColor: '#E0E0E0'
                        }}
                      >
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${100 - danStat.errorRate}%`,
                            backgroundColor: getErrorRateColor(danStat.errorRate)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouragement Message */}
            <div className="rounded-3xl p-6 text-center" style={{ backgroundColor: '#FFF4E6', border: '2px solid #F6C744' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💪</div>
              <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.7' }}>
                にがてな もんだいを<br />
                くりかえし れんしゅうして<br />
                とくいに しよう！
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8 pt-4" style={{ backgroundColor: '#F9F9F6' }}>
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
