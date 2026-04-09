import React from 'react';

export default function ChemistryEquationRenderer({ text }) {
  if (!text) return null;

  return (
    <div
      style={{
        backgroundColor: '#fffde7',
        borderLeft: '3px solid var(--accent)',
        padding: '12px 16px',
        margin: '8px 0',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '18px',
        lineHeight: '1.4',
        color: 'var(--ink)',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}