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
      const nicknameKey = nickname.trim().toLowerCase();

      // Check for duplicate nickname in localStorage
      const existingUser = localStorage.getItem(`kuku-user-${nicknameKey}`);
      if (existingUser) {
        setError('この ニックネームは もう つかわれています');
        setIsLoading(false);
        return;
      }

      // Try to register with Supabase (hybrid mode)
      let userId: string;
      let registeredNickname: string;
      let isServerRegistration = false;

      try {
        console.log('[Login] Attempting Supabase registration...');
        const { registerUser } = await import('../utils/api');
        const result = await registerUser(nickname.trim(), pin);

        if (result && result.userId) {
          // Supabase registration successful
          console.log('[Login] ✓ Supabase registration successful:', result.userId);
          userId = result.userId;
          registeredNickname = result.nickname;
          isServerRegistration = true;
        } else {
          throw new Error('Invalid server response');
        }
      } catch (err) {
        // Supabase registration failed, use local fallback
        console.warn('[Login] ✗ Supabase registration failed, using local fallback:', err);
        userId = crypto.randomUUID();
        registeredNickname = nickname.trim();
        isServerRegistration = false;
      }

      // Save to localStorage (regardless of Supabase success/failure)
      const userData = {
        userId,
        nickname: registeredNickname,
        pin: pin
      };

      console.log('[Login] Saving to localStorage:', `kuku-user-${nicknameKey}`);
      localStorage.setItem(`kuku-user-${nicknameKey}`, JSON.stringify(userData));

      // Initialize stats
      const initialStats = {
        todayCount: 0,
        consecutiveDays: 0,
        lastDate: new Date().toDateString(),
        danMistakes: {},
        totalScore: 0,
        highScore: 0,
        problemHistory: []
      };
      localStorage.setItem(`kuku-stats-${userId}`, JSON.stringify(initialStats));

      console.log('[Login] Registration complete. Server:', isServerRegistration, 'UserId:', userId);
      onShowWelcome(userId, registeredNickname);
    } catch (err) {
      console.error('Registration error:', err);
      setError('とうろくに しっぱい しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nickname.trim().length === 0) {
      setError('ニックネームを いれてね');
      return;
    }

    if (pin.length !== 4) {
      setError('4けたの ばんごうを いれてね');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const nicknameKey = nickname.trim().toLowerCase();

      // Try server-side login first (cross-device)
      try {
        console.log('[Login] Attempting server relogin...');
        const { loginUser } = await import('../utils/api');
        const result = await loginUser(nickname.trim(), pin);

        if (result && result.userId) {
          const serverNickname = result.nickname || nickname.trim();
          const userData = { userId: result.userId, nickname: serverNickname, pin };

          // Cache locally for offline use
          localStorage.setItem(`kuku-user-${nicknameKey}`, JSON.stringify(userData));

          const statsKey = `kuku-stats-${result.userId}`;
          if (!localStorage.getItem(statsKey)) {
            const initialStats = {
              todayCount: 0,
              consecutiveDays: 0,
              lastDate: new Date().toDateString(),
              danMistakes: {},
              totalScore: 0,
              highScore: 0,
              problemHistory: []
            };
            localStorage.setItem(statsKey, JSON.stringify(initialStats));
          }

          onLogin(result.userId, serverNickname);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[Login] Server relogin failed, fallback to local:', err);
      }

      // Try to find user by nickname in localStorage
      const localUserData = localStorage.getItem(`kuku-user-${nicknameKey}`);
      console.log('Looking for user:', nickname.trim());
      console.log('Local data found:', localUserData ? 'Yes' : 'No');

      if (localUserData) {
        const userData = JSON.parse(localUserData);
        console.log('Stored user data:', userData);
        console.log('PIN match:', userData.pin === pin);

        if (userData.pin === pin) {
          onLogin(userData.userId, userData.nickname);
          setIsLoading(false);
          return;
        } else {
          setError('ばんごうが ちがいます');
          setIsLoading(false);
          return;
        }
      } else {
        setError('この ニックネームは みつかりません');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Relogin error:', err);
      setError('ログインに しっぱい しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-full flex items-center justify-center px-8 py-8 mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
        <div className="w-full max-w-[360px]">
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
      <div className="min-h-full overflow-y-auto px-8 pt-8 pb-32 mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
        <div className="flex flex-col items-center w-full max-w-[360px] mx-auto">
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
          
          <form onSubmit={handleRegister} className="w-full space-y-8">
            <div>
              <label style={{ fontSize: '16px', color: '#333333', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
                ニックネーム（10もじ いない）
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ニックネームを入力"
                maxLength={10}
                disabled={isLoading}
                className="w-full rounded-xl px-6 py-4 outline-none"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '3px solid #4A90E2',
                  color: '#333333',
                  fontSize: '18px',
                  boxShadow: '0 2px 8px rgba(74, 144, 226, 0.1)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '16px', color: '#333333', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
                4けたの ばんごう（おぼえてね！）
              </label>
              <div className="flex justify-center relative" style={{ zIndex: 1 }}>
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
    <div className="min-h-full overflow-y-auto px-8 pt-8 pb-32 mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      <div className="flex flex-col items-center w-full max-w-[360px] mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6" style={{ fontSize: '80px', lineHeight: '1' }}>🔑</div>
          <h1 style={{ fontSize: '24px', color: '#333333', lineHeight: '1.4', marginBottom: '12px' }}>
            おかえり！
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
            ニックネームと ばんごうを<br />
            いれてね
          </p>
        </div>

        <form onSubmit={handleRelogin} className="w-full space-y-8">
          <div>
            <label style={{ fontSize: '16px', color: '#333333', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
              ニックネーム
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ニックネームを入力"
              maxLength={10}
              disabled={isLoading}
              className="w-full rounded-xl px-6 py-4 outline-none"
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #4A90E2',
                color: '#333333',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(74, 144, 226, 0.1)'
              }}
            />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <label style={{ fontSize: '16px', color: '#333333', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
              4けたの ばんごう
            </label>
            <div className="flex justify-center relative">
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
