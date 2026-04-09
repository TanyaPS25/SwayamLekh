/**
 * Chemistry Equation Converter
 * Converts spoken chemistry/mathematical expressions to proper notation
 * Only for chemistry subject, 2+ mark questions
 */

const toSuperscript = (str) => {
  const map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  return str.replace(/[0-9-]/g, char => map[char] || char);
};

const toSubscript = (str) => {
  const map = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  return str.replace(/[0-9]/g, char => map[char] || char);
};

const REPLACEMENTS = [
  // Greek letters first (longest match first)
  [/\bdelta\s+g\b/gi, 'ΔG'],
  [/\bdelta\s+h\b/gi, 'ΔH'],
  [/\bdelta\s+s\b/gi, 'ΔS'],
  [/\bdelta\b/gi, 'Δ'],
  [/\balpha\b/gi, 'α'],
  [/\bbeta\b/gi, 'β'],
  [/\bgamma\b/gi, 'γ'],
  [/\blambda\b/gi, 'λ'],
  [/\btheta\b/gi, 'θ'],
  [/\bsigma\b/gi, 'σ'],
  [/\bomega\b/gi, 'Ω'],
  [/\bpi\b/gi, 'π'],
  [/\bmu\b/gi, 'μ'],
  // Powers
  [/\bsquared\b/gi, '²'],
  [/\bcubed\b/gi, '³'],
  [/\bto\s+the\s+power\s+minus\s+(\w+)\b/gi, (_, n) => `⁻${toSuperscript(n)}`],
  [/\bto\s+the\s+power\s+(\w+)\b/gi, (_, n) => toSuperscript(n)],
  [/\braised\s+to\s+(\w+)\b/gi, (_, n) => toSuperscript(n)],
  // Operators
  [/\bplus\b/gi, '+'],
  [/\bminus\b/gi, '−'],
  [/\bequals\b/gi, '='],
  [/\bequal\s+to\b/gi, '='],
  [/\bdivided\s+by\b/gi, '/'],
  [/\bmultiplied\s+by\b/gi, '×'],
  [/\binto\b/gi, '×'],
  [/\bgreater\s+than\b/gi, '>'],
  [/\bless\s+than\b/gi, '<'],
  // Units
  [/\bdegrees?\s+celsius\b/gi, '°C'],
  [/\bdegrees?\s+kelvin\b/gi, 'K'],
  [/\bdegrees?\b/gi, '°'],
  [/\bkilo\s*joules?\s+per\s+mole\b/gi, 'kJ/mol'],
  [/\bjoules?\s+per\s+mole\s+kelvin\b/gi, 'J/mol·K'],
  [/\bper\s+litre\b/gi, 'L⁻¹'],
  [/\bmole\b/gi, 'mol'],
  // Chemistry formulas
  [/h\s*2\s*s\s*o\s*4/gi, 'H₂SO₄'],
  [/h\s*2\s*o/gi, 'H₂O'],
  [/c\s*o\s*2/gi, 'CO₂'],
  [/n\s*a\s*o\s*h/gi, 'NaOH'],
  [/n\s*h\s*3/gi, 'NH₃'],
  [/h\s*c\s*l/gi, 'HCl'],
  // Subscripts for elements
  [/\b([A-Za-z][a-z]?)\s+(zero|one|two|three|four|five|six|seven|eight|nine)\b/gi, (_, el, num) => `${el}${toSubscript(num.toLowerCase().replace(/zero/, '0').replace(/one/, '1').replace(/two/, '2').replace(/three/, '3').replace(/four/, '4').replace(/five/, '5').replace(/six/, '6').replace(/seven/, '7').replace(/eight/, '8').replace(/nine/, '9'))}`],
  [/\b([A-Za-z][a-z]?)\s+(\d+)\b/g, (_, el, num) => `${el}${toSubscript(num)}`],
];

export function convertChemistryEquation(text) {
  if (!text || typeof text !== 'string') return text;

  try {
    console.log('[ChemistryEquation] Converting:', text);
    let result = text;
    for (const [pattern, replacement] of REPLACEMENTS) {
      result = result.replace(pattern, typeof replacement === 'function' ? replacement : replacement);
    }
    console.log('[ChemistryEquation] Converted to:', result);
    return result;
  } catch (error) {
    console.warn('[ChemistryEquation] Conversion failed:', error);
    return text;
  }
}

export function hasEquationPatterns(text) {
  if (!text) return false;

  const patterns = [
    /\b(delta|alpha|beta|gamma|lambda|mu|pi|theta|omega|sigma)\b/i,
    /\b(squared|cubed|to the power|raised to)\b/i,
    /\b(equals|divided by|multiplied by|plus|minus)\b/i,
    /\b(H2SO4|NaOH|KCl|CaCO3|HCl|NaCl)\b/i,
    /[ΔαβγλμπθΩσ]/,
  ];

  return patterns.some(pattern => pattern.test(text));
}