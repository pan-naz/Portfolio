// Profile facts verified against the user's LinkedIn PDF on 12 September 2026.
// See COPY.md for sources, editorial decisions and deliberately omitted claims.
export const profile = {
  name: 'Nazarii Pankiv',
  brand: 'naz.wtf',
  title: 'Product Designer',
  email: '',
  linkedin: 'https://www.linkedin.com/in/nazariypankiv/',
  approach: 'Understand how people work. Map the problem, test the idea and refine the interaction. Then build the systems that help a product grow—from the first useful experience to the details people use every day.',
  biography: 'I’ve led design at DataGPT and Voximplant, working across web, mobile and enterprise SaaS. My practice brings together UX research, interaction design and design systems—from early discovery to delivery. Alongside hands-on design, I’ve hired designers, shaped teams and helped bring B2B products from idea to launch.',
  description: 'Nazarii Pankiv — product designer with 7+ years in SaaS, UX research and design systems. Previously Design Lead at DataGPT and Head of Design at Voximplant.',
};

export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  year: string;
  image: string;
  imageAlt: string;
  href: string;
  pending: boolean;
}

export const projects: Project[] = [
  { id: '01', title: 'Project 01', description: 'A closer look at the challenge, the process and the result.', role: '', year: '', image: '', imageAlt: '', href: '', pending: true },
  { id: '02', title: 'Project 02', description: 'The decisions behind the finished work.', role: '', year: '', image: '', imageAlt: '', href: '', pending: true },
  { id: '03', title: 'Project 03', description: 'An idea, explored from first thought to final detail.', role: '', year: '', image: '', imageAlt: '', href: '', pending: true },
];

export const experience: { role: string; company: string; period: string }[] = [
  { role: 'Design Lead', company: 'DataGPT', period: 'May 2022 – Dec 2025' },
  { role: 'Head of Design', company: 'Voximplant', period: 'Jun 2021 – Mar 2022' },
  { role: 'UX Design Lead', company: 'Voximplant', period: 'Jul 2018 – Jun 2021' },
  { role: 'Senior UI/UX Designer', company: '24eastyard', period: 'Aug 2017 – Jul 2018' },
  { role: 'UI/UX Designer', company: 'Yellow Leaf Software', period: 'Feb 2016 – Jul 2017' },
  { role: 'Freelance Web Designer', company: 'Upwork', period: 'Jul 2015 – Feb 2016' },
];
