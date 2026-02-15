import React from "react";
// import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogData";

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="px-6 sm:px-12 mb-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
            The SkillSwap <span className="text-sky-500">Blog</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stories, guides, and insights from the world's most proactive
            community of learners.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.isArray(blogPosts) && blogPosts.length > 0 ? (
            blogPosts.map((post, index) => (
              <article
                key={post.id}
                className="group flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="block relative h-56 overflow-hidden"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-bold text-sky-500 border border-sky-500/20">
                      {post.category}
                    </span>
                  </div>
                </Link>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    <span>{post.author}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-sky-500 transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sky-500 font-bold text-sm hover:gap-2 transition-all"
                  >
                    Read Full Story <span>→</span>
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-500">No blog posts found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mt-24 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto p-12 rounded-[2.5rem] bg-sky-500 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <h3 className="text-3xl font-bold mb-4 relative z-10">
            Get the best of SkillSwap
          </h3>
          <p className="text-sky-100 mb-8 max-w-md mx-auto relative z-10">
            Join 5,000+ learners receiving weekly insights on skill sharing and
            peer learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-6 py-4 rounded-full bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
            />
            <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full transition-all active:scale-95 shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
