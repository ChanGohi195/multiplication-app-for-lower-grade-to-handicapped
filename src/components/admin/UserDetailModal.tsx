import { X, Edit } from 'lucide-react';
import { UserWithStats, calculateUserDetailedStats } from '../../utils/adminUtils';

interface UserDetailModalProps {
  user: UserWithStats;
  onClose: () => void;
  onEdit?: () => void;
}

export function UserDetailModal({ user, onClose, onEdit }: UserDetailModalProps) {
  const stats = calculateUserDetailedStats(user);

  if (!stats) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}
        onClick={onClose}
      >
        <div
          className="rounded-2xl p-6 w-full max-w-[480px]"
          style={{ backgroundColor: '#FFFFFF' }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ fontSize: '16px', color: '#666666' }}>
            統計データがありません
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl py-3 active:scale-95 transition-transform"
            style={{ backgroundColor: '#4A90E2', color: '#FFFFFF' }}
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#4A90E2';
    if (accuracy >= 60) return '#F6C744';
    return '#E74C3C';
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}秒`;
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: '#F9F9F6' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: '#F9F9F6' }}>
          <div>
            <h2 style={{ fontSize: '24px', color: '#333333', fontWeight: 'bold' }}>
              {user.nickname}
            </h2>
            {(user.grade || user.class) && (
              <p style={{ fontSize: '14px', color: '#666666', marginTop: '4px' }}>
                {user.grade} {user.class}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="active:scale-95 transition-transform p-2"
                style={{ color: '#4A90E2' }}
              >
                <Edit size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="active:scale-95 transition-transform"
              style={{ color: '#666666' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
                正答率
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: getAccuracyColor(stats.overallAccuracy) }}>
                {Math.round(stats.overallAccuracy)}%
              </p>
            </div>
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
                平均回答時間
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#333333' }}>
                {formatTime(stats.avgResponseTime)}
              </p>
            </div>
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <p style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
                総問題数
              </p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333333' }}>
                {stats.totalAttempts}
              </p>
            </div>
          </div>

          {/* Dan Stats */}
          <div className="mb-6">
            <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '12px' }}>
              段別正答率
            </h3>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <div className="space-y-3">
                {stats.danStats.map(danStat => (
                  <div key={danStat.dan}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: '14px', color: '#333333', fontWeight: 'bold' }}>
                        {danStat.dan}の段
                      </span>
                      <span style={{ fontSize: '14px', color: '#666666' }}>
                        {Math.round(danStat.accuracy)}% ({danStat.correct}/{danStat.attempts})
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: '#E0E0E0' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${danStat.accuracy}%`,
                          backgroundColor: getAccuracyColor(danStat.accuracy)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="mb-6">
            <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '12px' }}>
              直近10セッションの正答率推移
            </h3>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              {stats.recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentSessions.map((session, index) => {
                    const date = new Date(session.timestamp);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

                    return (
                      <div key={session.sessionId} className="flex items-center gap-3">
                        <span style={{ fontSize: '12px', color: '#666666', minWidth: '80px' }}>
                          {dateStr}
                        </span>
                        <div className="flex-1 h-6 rounded-full" style={{ backgroundColor: '#E0E0E0' }}>
                          <div
                            className="h-6 rounded-full flex items-center justify-end px-2"
                            style={{
                              width: `${session.accuracy}%`,
                              backgroundColor: getAccuracyColor(session.accuracy),
                              minWidth: '40px'
                            }}
                          >
                            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 'bold' }}>
                              {Math.round(session.accuracy)}%
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#666666', minWidth: '50px', textAlign: 'right' }}>
                          {session.correctCount}/{session.totalCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: '#666666', textAlign: 'center' }}>
                  セッションデータがありません
                </p>
              )}
            </div>
          </div>

          {/* Weak Multiplications */}
          <div className="mb-6">
            <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '12px' }}>
              苦手な九九 トップ5
            </h3>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FEE', border: '2px solid #E74C3C' }}
            >
              <div className="space-y-2">
                {stats.weakMultiplications.map((mult, index) => (
                  <div key={`${mult.dan}x${mult.num2}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#E74C3C', color: '#FFFFFF' }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                        {mult.dan} × {mult.num2}
                      </span>
                    </div>
                    <div className="text-right">
                      <span style={{ fontSize: '14px', color: '#E74C3C', fontWeight: 'bold' }}>
                        {Math.round(mult.accuracy)}%
                      </span>
                      <span style={{ fontSize: '12px', color: '#666666', marginLeft: '8px' }}>
                        ({mult.correct}/{mult.attempts})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strong Multiplications */}
          <div>
            <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '12px' }}>
              得意な九九 トップ5
            </h3>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#E6F7FF', border: '2px solid #4A90E2' }}
            >
              <div className="space-y-2">
                {stats.strongMultiplications.map((mult, index) => (
                  <div key={`${mult.dan}x${mult.num2}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#4A90E2', color: '#FFFFFF' }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                        {mult.dan} × {mult.num2}
                      </span>
                    </div>
                    <div className="text-right">
                      <span style={{ fontSize: '14px', color: '#4A90E2', fontWeight: 'bold' }}>
                        {Math.round(mult.accuracy)}%
                      </span>
                      <span style={{ fontSize: '12px', color: '#666666', marginLeft: '8px' }}>
                        ({mult.correct}/{mult.attempts})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
