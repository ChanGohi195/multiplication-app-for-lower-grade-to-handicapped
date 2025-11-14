import { useState } from 'react';
import { ArrowLeft, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { resetStatsOnly, resetAllData } from '../../utils/adminUtils';

interface AdminResetProps {
  onBack: () => void;
}

type ResetType = 'stats' | 'all' | null;

export function AdminReset({ onBack }: AdminResetProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetType, setResetType] = useState<ResetType>(null);
  const [confirmText, setConfirmText] = useState('');
  const [resetResult, setResetResult] = useState<number | null>(null);

  const handleResetClick = (type: ResetType) => {
    setResetType(type);
    setShowConfirm(true);
    setConfirmText('');
    setResetResult(null);
  };

  const handleConfirmReset = () => {
    if (confirmText !== '削除実行') return;

    let count = 0;
    if (resetType === 'stats') {
      count = resetStatsOnly();
    } else if (resetType === 'all') {
      count = resetAllData();
    }

    setResetResult(count);
    setShowConfirm(false);
    setConfirmText('');
  };

  const getResetInfo = (type: ResetType) => {
    if (type === 'stats') {
      return {
        title: '成績データのみリセット',
        description: '全ユーザーの成績（スコア・連続日数・問題履歴）をリセットします。アカウント情報（ニックネーム・PIN・学年・クラス）は保持されます。',
        warning: '全ユーザーの成績データが初期化されます',
        color: '#F6C744'
      };
    } else {
      return {
        title: '全データ削除（アカウント含む）',
        description: '全ユーザーのアカウント・成績を含む全データを完全に削除します。この操作は取り消せません。',
        warning: 'アプリの全データが完全に削除されます',
        color: '#E74C3C'
      };
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
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '20px', color: '#333333', fontWeight: 'bold' }}>
          データリセット
        </h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Warning */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: '#FEE', border: '2px solid #E74C3C' }}
        >
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={20} color="#E74C3C" />
            <h3 style={{ fontSize: '16px', color: '#E74C3C', fontWeight: 'bold' }}>
              重要な警告
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
            データリセットは取り消すことができません。必要に応じて事前にデータエクスポートでバックアップを作成してください。
          </p>
        </div>

        {/* Reset Result */}
        {resetResult !== null && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: '#E6F7FF', border: '2px solid #4A90E2' }}
          >
            <h3 style={{ fontSize: '16px', color: '#4A90E2', fontWeight: 'bold', marginBottom: '4px' }}>
              リセット完了
            </h3>
            <p style={{ fontSize: '14px', color: '#666666' }}>
              {resetResult}件のデータが削除されました
            </p>
          </div>
        )}

        {/* Reset Options */}
        <div className="space-y-4">
          {/* Stats Only Reset */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: '#FFF4E6' }}
              >
                <RotateCcw size={24} color="#F6C744" />
              </div>
              <div className="flex-1">
                <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
                  成績データのみリセット
                </h3>
                <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                  アカウントを残して成績だけリセット
                </p>
              </div>
            </div>

            <div
              className="rounded-lg p-3 mb-3"
              style={{ backgroundColor: '#F9F9F6' }}
            >
              <p style={{ fontSize: '13px', color: '#666666', marginBottom: '6px', fontWeight: 'bold' }}>
                削除される内容：
              </p>
              <ul style={{ fontSize: '13px', color: '#666666', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>累計スコア・最高スコア</li>
                <li>連続日数・最終練習日</li>
                <li>問題履歴・段別ミス回数</li>
              </ul>
              <p style={{ fontSize: '13px', color: '#4A90E2', marginTop: '8px', fontWeight: 'bold' }}>
                ✓ アカウント情報（ニックネーム・PIN・学年・クラス）は保持されます
              </p>
            </div>

            <button
              onClick={() => handleResetClick('stats')}
              className="w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                backgroundColor: '#F6C744',
                color: '#FFFFFF',
                fontSize: '16px'
              }}
            >
              <RotateCcw size={20} />
              成績をリセット
            </button>
          </div>

          {/* Full Reset */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #E74C3C' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: '#FEE' }}
              >
                <Trash2 size={24} color="#E74C3C" />
              </div>
              <div className="flex-1">
                <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
                  全データ削除
                </h3>
                <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                  アカウントを含む全データを完全削除
                </p>
              </div>
            </div>

            <div
              className="rounded-lg p-3 mb-3"
              style={{ backgroundColor: '#FEE' }}
            >
              <p style={{ fontSize: '13px', color: '#666666', marginBottom: '6px', fontWeight: 'bold' }}>
                削除される内容：
              </p>
              <ul style={{ fontSize: '13px', color: '#666666', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>全ユーザーのアカウント情報</li>
                <li>全成績データ・統計情報</li>
                <li>アプリの全データ</li>
              </ul>
              <p style={{ fontSize: '13px', color: '#E74C3C', marginTop: '8px', fontWeight: 'bold' }}>
                ⚠️ この操作は取り消すことができません
              </p>
            </div>

            <button
              onClick={() => handleResetClick('all')}
              className="w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                backgroundColor: '#E74C3C',
                color: '#FFFFFF',
                fontSize: '16px'
              }}
            >
              <Trash2 size={20} />
              全データを削除
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && resetType && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-[360px]"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={24} color={getResetInfo(resetType).color} />
              <h3 style={{ fontSize: '20px', color: '#333333', fontWeight: 'bold' }}>
                {getResetInfo(resetType).title}
              </h3>
            </div>

            <p style={{ fontSize: '15px', color: '#666666', marginBottom: '12px', lineHeight: '1.6' }}>
              {getResetInfo(resetType).description}
            </p>

            <div
              className="rounded-lg p-3 mb-4"
              style={{ backgroundColor: '#FEE', border: '1px solid #E74C3C' }}
            >
              <p style={{ fontSize: '14px', color: '#E74C3C', fontWeight: 'bold' }}>
                ⚠️ {getResetInfo(resetType).warning}
              </p>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: '14px', color: '#666666', marginBottom: '8px', display: 'block' }}>
                「削除実行」と入力して確認してください：
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="削除実行"
                className="w-full rounded-xl px-4 py-3"
                style={{
                  backgroundColor: '#F9F9F6',
                  border: '2px solid #E0E0E0',
                  color: '#333333',
                  fontSize: '16px',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
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
                onClick={handleConfirmReset}
                disabled={confirmText !== '削除実行'}
                className="flex-1 rounded-xl py-3 active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
                style={{
                  backgroundColor: getResetInfo(resetType).color,
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
