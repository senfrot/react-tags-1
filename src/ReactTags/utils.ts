import escapeRegExp from 'lodash/escapeRegExp';

/**
 * Convert an array of delimiter characters into a regular expression
 * that can be used to split content by those delimiters.
 * @param {Array<char>} delimiters Array of characters to turn into a regex
 * @returns {RegExp} Regular expression
 */
// eslint-disable-next-line import/prefer-default-export
export function buildRegExpFromDelimiters(delimiters) {
  const delimiterChars = delimiters
    .map((delimiter) => {
      // See: http://stackoverflow.com/a/34711175/1463681
      const chrCode = delimiter - 48 * Math.floor(delimiter / 48);
      return String.fromCharCode(delimiter >= 96 ? chrCode : delimiter);
    })
    .join('');
  const escapedDelimiterChars = escapeRegExp(delimiterChars);
  return new RegExp(`[${escapedDelimiterChars}]+`);
}
