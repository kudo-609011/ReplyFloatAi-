/**
 * Safe clipboard helper that works reliably inside iframes and handles
 * "Document is not focused" errors by gracefully falling back to execCommand.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Try modern Clipboard API
  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Ignored: document not focused or permission restricted in iframe
    }
  }

  // Reliable DOM fallback using temporary off-screen textarea + execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (e) {
    console.warn('Clipboard write fallback error:', e);
    return false;
  }
}
