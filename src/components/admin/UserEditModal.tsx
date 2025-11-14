import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { UserWithStats, updateUser } from '../../utils/adminUtils';

interface UserEditModalProps {
  user: UserWithStats;
  onClose: () => void;
  onSaved: () => void;
}

export function UserEditModal({ user, onClose, onSaved }: UserEditModalProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [grade, setGrade] = useState(user.grade || '');
  const [className, setClassName] = useState(user.class || '');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setError('');

    // バリデーション
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    // PIN入力がある場合のバリデーション
    if (pin || pinConfirm) {
      if (pin !== pinConfirm) {
        setError('PINが一致しません');
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        setError('PINは4桁の数字で入力してください');
        return;
      }
    }

    setIsSaving(true);

    // 更新データを準備
    const updates: any = {
      nickname: nickname.trim(),
      grade: grade.trim() || undefined,
      class: className.trim() || undefined
    };

    // PIN変更がある場合のみ追加
    if (pin) {
      updates.pin = pin;
    }

    // ユーザー情報を更新
    const result = updateUser(user.userId, user.nickname, updates);

    if (result.success) {
      onSaved();
    } else {
      setError(result.error || '更新に失敗しました');
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: '#F9F9F6' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: '#F9F9F6' }}>
          <h2 style={{ fontSize: '20px', color: '#333333', fontWeight: 'bold' }}>
            アカウント情報編集
          </h2>
          <button
            onClick={onClose}
            className="active:scale-95 transition-transform"
            style={{ color: '#666666' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          {/* Error Message */}
          {error && (
            <div
              className="rounded-xl p-3 mb-4"
              style={{ backgroundColor: '#FEE', border: '2px solid #E74C3C' }}
            >
              <p style={{ fontSize: '14px', color: '#E74C3C' }}>{error}</p>
            </div>
          )}

          {/* Nickname */}
          <div className="mb-4">
            <label style={{ fontSize: '14px', color: '#666666', display: 'block', marginBottom: '8px' }}>
              ニックネーム <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl px-4 py-3"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E0E0E0',
                color: '#333333',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="ニックネームを入力"
            />
          </div>

          {/* Grade */}
          <div className="mb-4">
            <label style={{ fontSize: '14px', color: '#666666', display: 'block', marginBottom: '8px' }}>
              学年
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl px-4 py-3"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E0E0E0',
                color: '#333333',
                fontSize: '16px',
                outline: 'none'
              }}
            >
              <option value="">未設定</option>
              <option value="1年生">1年生</option>
              <option value="2年生">2年生</option>
              <option value="3年生">3年生</option>
              <option value="4年生">4年生</option>
              <option value="5年生">5年生</option>
              <option value="6年生">6年生</option>
            </select>
          </div>

          {/* Class */}
          <div className="mb-4">
            <label style={{ fontSize: '14px', color: '#666666', display: 'block', marginBottom: '8px' }}>
              クラス
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full rounded-xl px-4 py-3"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E0E0E0',
                color: '#333333',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="例: 1組"
            />
          </div>

          {/* PIN */}
          <div className="mb-4">
            <label style={{ fontSize: '14px', color: '#666666', display: 'block', marginBottom: '8px' }}>
              PIN（変更する場合のみ入力）
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl px-4 py-3"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E0E0E0',
                color: '#333333',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="4桁の数字"
            />
          </div>

          {/* PIN Confirm */}
          <div className="mb-6">
            <label style={{ fontSize: '14px', color: '#666666', display: 'block', marginBottom: '8px' }}>
              PIN（確認用）
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl px-4 py-3"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E0E0E0',
                color: '#333333',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="4桁の数字（再入力）"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl py-3 active:scale-95 transition-transform"
              style={{
                backgroundColor: '#F9F9F6',
                color: '#666666',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                opacity: isSaving ? 0.5 : 1
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-xl py-3 active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#4A90E2',
                color: '#FFFFFF',
                fontSize: '16px',
                opacity: isSaving ? 0.5 : 1
              }}
            >
              <Save size={20} />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
