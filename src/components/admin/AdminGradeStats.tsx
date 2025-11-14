import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getAllUsers, calculateGradeStats, UserWithStats, GradeStatistics } from '../../utils/adminUtils';

interface AdminGradeStatsProps {
  onBack: () => void;
}

export function AdminGradeStats({ onBack }: AdminGradeStatsProps) {
  const [gradeStats, setGradeStats] = useState<GradeStatistics[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = getAllUsers();
    setGradeStats(calculateGradeStats(allUsers));
  };

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
          学年別統計
        </h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {gradeStats.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ fontSize: '16px', color: '#666666' }}>
              統計データがありません
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gradeStats.map((gradeStat, index) => (
              <div
                key={index}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                      {gradeStat.grade}
                      {gradeStat.class && ` ${gradeStat.class}`}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666666' }}>
                      {gradeStat.userCount}名
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: '24px', color: '#4A90E2', fontWeight: 'bold' }}>
                      {Math.round(gradeStat.avgAccuracy)}%
                    </p>
                    <p style={{ fontSize: '11px', color: '#666666' }}>
                      平均正答率
                    </p>
                  </div>
                </div>

                {/* Weak Dans */}
                {gradeStat.weakDans.length > 0 && (
                  <div className="mb-2">
                    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
                      苦手な段
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {gradeStat.weakDans.slice(0, 3).map(dan => (
                        <span
                          key={dan}
                          className="px-2 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: '#FEE', color: '#E74C3C', fontWeight: 'bold' }}
                        >
                          {dan}の段
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strong Dans */}
                {gradeStat.strongDans.length > 0 && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
                      得意な段
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {gradeStat.strongDans.slice(0, 3).map(dan => (
                        <span
                          key={dan}
                          className="px-2 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: '#E6F7FF', color: '#4A90E2', fontWeight: 'bold' }}
                        >
                          {dan}の段
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
