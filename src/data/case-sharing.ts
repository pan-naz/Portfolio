import type { Project } from './portfolio';
export function caseDescription(project: Project) {
  const intro = project.outcome ?? project.description;
  return intro.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? intro;
}
export function caseShareImage(project: Project) {
  if (['hooko', 'gutsul-made', 'pet-care'].includes(project.id)) return `/og/${project.id}.jpg`;
  const image = project.video?.poster ?? project.imageReducedMotionSrc ?? project.image;
  return image.endsWith('.webp') ? `/og/${project.id}.jpg` : image;
}
