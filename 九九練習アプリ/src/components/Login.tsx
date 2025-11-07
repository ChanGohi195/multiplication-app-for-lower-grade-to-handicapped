import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

interface LoginProps {
  onLogin: (userId: string, nickname: string) => void;
  onShowWelcome: (userId: string, nickname: string) => void;
}

export function Login({ onLogin, onShowWelcome }: LoginProps) {
  const [mode, setMode] = useState<'select' | 'register' | 'relogin'>('select');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hashPin = (pin: string): string => {
    // Simple hash for PIN (SHA-256 would be better in production)
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nickname.trim().length === 0) {
      setError('ニックネームを いれてね');
      return;
    }

    if (nickname.trim().length > 10) {
      setError('10もじ いないで いれてね');
      return;
    }

    if (pin.length !== 4) {
      setError('4けたの ばんごうを いれてね');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate a unique user ID
      const userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      const hashedPin = hashPin(pin);

      // Save to localStorage
      const userData = {
        userId,
        nickname: nickname.trim(),
        pin: hashedPin,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(`kuku-user-${userId}`, JSON.stringify(userData));

      // Try to register on server (optional)
      try {
        const { registerUser } = await import('../utils/api');
        await registerUser(nickname.trim(), pin);
      } catch (serverErr) {
        console.log('Server registration failed (offline mode):', serverErr);
      }

      onShowWelcome(userId, nickname.trim());
    } catch (err) {
      console.error('Registration error:', err);
      setError('とうろく できませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userId.trim().length === 0) {
      setError('ユーザーIDを いれてね');
      return;
    }

    if (pin.length !== 4) {
      setError('4けたの ばんごうを いれてね');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check localStorage first
      const storedData = localStorage.getItem(`kuku-user-${userId.trim()}`);

      if (storedData) {
        const userData = JSON.parse(storedData);
        const hashedPin = hashPin(pin);

        if (userData.pin === hashedPin) {
          onLogin(userData.userId, userData.nickname);
          return;
        }
      }

      // If not found locally, try server (optional)
      try {
        const { verifyUserPin } = await import('../utils/api');
        const result = await verifyUserPin(userId.trim(), pin);

        if (result.success) {
          onLogin(result.userId, result.nickname);
          return;
        }
      } catch (serverErr) {
        console.log('Server verification failed:', serverErr);
      }

      setError('ユーザーIDか ばんごうが ちがいます');
    } catch (err) {
      console.error('Relogin error:', err);
      setError('ユーザーIDか ばんごうが ちがいます');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[360px]">
          <div className="text-center mb-16">
            <div className="mb-6" style={{ fontSize: '80px', lineHeight: '1' }}>✨</div>
            <h1 style={{ fontSize: '28px', color: '#333333', lineHeight: '1.4', marginBottom: '12px' }}>
              九九れんしゅう
            </h1>
            <p style={{ fontSize: '16px', color: '#666666', lineHeight: '1.6' }}>
              たのしく まなぼう！
            </p>
          </div>
          
          <div className="w-full space-y-4">
            <button
              onClick={() => setMode('register')}
              className="w-full rounded-2xl active:scale-95 transition-transform"
              style={{ 
                height: '72px',
                backgroundColor: '#4A90E2',
                color: '#FFFFFF',
                fontSize: '20px'
              }}
            >
              👋 あたらしく はじめる
            </button>
            
            <button
              onClick={() => setMode('relogin')}
              className="w-full rounded-2xl active:scale-95 transition-transform"
              style={{ 
                height: '72px',
                backgroundColor: '#FFFFFF',
                color: '#333333',
                fontSize: '20px',
                border: '2px solid #4A90E2'
              }}
            >
              🔑 もう つかってる
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[360px]">
          <div className="text-center mb-12">
            <div className="mb-6" style={{ fontSize: '80px', lineHeight: '1' }}>👋</div>
            <h1 style={{ fontSize: '24px', color: '#333333', lineHeight: '1.4', marginBottom: '12px' }}>
              はじめまして！
            </h1>
            <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
              ニックネームと 4けたの<br />
              ばんごうを きめてね
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="w-full space-y-6">
            <div>
              <label style={{ fontSize: '14px', color: '#666666', marginBottom: '8px', display: 'block' }}>
                ニックネーム（10もじ いない）
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ニックネーム"
                maxLength={10}
                disabled={isLoading}
                className="w-full rounded-xl px-6 py-4 outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E0E0E0',
                  color: '#333333',
                  fontSize: '18px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', color: '#666666', marginBottom: '8px', display: 'block' }}>
                4けたの ばんごう（おぼえてね！）
              </label>
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={4} 
                  value={pin} 
                  onChange={setPin}
                  disabled={isLoading}
                  containerClassName="gap-3"
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot 
                      index={0} 
                      className="!w-16 !h-16 !text-2xl rounded-xl" 
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E0E0E0'
                      }}
                    />
                    <InputOTPSlot 
                      index={1} 
                      className="!w-16 !h-16 !text-2xl rounded-xl"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E0E0E0'
                      }}
                    />
                    <InputOTPSlot 
                      index={2} 
                      className="!w-16 !h-16 !text-2xl rounded-xl"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E0E0E0'
                      }}
                    />
                    <InputOTPSlot 
                      index={3} 
                      className="!w-16 !h-16 !text-2xl rounded-xl"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E0E0E0'
                      }}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '14px', color: '#E74C3C', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || nickname.trim().length === 0 || pin.length !== 4}
              className="w-full rounded-2xl active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
              style={{
                height: '64px',
                backgroundColor: '#4A90E2',
                color: '#FFFFFF',
                fontSize: '20px'
              }}
            >
              {isLoading ? 'とうろく ちゅう...' : 'はじめる ▶'}
            </button>
          </form>

          <button
            onClick={() => setMode('select')}
            className="mt-6 active:scale-95 transition-transform"
            style={{ fontSize: '16px', color: '#999999' }}
          >
            ◀ もどる
          </button>

          <div className="mt-6 rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#FFF4E6', border: '2px solid #F6C744' }}>
            <div className="text-center">
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>📝</div>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.8' }}>
                <span style={{ color: '#F6C744' }}>4けたの ばんごう</span>は<br />
                ノートや メモに かいて<br />
                だいじに とって おいてね！
              </p>
            </div>
            <div className="text-center pt-2" style={{ borderTop: '1px dashed #F6C744' }}>
              <p style={{ fontSize: '12px', color: '#666666', lineHeight: '1.6' }}>
                おうちの ひとに みせて<br />
                いっしょに たいせつに しまおう
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p style={{ fontSize: '12px', color: '#999999', lineHeight: '1.6' }}>
              ※ ニックネームは ランキングに のるよ
            </p>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'relogin'
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[360px]">
        <div className="text-center mb-12">
          <div className="mb-6" style={{ fontSize: '80px', lineHeight: '1' }}>🔑</div>
          <h1 style={{ fontSize: '24px', color: '#333333', lineHeight: '1.4', marginBottom: '12px' }}>
            おかえり！
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
            ユーザーIDと ばんごうを<br />
            いれてね
          </p>
        </div>
        
        <form onSubmit={handleRelogin} className="w-full space-y-6">
          <div>
            <label style={{ fontSize: '14px', color: '#666666', marginBottom: '8px', display: 'block' }}>
              ユーザーID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ユーザーID"
              disabled={isLoading}
              className="w-full rounded-xl px-6 py-4 outline-none"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E0E0E0',
                color: '#333333',
                fontSize: '18px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '14px', color: '#666666', marginBottom: '8px', display: 'block' }}>
              4けたの ばんごう
            </label>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={4} 
                value={pin} 
                onChange={setPin}
                disabled={isLoading}
                containerClassName="gap-3"
              >
                <InputOTPGroup className="gap-3">
                  <InputOTPSlot 
                    index={0} 
                    className="!w-16 !h-16 !text-2xl rounded-xl"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #E0E0E0'
                    }}
                  />
                  <InputOTPSlot 
                    index={1} 
                    className="!w-16 !h-16 !text-2xl rounded-xl"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #E0E0E0'
                    }}
                  />
                  <InputOTPSlot 
                    index={2} 
                    className="!w-16 !h-16 !text-2xl rounded-xl"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #E0E0E0'
                    }}
                  />
                  <InputOTPSlot 
                    index={3} 
                    className="!w-16 !h-16 !text-2xl rounded-xl"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #E0E0E0'
                    }}
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '14px', color: '#E74C3C', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || userId.trim().length === 0 || pin.length !== 4}
            className="w-full rounded-2xl active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
            style={{
              height: '64px',
              backgroundColor: '#4A90E2',
              color: '#FFFFFF',
              fontSize: '20px'
            }}
          >
            {isLoading ? 'ログイン ちゅう...' : 'ログイン ▶'}
          </button>
        </form>

        <button
          onClick={() => setMode('select')}
          className="mt-6 active:scale-95 transition-transform"
          style={{ fontSize: '16px', color: '#999999' }}
        >
          ◀ もどる
        </button>

        <div className="mt-6 rounded-2xl p-4" style={{ backgroundColor: '#FFF4E6', border: '2px solid #F6C744' }}>
          <div className="text-center space-y-2">
            <p style={{ fontSize: '13px', color: '#333333', lineHeight: '1.7' }}>
              💡 ユーザーIDと 4けたの ばんごうは<br />
              さいしょに とうろく したときの ものだよ
            </p>
            <div className="pt-2" style={{ borderTop: '1px dashed #F6C744' }}>
              <p style={{ fontSize: '12px', color: '#666666', lineHeight: '1.6' }}>
                わすれて しまったら<br />
                おうちの ひとに きいてみてね
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
