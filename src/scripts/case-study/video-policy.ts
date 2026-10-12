type MediaConnection = EventTarget & { saveData?: boolean; effectiveType?: string };

export function mediaConnection(): MediaConnection | undefined {
  return (navigator as Navigator & { connection?: MediaConnection }).connection;
}

/** Use the same opt-out for intro preparation, cards and case recordings. */
export function isDataSaving(): boolean {
  const connection = mediaConnection();
  return Boolean(connection?.saveData || ['2g', 'slow-2g'].includes(connection?.effectiveType ?? ''));
}
