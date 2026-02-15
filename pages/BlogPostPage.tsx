import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { blogPosts } from "../data/blogData";

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Post Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The article you're looking for doesn't exist.
        </p>
        <Link
          to="/blog"
          className="px-6 py-3 bg-sky-500 text-white rounded-full font-bold"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white dark:bg-slate-950">
      <article className="max-w-3xl mx-auto px-6">
        {/* Navigation */}
        <div
          className="mb-12"
        >
          <Link
            to="/blog"
            className="inline-flex items-center text-sky-500 font-bold hover:gap-2 transition-all"
          >
            <span>←</span> Back to Blog
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <div
            className="flex items-center justify-center md:justify-start gap-4 mb-6"
          >
            <span className="px-3 py-1 bg-sky-500/10 text-sky-500 rounded-full text-xs font-bold border border-sky-500/20">
              {post.category}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {post.date}
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8"
          >
            {post.title}
          </h1>
          <div
            className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-12"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                alt={post.author}
              />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {post.author}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Contributor @ SkillSwap
              </div>
            </div>
          </div>
        </header>

        {/* Content Placeholder */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
        >
          <p className="text-xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed mb-8 italic border-l-4 border-sky-500 pl-6">
            {post.excerpt}
          </p>
          <p className="mb-6">
            Peer-to-peer learning is changing the way we think about education.
            Instead of a top-down approach where knowledge is dispensed by a
            single authority, reciprocal platforms like SkillSwap allow for a
            more dynamic, democratic exchange of expertise.
          </p>
          <h2 className="text-2xl font-bold mt-12 mb-6 text-slate-900 dark:text-white">
            Why it works
          </h2>
          <p className="mb-6">
            When you teach a skill, you're forced to organize your knowledge in
            a way that makes sense to someone else. This process, often called
            "The Protégé Effect," has been shown to improve the teacher's own
            understanding of the material.
          </p>
          <div className="my-12 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={post.imageUrl}
              alt="Article visual"
              className="w-full h-auto"
            />
          </div>
          <p className="mb-6">
            Beyond the cognitive benefits, there's a powerful social component.
            Building a network of peers who are equally invested in their own
            growth results in far more engagement than traditional online
            courses.
          </p>
          <p className="mb-12">
            In the coming months, we'll be introducing new ways for you to
            connect and learn. Stay tuned as we build the future of collective
            intelligence together.
          </p>
        </div>

        {/* CTA */}
        <div
          className="mt-20 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Want to swap your skills?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Start teaching and learning from thousands of peers today.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all active:scale-95 shadow-xl shadow-sky-500/25"
          >
            Get Started for Free
          </button>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
