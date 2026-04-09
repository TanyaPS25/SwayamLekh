import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Mic, TerminalSquare } from 'lucide-react';
import EquationRenderer from './EquationRenderer';
import ChemistryEquationRenderer from './ChemistryEquationRenderer';
import { convertChemistryEquation, hasEquationPatterns } from '../../utils/chemistryEquationConverter';
import { getPartAnswer } from '../../utils/questionParts';

export default function AnswerBox({ answer = "", isActive, onAnswerChange, subjectMode, question, questionParts = [], activePartKey, onActivePartChange }) {
  const contentEditableRef = useRef(null);
  const isPartQuestion = questionParts.length > 0;
  const [displayText, setDisplayText] = useState('');
  const debounceTimerRef = useRef(null);

  const isChemistryLongQuestion = subjectMode === 'chemistry' && question?.marks >= 2 && question?.type === 'long';

  // Convert and debounce display text
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isChemistryLongQuestion) {
      // Convert immediately
      const converted = convertChemistryEquation(answer);
      // Debounce display update
      debounceTimerRef.current = setTimeout(() => {
        setDisplayText(converted);
      }, 150);
    } else {
      // No debounce for non-chemistry
      setDisplayText(answer);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [answer, isChemistryLongQuestion]);

  const hasChemistryEquation = useMemo(() => {
    if (!isChemistryLongQuestion) return false;
    return hasEquationPatterns(displayText);
  }, [isChemistryLongQuestion, displayText]);

  useEffect(() => {
    // Basic sync for mock purposes - only for non-chemistry
    if (!isPartQuestion && !isChemistryLongQuestion && contentEditableRef.current && contentEditableRef.current.innerText !== displayText && !hasLatexContent(displayText)) {
      contentEditableRef.current.innerText = displayText;
    }
  }, [displayText, isPartQuestion, isChemistryLongQuestion]);

  const hasLatexContent = (text) => {
    return text.includes('\\') || text.includes('^') || text.includes('_');
  };

  const handleInput = (e) => {
    if (onAnswerChange) {
      onAnswerChange(e.target.innerText);
    }
  };

  const wordCount = useMemo(() => {
    const textToCount = isChemistryLongQuestion ? displayText : answer;
    if (isPartQuestion) {
      return questionParts.reduce((total, part) => {
        const partAnswer = getPartAnswer(textToCount, part.key, questionParts)
        const words = partAnswer ? partAnswer.trim().split(/\s+/).filter((w) => w.length > 0).length : 0
        return total + words
      }, 0)
    }
    return textToCount ? textToCount.trim().split(/\s+/).filter(w => w.length > 0).length : 0
  }, [answer, displayText, isPartQuestion, isChemistryLongQuestion, questionParts]);
  
  const charCount = useMemo(() => {
    const textToCount = isChemistryLongQuestion ? displayText : answer;
    if (isPartQuestion) {
      return questionParts.reduce((total, part) => {
        const partAnswer = getPartAnswer(textToCount, part.key, questionParts)
        return total + (partAnswer ? partAnswer.length : 0)
      }, 0)
    }
    return typeof textToCount === 'string' ? textToCount.length : 0
  }, [answer, displayText, isPartQuestion, isChemistryLongQuestion, questionParts])
  
  const containerClass = `answer-box-container ${isActive ? 'active-answer' : 'active-command'}`;

  return (
    <div className={containerClass}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface2)', borderTopLeftRadius: 'calc(var(--radius) - 2px)', borderTopRightRadius: 'calc(var(--radius) - 2px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--ink)' }}>
          {isActive ? <Mic size={20} color="var(--red)" /> : <TerminalSquare size={20} color="var(--accent)" />}
          <span>Your Answer</span>
          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginLeft: '8px' }}>
            {wordCount} words
          </span>
        </div>
        <div style={{ fontWeight: 600, color: isActive ? 'var(--red)' : 'var(--accent)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isActive ? '🔴 Answer Mode' : '🔵 Command Mode'}
        </div>
      </div>
      
      {isPartQuestion ? (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--ink2)', lineHeight: 1.5 }}>
            Say Part A or Part B to switch the active answer section.
          </div>
          {questionParts.map((part) => {
            const partAnswer = getPartAnswer(answer, part.key, questionParts)
            const isActivePart = activePartKey === part.key
            return (
              <label
                key={part.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1px solid ${isActivePart ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: isActivePart ? 'var(--surface2)' : 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{part.label}</span>
                  <button
                    type="button"
                    onClick={() => onActivePartChange?.(part.key)}
                    style={{
                      border: '1px solid var(--border)',
                      background: isActivePart ? 'var(--accent)' : 'var(--surface)',
                      color: isActivePart ? 'white' : 'var(--ink2)',
                      borderRadius: '999px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isActivePart ? 'Active' : 'Switch'}
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink2)' }}>{part.text}</div>
                <textarea
                  value={partAnswer}
                  onChange={(e) => onAnswerChange?.(part.key, e.target.value)}
                  onFocus={() => onActivePartChange?.(part.key)}
                  placeholder={`Answer for ${part.label}`}
                  style={{
                    minHeight: '120px',
                    width: '100%',
                    resize: 'vertical',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    padding: '14px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: 'var(--ink)',
                    backgroundColor: 'var(--surface)',
                    outline: 'none',
                  }}
                />
              </label>
            )
          })}
        </div>
      ) : hasChemistryEquation ? (
        <div style={{ padding: '24px', minHeight: '150px' }}>
          <ChemistryEquationRenderer text={displayText} />
        </div>
      ) : (subjectMode === 'maths') && answer && hasLatexContent(answer) ? (
        <div style={{ padding: '24px', minHeight: '150px', fontSize: '20px' }}>
          <EquationRenderer latex={answer} inline={false} />
        </div>
      ) : (
        <div 
          ref={contentEditableRef}
          className="answer-content"
          contentEditable={true}
          onInput={handleInput}
          data-placeholder="Your answer will appear here as you speak..."
          suppressContentEditableWarning={true}
        />
      )}
      
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--ink3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Characters: {charCount}</span>
        <span>Auto-saved locally</span>
      </div>
    </div>
  );
}