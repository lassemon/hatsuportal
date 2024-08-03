export const highlightTextPart = (text?: string, toHighlightPart?: string): string => {
  if (text && toHighlightPart) {
    const regexp = new RegExp(toHighlightPart, 'gi')
    return text.replaceAll(regexp, '<span class="highlight">' + toHighlightPart + '</span>')
  }
  return '<span>' + (text ?? '') + '</span>'
}
