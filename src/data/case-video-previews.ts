export interface CaseVideoPreview {
  src: string;
  columns: number;
  rows: number;
  count: number;
  interval: number;
  width: number;
  height: number;
  displayWidth?: number;
}

// Every controlled recording uses the same shared preview UI. Frames come from
// the original videos; the sheet is fetched only on timeline interaction.
export const caseVideoPreviews: Readonly<Record<string, CaseVideoPreview>> = {
  '/projects/voximplant-case-study/scenario-editor.mp4': { src: '/projects/voximplant-case-study/scenario-editor-preview.jpg', columns: 8, rows: 9, count: 69, interval: 1, width: 240, height: 128 },
  '/projects/datagpt-case-study/data-setup.mp4': { src: '/projects/datagpt-case-study/data-setup-preview.jpg', columns: 8, rows: 11, count: 85, interval: 1, width: 240, height: 140 },
  '/projects/datagpt-case-study/pilot-video.mp4': { src: '/projects/datagpt-case-study/pilot-preview.jpg', columns: 8, rows: 15, count: 116, interval: 1, width: 240, height: 124 },
  '/projects/datagpt-case-study/llm-instructions.mp4': { src: '/projects/datagpt-case-study/llm-instructions-preview.jpg', columns: 8, rows: 6, count: 42, interval: 1, width: 240, height: 144 },
  '/projects/datagpt-case-study/website.mp4': { src: '/projects/datagpt-case-study/website-preview.jpg', columns: 8, rows: 7, count: 51, interval: 1, width: 240, height: 135 },
  '/projects/hooko-case-study/demo.mp4': { src: '/projects/hooko-case-study/demo-preview.jpg?v=e342e9b914ee', columns: 8, rows: 11, count: 85, interval: 1, width: 120, height: 245, displayWidth: 80 },
  '/projects/telegram-file-picker-case-study/entry.mp4': { src: '/projects/telegram-file-picker-case-study/entry-preview.jpg', columns: 8, rows: 15, count: 117, interval: 1, width: 240, height: 150 },
  '/projects/offf-conference-case-study/page.mp4': { src: '/projects/offf-conference-case-study/page-preview.jpg', columns: 8, rows: 6, count: 43, interval: 1, width: 240, height: 142 },
  '/projects/professions-in-digital-case-study/page.mp4': { src: '/projects/professions-in-digital-case-study/page-preview.jpg', columns: 8, rows: 7, count: 52, interval: 1, width: 240, height: 149 },
  '/projects/quit-university-case-study/page.mp4': { src: '/projects/quit-university-case-study/page-preview.jpg', columns: 8, rows: 6, count: 43, interval: 1, width: 240, height: 149 },
};

export function getCaseVideoPreview(src: string): CaseVideoPreview | undefined {
  return caseVideoPreviews[src.split('?')[0]];
}
