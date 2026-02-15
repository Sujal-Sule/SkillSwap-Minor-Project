export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "power-of-reciprocal-learning",
    title: "The Power of Reciprocal Learning",
    excerpt:
      "Why teaching someone else is often the fastest way to master a subject yourself.",
    author: "Sujal Sule",
    date: "Feb 12, 2026",
    category: "Education",
    imageUrl:
      "/person 2.png",
  },
  {
    id: "b2",
    slug: "maximizing-your-skillswap-tokens",
    title: "Maximizing Your SkillSwap Tokens",
    excerpt:
      "Learn how to optimize your teaching schedule to earn more credits and unlock expert-level mentors.",
    author: "Alex Rivera",
    date: "Feb 10, 2026",
    category: "Guides",
    imageUrl:
      "/person 1.png",
  },
  {
    id: "b3",
    slug: "building-community-in-the-digital-age",
    title: "Building Community in the Digital Age",
    excerpt:
      "How peer-to-peer platforms are creating lasting connections beyond the screen.",
    author: "Priya Sharma",
    date: "Feb 05, 2026",
    category: "Community",
    imageUrl:
      "/female 1.png",
  },
];
