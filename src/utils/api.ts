import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bd4de9a8`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export async function registerUser(nickname: string, pin: string) {
  return fetchAPI('/user/register', {
    method: 'POST',
    body: JSON.stringify({ nickname, pin }),
  });
}

export async function updateUserStats(
  userId: string,
  stats: {
    consecutiveDays?: number;
    totalScore?: number;
    highScore?: number;
    lastDate?: string;
  }
) {
  return fetchAPI('/user/update-stats', {
    method: 'POST',
    body: JSON.stringify({ userId, ...stats }),
  });
}

export async function getUser(userId: string) {
  return fetchAPI(`/user/${userId}`);
}

export async function getUserById(userId: string) {
  return fetchAPI(`/user/${userId}`)
    .then(data => data)
    .catch(() => null);
}

export async function getStreakLeaderboard() {
  return fetchAPI('/leaderboard/streak');
}

export async function getTotalScoreLeaderboard() {
  return fetchAPI('/leaderboard/total-score');
}

export async function getHighScoreLeaderboard() {
  return fetchAPI('/leaderboard/high-score');
}

export async function verifyUserPin(userId: string, pin: string) {
  return fetchAPI('/user/verify-pin', {
    method: 'POST',
    body: JSON.stringify({ userId, pin }),
  });
}

// Server-side login by nickname + pin (for cross-device relogin)
export async function loginUser(nickname: string, pin: string) {
  return fetchAPI('/user/login', {
    method: 'POST',
    body: JSON.stringify({ nickname, pin }),
  });
}

// Admin functions
export async function getAllUsers() {
  return fetchAPI('/admin/users', {
    method: 'GET',
  });
}

export async function deleteUser(userId: string) {
  return fetchAPI(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function updateUser(userId: string, userData: {
  nickname?: string;
  grade?: string;
  class?: string;
}) {
  return fetchAPI(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// Sync function
export interface SyncResult {
  nickname: string;
  success: boolean;
  newUserId?: string;
  error?: string;
}

export async function syncLocalUserToSupabase(user: {
  userId: string;
  nickname: string;
  pin: string;
}): Promise<SyncResult> {
  try {
    const result = await registerUser(user.nickname, user.pin);

    if (result && result.userId) {
      return {
        nickname: user.nickname,
        success: true,
        newUserId: result.userId
      };
    } else {
      throw new Error('Invalid server response');
    }
  } catch (err) {
    return {
      nickname: user.nickname,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}
