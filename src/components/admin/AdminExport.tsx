import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Code } from 'lucide-react';
import { getAllUsers, exportUsersToCSV, exportAllDataAsJSON, UserWithStats } from '../../utils/adminUtils';

interface AdminExportProps {
  onBack: () => void;
}

export function AdminExport({ onBack }: AdminExportProps) {
  const [users, setUsers] = useState<UserWithStats[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;

    const csv = exportUsersToCSV(users);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `kuku-users-${timestamp}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    if (users.length === 0) return;

    const json = exportAllDataAsJSON(users);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(json, `kuku-backup-${timestamp}.json`, 'application/json;charset=utf-8;');
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
          データエクスポート
        </h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Status */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: '#E6F7FF', border: '2px solid #4A90E2' }}
        >
          <p style={{ fontSize: '16px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
            エクスポート可能なデータ
          </p>
          <p style={{ fontSize: '14px', color: '#666666' }}>
            {users.length}件のユーザー情報
          </p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ fontSize: '16px', color: '#666666' }}>
              エクスポートできるデータがありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* CSV Export */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: '#F9F9F6' }}
                >
                  <FileText size={24} color="#4A90E2" />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
                    CSV形式
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                    ユーザー一覧と統計データを表形式でエクスポート
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg p-3 mb-3"
                style={{ backgroundColor: '#F9F9F6' }}
              >
                <p style={{ fontSize: '13px', color: '#666666', marginBottom: '6px' }}>
                  含まれる項目：
                </p>
                <ul style={{ fontSize: '13px', color: '#666666', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>ニックネーム</li>
                  <li>ユーザーID</li>
                  <li>学年・クラス</li>
                  <li>累計スコア・最高スコア</li>
                  <li>連続日数・最終練習日</li>
                </ul>
                <p style={{ fontSize: '12px', color: '#999999', marginTop: '8px' }}>
                  ※ PINは含まれません（セキュリティ保護）
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#4A90E2',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}
              >
                <Download size={20} />
                CSVをダウンロード
              </button>
            </div>

            {/* JSON Export */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: '#FFFFFF', border: '2px solid #E0E0E0' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: '#F9F9F6' }}
                >
                  <Code size={24} color="#F6C744" />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: '18px', color: '#333333', fontWeight: 'bold', marginBottom: '4px' }}>
                    JSON形式（完全バックアップ）
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                    全データを構造化形式でエクスポート
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg p-3 mb-3"
                style={{ backgroundColor: '#F9F9F6' }}
              >
                <p style={{ fontSize: '13px', color: '#666666', marginBottom: '6px' }}>
                  含まれる項目：
                </p>
                <ul style={{ fontSize: '13px', color: '#666666', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>全ユーザー情報</li>
                  <li>詳細な統計データ</li>
                  <li>問題履歴・段別ミス回数</li>
                  <li>エクスポート日時・バージョン</li>
                </ul>
                <p style={{ fontSize: '12px', color: '#999999', marginTop: '8px' }}>
                  ※ PINは含まれません（セキュリティ保護）
                </p>
              </div>

              <button
                onClick={handleExportJSON}
                className="w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#F6C744',
                  color: '#FFFFFF',
                  fontSize: '16px'
                }}
              >
                <Download size={20} />
                JSONをダウンロード
              </button>
            </div>

            {/* Info */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFF4E6', border: '1px dashed #F6C744' }}
            >
              <p style={{ fontSize: '13px', color: '#666666', lineHeight: '1.6' }}>
                💡 エクスポートされたファイルは、成績管理や分析にご活用ください。
                JSONファイルは将来的な復元機能で使用できる可能性があります。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
