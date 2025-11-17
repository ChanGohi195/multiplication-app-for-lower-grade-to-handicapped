import { useState, useEffect } from 'react';
import { Search, Trash2, ArrowLeft } from 'lucide-react';
import { getAllUsers as getLocalUsers, deleteUser as deleteLocalUser, UserWithStats } from '../../utils/adminUtils';
import * as api from '../../utils/api';
import { UserDetailModal } from './UserDetailModal';
import { UserEditModal } from './UserEditModal';

interface AdminUsersProps {
  onBack: () => void;
}

export function AdminUsers({ onBack }: AdminUsersProps) {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    console.log('[AdminUsers] Loading users...');

    // Always load from localStorage first
    const localUsers = getLocalUsers();
    console.log('[AdminUsers] LocalStorage users:', localUsers.length, 'users');

    try {
      // Try to fetch from Supabase
      console.log('[AdminUsers] Fetching from Supabase API...');
      const result = await api.getAllUsers();

      console.log('[AdminUsers] API Response:', result);
      console.log('[AdminUsers] Response type:', typeof result);
      console.log('[AdminUsers] Has users array?', result && 'users' in result);
      console.log('[AdminUsers] Is array?', result && Array.isArray(result.users));

      if (result && Array.isArray(result.users)) {
        console.log('[AdminUsers] ✓ Successfully loaded from Supabase:', result.users.length, 'users');

        // Merge Supabase and localStorage users (remove duplicates)
        const supabaseUsers = result.users;
        const mergedUsers = [...supabaseUsers];

        // Add local users that don't exist in Supabase
        for (const localUser of localUsers) {
          const existsInSupabase = supabaseUsers.some(su => su.userId === localUser.userId);
          if (!existsInSupabase) {
            console.log('[AdminUsers] Adding local-only user:', localUser.nickname);
            mergedUsers.push(localUser);
          }
        }

        console.log('[AdminUsers] Total merged users:', mergedUsers.length);
        setUsers(mergedUsers);
        setFilteredUsers(mergedUsers);

        if (localUsers.length > supabaseUsers.length) {
          setError(`${localUsers.length - supabaseUsers.length}件の ローカルのみの ユーザーが います。サーバーと どうき してください。`);
        }
      } else {
        console.warn('[AdminUsers] ✗ Invalid response format:', result);
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('[AdminUsers] ✗ Failed to load users from Supabase:', err);

      // Use localStorage only
      console.log('[AdminUsers] Using localStorage only:', localUsers.length, 'users');
      setUsers(localUsers);
      setFilteredUsers(localUsers);

      setError('サーバーから ユーザーを よみこめませんでした。ローカルデータを ひょうじ しています。');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.nickname.toLowerCase().includes(query) ||
      user.userId.toLowerCase().includes(query) ||
      user.grade?.toLowerCase().includes(query) ||
      user.class?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteClick = (user: UserWithStats) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsLoading(true);

    try {
      // Try to delete from Supabase first
      await api.deleteUser(selectedUser.userId);

      // Also delete from localStorage
      deleteLocalUser(selectedUser.userId, selectedUser.nickname);

      // Reload users
      await loadUsers();
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to delete user from Supabase:', err);

      // Fallback: delete from localStorage only
      const success = deleteLocalUser(selectedUser.userId, selectedUser.nickname);
      if (success) {
        await loadUsers();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        setError('サーバーから さくじょ できませんでしたが、ローカルからは さくじょ しました。');
      } else {
        setError('ユーザーの さくじょに しっぱい しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (user: UserWithStats) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditClick = () => {
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleEditSaved = () => {
    loadUsers();
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);

    console.log('[AdminUsers] Starting sync...');

    try {
      // Get current Supabase users
      const result = await api.getAllUsers();
      const supabaseUsers = (result && Array.isArray(result.users)) ? result.users : [];

      // Get local users
      const localUsers = getLocalUsers();

      console.log('[AdminUsers] Supabase users:', supabaseUsers.length);
      console.log('[AdminUsers] Local users:', localUsers.length);

      // Find users that only exist in localStorage (by nickname)
      const supabaseNicknames = new Set(supabaseUsers.map(u => u.nickname.toLowerCase()));
      const localOnlyUsers = localUsers.filter(u =>
        !supabaseNicknames.has(u.nickname.toLowerCase())
      );

      console.log('[AdminUsers] Local-only users:', localOnlyUsers.length, localOnlyUsers.map(u => u.nickname));

      if (localOnlyUsers.length === 0) {
        setError('どうき する ひつような ユーザーは いません。');
        return;
      }

      // Sync each local-only user
      const syncResults = await Promise.all(
        localOnlyUsers.map(user => api.syncLocalUserToSupabase(user))
      );

      const successCount = syncResults.filter(r => r.success).length;
      const failedUsers = syncResults.filter(r => !r.success);

      console.log('[AdminUsers] Sync results:', { successCount, failed: failedUsers.length });

      if (failedUsers.length > 0) {
        console.error('[AdminUsers] Failed syncs:', failedUsers);
        setError(`${successCount}件 どうき しました。${failedUsers.length}件 しっぱい しました。`);
      } else {
        setError(`${successCount}件の ユーザーを Supabase に どうき しました。`);
      }

      // Reload users
      await loadUsers();
    } catch (err) {
      console.error('[AdminUsers] Sync failed:', err);
      setError('どうき に しっぱい しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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
          ユーザー管理
        </h1>
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="px-3 py-1 rounded-lg active:scale-95 transition-transform"
          style={{
            backgroundColor: '#F6C744',
            color: '#333333',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          同期
        </button>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search
            size={20}
            color="#666666"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ニックネーム・学年・クラスで検索"
            className="w-full rounded-xl pl-12 pr-4 py-3"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E0E0E0',
              color: '#333333',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
        <p style={{ fontSize: '14px', color: '#666666', marginTop: '8px' }}>
          {filteredUsers.length}件のユーザー
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 mb-4">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#FFF3CD', border: '2px solid #F6C744' }}
          >
            <p style={{ fontSize: '14px', color: '#856404' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div style={{ fontSize: '16px', color: '#666666' }}>読み込み中...</div>
        </div>
      )}

      {/* User List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ fontSize: '16px', color: '#666666' }}>
              {searchQuery ? '該当するユーザーが見つかりません' : 'ユーザーが登録されていません'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.userId}
                onClick={() => handleUserClick(user)}
                className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
                      {user.nickname}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666666' }}>
                      {user.grade && user.class ? `${user.grade} ${user.class}` :
                       user.grade || user.class || '学年・クラス未設定'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(user);
                    }}
                    className="active:scale-95 transition-transform p-2"
                    style={{ color: '#E74C3C' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {user.stats && (
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className="rounded-lg p-2 text-center"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <p style={{ fontSize: '11px', color: '#666666', marginBottom: '2px' }}>
                        累計スコア
                      </p>
                      <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                        {user.stats.totalScore}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-2 text-center"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <p style={{ fontSize: '11px', color: '#666666', marginBottom: '2px' }}>
                        連続日数
                      </p>
                      <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                        {user.stats.consecutiveDays}日
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-2 text-center"
                      style={{ backgroundColor: '#F9F9F6' }}
                    >
                      <p style={{ fontSize: '11px', color: '#666666', marginBottom: '2px' }}>
                        最終練習
                      </p>
                      <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold' }}>
                        {formatDate(user.stats.lastDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-[360px]"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', color: '#333333', fontWeight: 'bold', marginBottom: '12px' }}>
              ユーザー削除の確認
            </h3>
            <p style={{ fontSize: '16px', color: '#666666', marginBottom: '20px', lineHeight: '1.6' }}>
              「{selectedUser.nickname}」を削除しますか？<br />
              このユーザーの全データ（統計・成績）が完全に削除されます。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl py-3 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#F9F9F6',
                  color: '#666666',
                  fontSize: '16px',
                  border: '2px solid #E0E0E0'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl py-3 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#E74C3C',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          onEdit={handleEditClick}
        />
      )}

      {/* User Edit Modal */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
