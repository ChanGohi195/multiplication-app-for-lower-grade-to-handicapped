import { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV, bulkRegisterUsers, UserDataExtended } from '../../utils/adminUtils';

interface AdminImportProps {
  onBack: () => void;
}

export function AdminImport({ onBack }: AdminImportProps) {
  const [csvText, setCsvText] = useState('');
  const [parsedUsers, setParsedUsers] = useState<UserDataExtended[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const handleParse = () => {
    if (!csvText.trim()) {
      setErrors(['CSVデータを入力してください']);
      return;
    }

    const result = parseCSV(csvText);
    setParsedUsers(result.users);
    setErrors(result.errors);
    setShowPreview(result.users.length > 0);
    setImportResult(null);
  };

  const handleImport = () => {
    if (parsedUsers.length === 0) return;

    const result = bulkRegisterUsers(parsedUsers);
    setImportResult(result);
    setCsvText('');
    setParsedUsers([]);
    setShowPreview(false);
  };

  const handleReset = () => {
    setCsvText('');
    setParsedUsers([]);
    setErrors([]);
    setShowPreview(false);
    setImportResult(null);
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
          CSV一括登録
        </h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Format Info */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: '#FFF4E6', border: '1px dashed #F6C744' }}
        >
          <h3 style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold', marginBottom: '8px' }}>
            📋 CSVフォーマット
          </h3>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6', marginBottom: '8px' }}>
            1行につき1ユーザー、以下の形式で入力してください：
          </p>
          <div
            className="rounded-lg p-3 mb-2"
            style={{ backgroundColor: '#FFFFFF', fontFamily: 'monospace', fontSize: '13px', color: '#333333' }}
          >
            ニックネーム,PIN,学年,クラス
          </div>
          <p style={{ fontSize: '13px', color: '#666666', lineHeight: '1.5' }}>
            ・PINは4桁の数字<br />
            ・学年とクラスは省略可能<br />
            ・例: たろう,1234,3年生,1組
          </p>
        </div>

        {/* CSV Input */}
        {!showPreview && (
          <>
            <div className="mb-4">
              <label style={{ fontSize: '14px', color: '#666666', marginBottom: '8px', display: 'block' }}>
                CSVデータ
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="たろう,1234,3年生,1組&#10;はなこ,5678,3年生,2組&#10;じろう,9012,4年生,1組"
                rows={8}
                className="w-full rounded-xl px-4 py-3"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E0E0E0',
                  color: '#333333',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleParse}
                disabled={!csvText.trim()}
                className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
                style={{
                  backgroundColor: '#4A90E2',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}
              >
                <Upload size={20} />
                データを確認
              </button>
              {csvText && (
                <button
                  onClick={handleReset}
                  className="px-4 rounded-xl active:scale-95 transition-transform"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#666666',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0'
                  }}
                >
                  クリア
                </button>
              )}
            </div>
          </>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: '#FEE', border: '2px solid #E74C3C' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle size={20} color="#E74C3C" />
              <h3 style={{ fontSize: '16px', color: '#E74C3C', fontWeight: 'bold' }}>
                エラー ({errors.length}件)
              </h3>
            </div>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} style={{ fontSize: '13px', color: '#666666', lineHeight: '1.5' }}>
                  • {error}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {showPreview && parsedUsers.length > 0 && (
          <>
            <div
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: '#E6F7FF', border: '2px solid #4A90E2' }}
            >
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle size={20} color="#4A90E2" />
                <h3 style={{ fontSize: '16px', color: '#4A90E2', fontWeight: 'bold' }}>
                  {parsedUsers.length}件のユーザーを登録できます
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#666666' }}>
                以下の内容で登録します。問題なければ「登録実行」を押してください。
              </p>
            </div>

            <div className="mb-4">
              <h3 style={{ fontSize: '16px', color: '#666666', marginBottom: '12px' }}>
                登録予定ユーザー
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {parsedUsers.map((user, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-3"
                    style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontSize: '15px', color: '#333333', fontWeight: 'bold' }}>
                          {user.nickname}
                        </p>
                        <p style={{ fontSize: '13px', color: '#666666' }}>
                          PIN: {user.pin} / {user.grade && user.class ? `${user.grade} ${user.class}` : '学年・クラスなし'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl py-3 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#666666',
                  fontSize: '16px',
                  border: '2px solid #E0E0E0'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleImport}
                className="flex-1 rounded-xl py-3 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#4A90E2',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}
              >
                登録実行
              </button>
            </div>
          </>
        )}

        {/* Import Result */}
        {importResult && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#E6F7FF', border: '2px solid #4A90E2' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle size={20} color="#4A90E2" />
              <h3 style={{ fontSize: '16px', color: '#4A90E2', fontWeight: 'bold' }}>
                登録完了
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
              成功: {importResult.success}件<br />
              {importResult.failed > 0 && `失敗: ${importResult.failed}件`}
            </p>
            <button
              onClick={handleReset}
              className="mt-3 w-full rounded-xl py-2 active:scale-95 transition-transform"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#4A90E2',
                fontSize: '14px',
                border: '2px solid #4A90E2'
              }}
            >
              続けて登録する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
