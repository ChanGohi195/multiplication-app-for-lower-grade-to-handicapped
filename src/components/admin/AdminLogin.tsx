import { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      localStorage.setItem('kuku-admin-session', 'true');
      onLogin();
    } else {
      setError('パスワードが正しくありません');
      setPassword('');
    }
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
          ← 戻る
        </button>
        <div />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16">
        <div className="w-full max-w-[360px]">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: '#4A90E2' }}>
              <Lock size={48} color="#FFFFFF" />
            </div>
            <h2 style={{ fontSize: '28px', color: '#333333', marginBottom: '8px' }}>
              管理者ログイン
            </h2>
            <p style={{ fontSize: '16px', color: '#666666' }}>
              管理者パスワードを入力してください
            </p>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="管理者パスワード"
              className="w-full rounded-xl px-6 py-4 text-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: error ? '2px solid #E74C3C' : '2px solid #E0E0E0',
                color: '#333333',
                outline: 'none'
              }}
              autoFocus
            />
            {error && (
              <p style={{ fontSize: '14px', color: '#E74C3C', marginTop: '8px' }}>
                {error}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={!password}
            className="w-full rounded-2xl active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
            style={{
              height: '64px',
              backgroundColor: '#4A90E2',
              color: '#FFFFFF',
              fontSize: '20px'
            }}
          >
            ログイン
          </button>

          {/* Info */}
          <div
            className="mt-6 rounded-xl p-4"
            style={{ backgroundColor: '#FFF4E6', border: '1px dashed #F6C744' }}
          >
            <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
              💡 環境変数 <code>VITE_ADMIN_PASSWORD</code> でパスワードを設定できます。
              デフォルトは <code>admin123</code> です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
