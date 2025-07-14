import React, { useState } from 'react';
import { GlassCard } from '../common';
import type { ABTest } from '../../types/analytics';

interface ABTestPanelProps {
  tests: ABTest[];
  onCreateTest?: () => void;
}

const ABTestPanel: React.FC<ABTestPanelProps> = ({ tests, onCreateTest }) => {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#6366f1';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: ABTest['status']) => (
    <span
      style={{
        background: getStatusColor(status),
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}
    >
      {status}
    </span>
  );

  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="h3">A/B Tests</h3>
        {onCreateTest && (
          <button 
            className="btn btn-primary"
            onClick={onCreateTest}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            + New Test
          </button>
        )}
      </div>

      {tests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧪</div>
          <div className="text-lg text-gray-600" style={{ marginBottom: '8px' }}>
            No A/B Tests Running
          </div>
          <div className="text-sm text-gray-500">
            Create your first A/B test to optimize survey performance
          </div>
          {onCreateTest && (
            <button 
              className="btn btn-primary"
              onClick={onCreateTest}
              style={{ marginTop: '16px' }}
            >
              Create A/B Test
            </button>
          )}
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {tests.map((test) => (
            <div
              key={test.id}
              style={{
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedTest?.id === test.id ? 'var(--primary-50)' : 'white'
              }}
              onClick={() => setSelectedTest(selectedTest?.id === test.id ? null : test)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="font-medium">{test.name}</div>
                {getStatusBadge(test.status)}
              </div>

              <div className="text-sm text-gray-600" style={{ marginBottom: '12px' }}>
                Started: {test.startDate.toLocaleDateString()}
                {test.endDate && ` • Ended: ${test.endDate.toLocaleDateString()}`}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {test.variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    style={{
                      background: variant.id === test.winner ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-50)',
                      border: variant.id === test.winner ? '2px solid #10b981' : '1px solid var(--gray-200)',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {variant.id === test.winner && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                      >
                        👑
                      </div>
                    )}
                    <div className="text-xs font-medium text-gray-700">{variant.name}</div>
                    <div className="text-lg font-bold text-primary" style={{ margin: '4px 0' }}>
                      {variant.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {variant.conversions} conversions
                    </div>
                    <div className="text-xs text-gray-500">
                      {variant.traffic}% traffic
                    </div>
                  </div>
                ))}
              </div>

              {selectedTest?.id === test.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Significance Level</div>
                      <div className="text-lg font-semibold">{(test.significanceLevel * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
                      <div className="text-lg font-semibold">
                        {Math.ceil((new Date().getTime() - test.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                    {test.winner && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Winner</div>
                        <div className="text-lg font-semibold text-success">
                          {test.variants.find(v => v.id === test.winner)?.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default ABTestPanel;