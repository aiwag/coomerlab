// This utility file centralizes parsing and formatting logic.

/**
 * Robustly extracts the username from both new and old URL formats.
 * - New: https://chaturbate.com/fullvideo/?b=username
 * - Old: https://chaturbate.com/username
 */
export function getUsernameFromUrl(url: string): string | null {
  try {
    if (url.includes('/fullvideo/')) {
      const urlObject = new URL(url);
      return urlObject.searchParams.get('b');
    } else {
      const match = url.match(/chaturbate\.com\/([^/]+)/);
      return match ? match[1] : null;
    }
  } catch (error) {
    console.error("Could not parse username from URL:", url, error);
    return null;
  }
}

/**
 * Generates the correct thumbnail URL for a given username.
 */
export function generateThumbUrl(username: string | null): string {
  if (!username) {
    // Return a placeholder or a default "broken" image
    return 'https://via.placeholder.com/150/000000/FFFFFF/?text=Error';
  }
  return `https://jpeg.live.mmcdn.com/stream?room=${username}`;
}

// --- Functions from previous steps ---

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export function getGenderColor(gender: string): string {
  switch (gender) {
    case 'f': return 'bg-pink-500';
    case 'm': return 'bg-blue-500';
    case 'c': return 'bg-purple-500';
    case 't': return 'bg-orange-500'; // Added 't' for trans
    default: return 'bg-gray-500';
  }
}