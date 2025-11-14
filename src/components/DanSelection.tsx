import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface DanSelectionProps {
  onStart: (selectedDans: number[]) => void;
  onBack: () => void;
}

export function DanSelection({ onStart, onBack }: DanSelectionProps) {
  const [selectedDans, setSelectedDans] = useState<number[]>([]);

  const toggleDan = (dan: number) => {
    if (selectedDans.includes(dan)) {
      setSelectedDans(selectedDans.filter(d => d !== dan));
    } else {
      setSelectedDans([...selectedDans, dan]);
    }
  };

  const handleStart = () => {
    if (selectedDans.length > 0) {
      onStart(selectedDans);
    }
  };

  return (
    <div className="flex flex-col min-h-full mx-auto w-full md:max-w-[480px]" style={{ backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10" style={{ backgroundColor: '#F9F9F6' }}>
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <ArrowLeft size={24} color="#333333" />
        </button>
        
        <h2 style={{ fontSize: '20px', color: '#333333' }}>だんを えらぶ</h2>
        
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-8 pb-32">
        <div className="text-center mt-6 mb-8">
          <p style={{ fontSize: '16px', color: '#666666' }}>
            れんしゅうしたい だんを<br />
            えらんでね
          </p>
        </div>

        {/* Dan Grid */}
        <div className="w-full max-w-[360px] mb-8">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dan) => {
              const isSelected = selectedDans.includes(dan);
              return (
                <button
                  key={dan}
                  onClick={() => toggleDan(dan)}
                  className="relative rounded-2xl active:scale-95 transition-all"
                  style={{
                    height: '96px',
                    backgroundColor: isSelected ? '#F6C744' : '#FFFFFF',
                    border: isSelected ? '3px solid #4A90E2' : '2px solid #E0E0E0',
                    color: '#333333'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div style={{ fontSize: '32px', lineHeight: '1' }}>{dan}</div>
                    <div style={{ fontSize: '14px', marginTop: '4px' }}>のだん</div>
                  </div>
                  
                  {/* Check mark */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#4A90E2' }}
                    >
                      <Check size={16} color="#FFFFFF" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selection Counter */}
        <div className="mb-6">
          <p style={{ fontSize: '16px', color: '#666666' }}>
            {selectedDans.length > 0 ? (
              <>✓ <span style={{ color: '#4A90E2' }}>{selectedDans.length}</span>つ えらんでいるよ</>
            ) : (
              <>だんを えらんでね</>
            )}
          </p>
        </div>

        {/* Start Button */}
        <div className="w-full max-w-[360px]">
          <button
            onClick={handleStart}
            disabled={selectedDans.length === 0}
            className="w-full rounded-2xl active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
            style={{
              height: '64px',
              backgroundColor: '#4A90E2',
              color: '#FFFFFF',
              fontSize: '20px'
            }}
          >
            はじめる ▶
          </button>
        </div>
      </div>
    </div>
  );
}