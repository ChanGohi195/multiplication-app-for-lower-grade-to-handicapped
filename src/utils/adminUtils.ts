// 管理者機能用ユーティリティ関数
import type { ProblemRecord } from '../components/Practice';

export interface UserDataExtended {
  userId: string;
  nickname: string;
  pin: string;
  grade?: string;
  class?: string;
}

export interface Stats {
  todayCount: number;
  consecutiveDays: number;
  lastDate: string;
  danMistakes: Record<number, number>;
  totalScore: number;
  highScore: number;
  problemHistory: any[];
}

export interface UserWithStats extends UserDataExtended {
  stats?: Stats;
}

/**
 * LocalStorageから全ユーザーデータを取得
 */
export const getAllUsers = (): UserWithStats[] => {
  const users: UserWithStats[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('kuku-user-') && !key.includes('kuku-user-v2')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        if (userData.userId && userData.nickname) {
          // 統計データも取得
          const statsKey = `kuku-stats-${userData.userId}`;
          const stats = localStorage.getItem(statsKey);

          users.push({
            ...userData,
            stats: stats ? JSON.parse(stats) : undefined
          });
        }
      } catch (err) {
        console.error(`Error parsing user data for key: ${key}`, err);
      }
    }
  }

  return users;
};

/**
 * ユーザー削除
 */
export const deleteUser = (userId: string, nickname: string): boolean => {
  try {
    const nicknameKey = nickname.trim().toLowerCase();

    // ユーザーデータ削除
    localStorage.removeItem(`kuku-user-${nicknameKey}`);

    // 統計データ削除
    localStorage.removeItem(`kuku-stats-${userId}`);

    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    return false;
  }
};

/**
 * ユーザー情報更新
 */
export const updateUser = (
  userId: string,
  oldNickname: string,
  updates: Partial<UserDataExtended>
): { success: boolean; error?: string } => {
  try {
    const oldKey = `kuku-user-${oldNickname.trim().toLowerCase()}`;
    const existingData = localStorage.getItem(oldKey);

    if (!existingData) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const userData = JSON.parse(existingData);

    // ニックネーム変更の場合、重複チェック
    if (updates.nickname && updates.nickname !== oldNickname) {
      const newKey = `kuku-user-${updates.nickname.trim().toLowerCase()}`;
      if (localStorage.getItem(newKey)) {
        return { success: false, error: 'このニックネームは既に使用されています' };
      }
    }

    // データを更新
    const updatedData = {
      ...userData,
      ...updates,
      userId // userIdは変更不可
    };

    // ニックネーム変更の場合は古いキーを削除して新しいキーで保存
    if (updates.nickname && updates.nickname !== oldNickname) {
      const newKey = `kuku-user-${updates.nickname.trim().toLowerCase()}`;
      localStorage.setItem(newKey, JSON.stringify(updatedData));
      localStorage.removeItem(oldKey);
    } else {
      // ニックネーム変更なしの場合は同じキーで上書き
      localStorage.setItem(oldKey, JSON.stringify(updatedData));
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating user:', err);
    return { success: false, error: '更新に失敗しました' };
  }
};

/**
 * CSVをパースしてユーザーデータに変換
 */
export const parseCSV = (csvText: string): { users: UserDataExtended[], errors: string[] } => {
  const lines = csvText.trim().split('\n');
  const users: UserDataExtended[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const columns = line.split(',').map(col => col.trim());

    if (columns.length < 2) {
      errors.push(`行${lineNum}: 最低2列（ニックネーム,PIN）が必要です`);
      return;
    }

    const [nickname, pin, grade, className] = columns;

    // バリデーション
    if (!nickname || nickname.length === 0) {
      errors.push(`行${lineNum}: ニックネームが空です`);
      return;
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      errors.push(`行${lineNum}: PINは4桁の数字である必要があります`);
      return;
    }

    // 重複チェック
    const nicknameKey = nickname.toLowerCase();
    if (localStorage.getItem(`kuku-user-${nicknameKey}`)) {
      errors.push(`行${lineNum}: "${nickname}" は既に登録されています`);
      return;
    }

    users.push({
      userId: crypto.randomUUID(),
      nickname,
      pin,
      grade: grade || undefined,
      class: className || undefined
    });
  });

  return { users, errors };
};

/**
 * ユーザーを一括登録
 */
export const bulkRegisterUsers = (users: UserDataExtended[]): { success: number, failed: number } => {
  let success = 0;
  let failed = 0;

  users.forEach(user => {
    try {
      const nicknameKey = user.nickname.trim().toLowerCase();
      localStorage.setItem(`kuku-user-${nicknameKey}`, JSON.stringify(user));

      // 初期統計データも作成
      const initialStats: Stats = {
        todayCount: 0,
        consecutiveDays: 0,
        lastDate: new Date().toDateString(),
        danMistakes: {},
        totalScore: 0,
        highScore: 0,
        problemHistory: []
      };
      localStorage.setItem(`kuku-stats-${user.userId}`, JSON.stringify(initialStats));

      success++;
    } catch (err) {
      console.error(`Failed to register user: ${user.nickname}`, err);
      failed++;
    }
  });

  return { success, failed };
};

/**
 * 全ユーザーの統計を計算
 */
export const calculateGlobalStats = (users: UserWithStats[]) => {
  const stats = {
    totalUsers: users.length,
    activeToday: 0,
    averageScore: 0,
    maxScore: 0,
    averageStreak: 0,
    maxStreak: 0,
    danAccuracy: {} as Record<number, { correct: number, total: number }>
  };

  let totalScore = 0;
  let totalStreak = 0;
  let usersWithScore = 0;

  const today = new Date().toDateString();

  users.forEach(user => {
    if (user.stats) {
      // 今日アクティブなユーザー
      if (user.stats.lastDate === today && user.stats.todayCount > 0) {
        stats.activeToday++;
      }

      // スコア統計
      if (user.stats.totalScore > 0) {
        totalScore += user.stats.totalScore;
        usersWithScore++;
      }

      stats.maxScore = Math.max(stats.maxScore, user.stats.highScore);

      // 連続日数統計
      totalStreak += user.stats.consecutiveDays;
      stats.maxStreak = Math.max(stats.maxStreak, user.stats.consecutiveDays);

      // 段別正答率
      if (user.stats.problemHistory) {
        user.stats.problemHistory.forEach((problem: any) => {
          const dan = problem.dan;
          if (!stats.danAccuracy[dan]) {
            stats.danAccuracy[dan] = { correct: 0, total: 0 };
          }
          stats.danAccuracy[dan].total++;
          if (problem.isCorrect) {
            stats.danAccuracy[dan].correct++;
          }
        });
      }
    }
  });

  stats.averageScore = usersWithScore > 0 ? Math.round(totalScore / usersWithScore) : 0;
  stats.averageStreak = users.length > 0 ? Math.round(totalStreak / users.length) : 0;

  return stats;
};

/**
 * ユーザーデータをCSVとしてエクスポート
 */
export const exportUsersToCSV = (users: UserWithStats[]): string => {
  const headers = ['ニックネーム', 'ユーザーID', '学年', 'クラス', '累計スコア', '最高スコア', '連続日数', '最終練習日'];
  const rows = users.map(user => [
    user.nickname,
    user.userId,
    user.grade || '',
    user.class || '',
    user.stats?.totalScore || 0,
    user.stats?.highScore || 0,
    user.stats?.consecutiveDays || 0,
    user.stats?.lastDate || ''
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

/**
 * 全データをJSONとしてバックアップ
 */
export const exportAllDataAsJSON = (users: UserWithStats[]): string => {
  const backup = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    users: users.map(user => ({
      ...user,
      // PINは含めない（セキュリティ）
      pin: undefined
    }))
  };

  return JSON.stringify(backup, null, 2);
};

/**
 * 成績データのみリセット
 */
export const resetStatsOnly = (): number => {
  let resetCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('kuku-stats-')) {
      const initialStats: Stats = {
        todayCount: 0,
        consecutiveDays: 0,
        lastDate: new Date().toDateString(),
        danMistakes: {},
        totalScore: 0,
        highScore: 0,
        problemHistory: []
      };
      localStorage.setItem(key, JSON.stringify(initialStats));
      resetCount++;
    }
  }

  return resetCount;
};

/**
 * 全データ削除（アカウント含む）
 */
export const resetAllData = (): number => {
  let deletedCount = 0;
  const keysToDelete: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('kuku-')) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => {
    localStorage.removeItem(key);
    deletedCount++;
  });

  return deletedCount;
};

// ========================================
// 詳細統計計算関数
// ========================================

export interface SessionSummary {
  sessionId: string;
  timestamp: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  avgResponseTime: number;
}

export interface MultiplicationAccuracy {
  dan: number;
  num2: number;
  attempts: number;
  correct: number;
  accuracy: number;
  avgResponseTime: number;
}

export interface DanStats {
  dan: number;
  attempts: number;
  correct: number;
  accuracy: number;
  avgResponseTime: number;
}

export interface UserDetailedStats {
  overallAccuracy: number;
  avgResponseTime: number;
  totalAttempts: number;
  multiplicationStats: MultiplicationAccuracy[];
  danStats: DanStats[];
  recentSessions: SessionSummary[];
  weakMultiplications: MultiplicationAccuracy[];
  strongMultiplications: MultiplicationAccuracy[];
}

export interface GradeStatistics {
  grade: string;
  class?: string;
  userCount: number;
  avgScore: number;
  avgAccuracy: number;
  weakDans: number[];
  strongDans: number[];
}

/**
 * 既存データにtimestampとsessionIdを付与するマイグレーション関数
 */
export const migrateProblemHistory = (problemHistory: any[], lastDate: string): ProblemRecord[] => {
  if (!problemHistory || problemHistory.length === 0) return [];

  // 既にtimestampがある場合はそのまま返す
  if (problemHistory[0]?.timestamp) {
    return problemHistory as ProblemRecord[];
  }

  // lastDateから推定日時を計算
  const lastDateObj = new Date(lastDate);
  const endTime = lastDateObj.getTime();

  // 10問ごとに1セッション、1セッション平均5分と仮定
  const sessionCount = Math.ceil(problemHistory.length / 10);
  const timePerSession = 5 * 60 * 1000; // 5分

  const migratedHistory: ProblemRecord[] = [];
  let currentSessionIndex = 0;
  let currentSessionId = crypto.randomUUID();

  for (let i = 0; i < problemHistory.length; i++) {
    // 10問ごとに新しいセッション
    if (i > 0 && i % 10 === 0) {
      currentSessionIndex++;
      currentSessionId = crypto.randomUUID();
    }

    // セッションの開始時刻を計算（最新から遡る）
    const sessionStartTime = endTime - ((sessionCount - currentSessionIndex - 1) * timePerSession);
    // 問題ごとに30秒間隔と仮定
    const problemTime = sessionStartTime + (i % 10) * 30 * 1000;

    migratedHistory.push({
      ...problemHistory[i],
      timestamp: problemTime,
      sessionId: currentSessionId
    });
  }

  return migratedHistory;
};

/**
 * 個人の詳細統計を計算
 */
export const calculateUserDetailedStats = (user: UserWithStats): UserDetailedStats | null => {
  if (!user.stats?.problemHistory || user.stats.problemHistory.length === 0) {
    return null;
  }

  // データのマイグレーション
  const history = migrateProblemHistory(user.stats.problemHistory, user.stats.lastDate);

  const totalAttempts = history.length;
  const totalCorrect = history.filter(p => p.isCorrect).length;
  const overallAccuracy = (totalCorrect / totalAttempts) * 100;
  const avgResponseTime = history.reduce((sum, p) => sum + p.responseTime, 0) / totalAttempts;

  // 個別九九の正答率
  const multiplicationMap = new Map<string, MultiplicationAccuracy>();
  history.forEach(problem => {
    const key = `${problem.dan}x${problem.num2}`;
    const existing = multiplicationMap.get(key) || {
      dan: problem.dan,
      num2: problem.num2,
      attempts: 0,
      correct: 0,
      accuracy: 0,
      avgResponseTime: 0
    };

    existing.attempts++;
    if (problem.isCorrect) existing.correct++;
    existing.accuracy = (existing.correct / existing.attempts) * 100;
    existing.avgResponseTime = ((existing.avgResponseTime * (existing.attempts - 1)) + problem.responseTime) / existing.attempts;

    multiplicationMap.set(key, existing);
  });

  const multiplicationStats = Array.from(multiplicationMap.values())
    .sort((a, b) => a.accuracy - b.accuracy);

  // 段別統計
  const danMap = new Map<number, DanStats>();
  history.forEach(problem => {
    const existing = danMap.get(problem.dan) || {
      dan: problem.dan,
      attempts: 0,
      correct: 0,
      accuracy: 0,
      avgResponseTime: 0
    };

    existing.attempts++;
    if (problem.isCorrect) existing.correct++;
    existing.accuracy = (existing.correct / existing.attempts) * 100;
    existing.avgResponseTime = ((existing.avgResponseTime * (existing.attempts - 1)) + problem.responseTime) / existing.attempts;

    danMap.set(problem.dan, existing);
  });

  const danStats = Array.from(danMap.values())
    .sort((a, b) => a.dan - b.dan);

  // セッション別統計
  const sessionMap = new Map<string, SessionSummary>();
  history.forEach(problem => {
    const existing = sessionMap.get(problem.sessionId) || {
      sessionId: problem.sessionId,
      timestamp: problem.timestamp,
      correctCount: 0,
      totalCount: 0,
      accuracy: 0,
      avgResponseTime: 0
    };

    existing.totalCount++;
    if (problem.isCorrect) existing.correctCount++;
    existing.accuracy = (existing.correctCount / existing.totalCount) * 100;
    existing.avgResponseTime = ((existing.avgResponseTime * (existing.totalCount - 1)) + problem.responseTime) / existing.totalCount;
    existing.timestamp = Math.min(existing.timestamp, problem.timestamp);

    sessionMap.set(problem.sessionId, existing);
  });

  const recentSessions = Array.from(sessionMap.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  // 苦手・得意な九九
  const weakMultiplications = multiplicationStats.slice(0, 5);
  const strongMultiplications = multiplicationStats.slice(-5).reverse();

  return {
    overallAccuracy,
    avgResponseTime,
    totalAttempts,
    multiplicationStats,
    danStats,
    recentSessions,
    weakMultiplications,
    strongMultiplications
  };
};

/**
 * 学年別統計を計算
 */
export const calculateGradeStats = (users: UserWithStats[]): GradeStatistics[] => {
  const gradeMap = new Map<string, UserWithStats[]>();

  // 学年ごとにグループ化
  users.forEach(user => {
    const key = user.grade || '未設定';
    if (!gradeMap.has(key)) {
      gradeMap.set(key, []);
    }
    gradeMap.get(key)!.push(user);
  });

  // 統計を計算
  const stats: GradeStatistics[] = [];
  gradeMap.forEach((gradeUsers, grade) => {
    let totalScore = 0;
    let totalAccuracy = 0;
    let usersWithData = 0;
    const danCorrectCount = new Map<number, number>();
    const danTotalCount = new Map<number, number>();

    gradeUsers.forEach(user => {
      if (!user.stats) return;

      totalScore += user.stats.totalScore || 0;

      if (user.stats.problemHistory && user.stats.problemHistory.length > 0) {
        const history = migrateProblemHistory(user.stats.problemHistory, user.stats.lastDate);
        const correct = history.filter(p => p.isCorrect).length;
        totalAccuracy += (correct / history.length) * 100;
        usersWithData++;

        // 段別集計
        history.forEach(problem => {
          danTotalCount.set(problem.dan, (danTotalCount.get(problem.dan) || 0) + 1);
          if (problem.isCorrect) {
            danCorrectCount.set(problem.dan, (danCorrectCount.get(problem.dan) || 0) + 1);
          }
        });
      }
    });

    // 苦手・得意な段を計算
    const danAccuracies: { dan: number; accuracy: number }[] = [];
    for (let dan = 1; dan <= 9; dan++) {
      const total = danTotalCount.get(dan) || 0;
      const correct = danCorrectCount.get(dan) || 0;
      if (total > 0) {
        danAccuracies.push({
          dan,
          accuracy: (correct / total) * 100
        });
      }
    }
    danAccuracies.sort((a, b) => a.accuracy - b.accuracy);

    const weakDans = danAccuracies.slice(0, 3).map(d => d.dan);
    const strongDans = danAccuracies.slice(-3).reverse().map(d => d.dan);

    stats.push({
      grade,
      userCount: gradeUsers.length,
      avgScore: gradeUsers.length > 0 ? Math.round(totalScore / gradeUsers.length) : 0,
      avgAccuracy: usersWithData > 0 ? Math.round(totalAccuracy / usersWithData) : 0,
      weakDans,
      strongDans
    });
  });

  return stats.sort((a, b) => {
    if (a.grade === '未設定') return 1;
    if (b.grade === '未設定') return -1;
    return a.grade.localeCompare(b.grade, 'ja');
  });
};

/**
 * クラス別統計を計算
 */
export const calculateClassStats = (users: UserWithStats[], grade: string): GradeStatistics[] => {
  const classUsers = users.filter(u => u.grade === grade);
  const classMap = new Map<string, UserWithStats[]>();

  // クラスごとにグループ化
  classUsers.forEach(user => {
    const key = user.class || '未設定';
    if (!classMap.has(key)) {
      classMap.set(key, []);
    }
    classMap.get(key)!.push(user);
  });

  // 統計を計算（学年統計と同じロジック）
  const stats: GradeStatistics[] = [];
  classMap.forEach((classUsers, className) => {
    let totalScore = 0;
    let totalAccuracy = 0;
    let usersWithData = 0;
    const danCorrectCount = new Map<number, number>();
    const danTotalCount = new Map<number, number>();

    classUsers.forEach(user => {
      if (!user.stats) return;

      totalScore += user.stats.totalScore || 0;

      if (user.stats.problemHistory && user.stats.problemHistory.length > 0) {
        const history = migrateProblemHistory(user.stats.problemHistory, user.stats.lastDate);
        const correct = history.filter(p => p.isCorrect).length;
        totalAccuracy += (correct / history.length) * 100;
        usersWithData++;

        history.forEach(problem => {
          danTotalCount.set(problem.dan, (danTotalCount.get(problem.dan) || 0) + 1);
          if (problem.isCorrect) {
            danCorrectCount.set(problem.dan, (danCorrectCount.get(problem.dan) || 0) + 1);
          }
        });
      }
    });

    const danAccuracies: { dan: number; accuracy: number }[] = [];
    for (let dan = 1; dan <= 9; dan++) {
      const total = danTotalCount.get(dan) || 0;
      const correct = danCorrectCount.get(dan) || 0;
      if (total > 0) {
        danAccuracies.push({
          dan,
          accuracy: (correct / total) * 100
        });
      }
    }
    danAccuracies.sort((a, b) => a.accuracy - b.accuracy);

    const weakDans = danAccuracies.slice(0, 3).map(d => d.dan);
    const strongDans = danAccuracies.slice(-3).reverse().map(d => d.dan);

    stats.push({
      grade,
      class: className,
      userCount: classUsers.length,
      avgScore: classUsers.length > 0 ? Math.round(totalScore / classUsers.length) : 0,
      avgAccuracy: usersWithData > 0 ? Math.round(totalAccuracy / usersWithData) : 0,
      weakDans,
      strongDans
    });
  });

  return stats.sort((a, b) => {
    if (a.class === '未設定') return 1;
    if (b.class === '未設定') return -1;
    return (a.class || '').localeCompare(b.class || '', 'ja');
  });
};
