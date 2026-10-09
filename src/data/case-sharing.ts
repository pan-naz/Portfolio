import type { Project } from './portfolio';
import { hookoHero } from './hooko-case-study';
export function caseDescription(project: Project) {
  const intro = project.outcome ?? project.description;
  return intro.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? intro;
}
export function caseShareImage(project: Project) {
  return project.id === 'hooko' ? hookoHero.video.poster : project.video?.poster ?? project.imageReducedMotionSrc ?? project.image;
}
