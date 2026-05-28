import { Suspense, useState, useRef, useId } from "react";
import { usePosts } from "../../hooks/UsePosts";
import { useProfile } from "../../hooks/UseProfile";
import styles from "./PostPage.module.css";
import withComments from "../../hocs/withComments";
import SkeletonCard from "../../style/SkeletonCard";
import { ProfileProvider } from "../context/ProfileContext";
import { PostsProvider } from "../context/PostsContext";
import { Helmet } from "react-helmet-async";

function ProfileHeader() {
  const { profile } = useProfile();

  return (
    <header className={styles.heroBorder} aria-label="Profile header">
      <h2 className={styles.heroTitle}>{profile.greeting}</h2>
      <p className={styles.heroTagline}>{profile.tagline}</p>
    </header>
  );
}

function PostCard({
  post,
  comments,
  commentText,
  setCommentText,
  addComment,
  removeComment,
}) {
  const { removePost, likePost } = usePosts();

  const commentInputId = useId(); // ✅ sekarang diimport
  const commentListId = useId();

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter") 
      addComment();
    
  };

  return (
     <article
      className={styles.postCard}
      aria-label={`Post: ${post.title}`}
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      <meta itemProp="headline" content={post.title} />
      {post.excerpt && <meta itemProp="description" content={post.excerpt} />}

      <h3 className={styles.postTitle} itemProp="name">
        {post.title}
      </h3>
      <p className={styles.postExcerpt} itemProp="abstract">
        {post.excerpt}
      </p>

      <div className={styles.postActions}>
        <button
          className={`${styles.likeBtn} ${post.liked ? styles.liked : ""}`}
          onClick={() => likePost(post.id)}
          aria-pressed={post.liked}
          aria-label={post.liked ? "Unlike post" : "Like post"}
        >
          <span aria-hidden="true">
            {post.liked ? "❤️" : "🤍"}
          </span>
        </button>

        <button
          className={styles.deleteBtn}
          onClick={() => removePost(post.id)}
          aria-label={`Delete post: ${post.title}`}
        >
          Delete
        </button>
      </div>


      <section
        className={styles.commentSection}
        aria-label={`Comments on "${post.title}"`}
      >
        {comments?.length > 0 && (
          <ul
            id={commentListId}
            aria-label="Comments"
            aria-live="polite"
            aria-atomic="false"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >

        {comments.map((c) => (
              <li key={c.id} className={styles.commentItem}>
                <span>{c.text}</span>
                <button
                  onClick={() => removeComment(c.id)}
                  aria-label={`Remove comment: "${c.text}"`}
                >
                  <span aria-hidden="true">🗑️</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.commentForm} role="group" aria-label="Add a comment">
          <label htmlFor={commentInputId} className="sr-only">
            Write a comment
          </label>
          <input
            id={commentInputId}
            className={styles.input}
            placeholder="Write a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            aria-label="Write a comment"
            autoComplete="off"
          />
          <button
            className={styles.addBtn}
            onClick={addComment}
            aria-label="Submit comment"
          >
            Send
          </button>
        </div>
      </section>
    </article>
  );
}

const PostCardWithComments = withComments(PostCard);

function PostsSection() {
  const { posts, addPost } = usePosts();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const titleInputId = useId();
  const excerptInputId = useId();
  const titleRef = useRef(null);

  const handleAdd = () => {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }                                                    // ← dulu tutup di sini (bug!)
    addPost({ title: title.trim(), excerpt: excerpt.trim() }); // ✅ di dalam fungsi
    setTitle("");                                              // ✅ di dalam fungsi
    setExcerpt("");                                            // ✅ di dalam fungsi
    titleRef.current?.focus();                                 // ✅ di dalam fungsi
  };

const handleKeyDown = (e) => {
  if (e.key === "Enter") 
    handleAdd();
  };

  return (
    <div className={styles.card}>
      <Suspense fallback={<SkeletonCard />}>
        <h2 className={styles.sectionTitle}>Posts</h2>

        <section aria-label="Recent posts" aria-live="polite" aria-atomic="false">
          <h3 className={styles.sectionTitle}>Recent Posts</h3>

          {posts?.length === 0 && (
            <p className={styles.emptyText} role="status">
              No posts yet. Be the first to share something!
            </p>
          )}


          {posts?.map((p) => (
            <PostCardWithComments key={p.id} post={p} />
          ))}
        </section>

        <form
          className={styles.form}
          aria-label="Create a new post"
          onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
        >
          <label htmlFor={titleInputId} className="sr-only">
            Post title
          </label>
          <input
            id={titleInputId}
            ref={titleRef}
            className={styles.input}
            placeholder="Post title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-required="true"
            autoComplete="off"
          />

          <label htmlFor={excerptInputId} className="sr-only">
            Post excerpt
          </label>
          <input
            id={excerptInputId}
            className={styles.input}
            placeholder="Short excerpt…"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          <button type="submit" className={styles.addBtn}>
            Add Post
          </button>
        </form>
      </Suspense>
    </div>
  );
}

export default function PostPage() {
  return (
    <>
      <Helmet>
        <title>Rainstagram — Share your thoughts and ideas</title>
        <meta name="description" content="Rainstagram is a space to share your thoughts, ideas, and stories with the world." />
        <meta property="og:title" content="Rainstagram — Share your thoughts and ideas" />
        <meta property="og:description" content="Rainstagram is a space to share your thoughts, ideas, and stories with the world." />
        <meta property="og:type" content="website" />

        <link rel="canonical" href="https://www.rainstagram.com/" />
      </Helmet>

      <PostsProvider>
        <ProfileProvider>

          <a href="#main-content" className="sr-only" style={{ position: "absolute" }}>
            Skip to main content
          </a>

          <div className={styles.page}>
            <div className={styles.content}>
              <h1 className={styles.pageTitle}>Rainstagram</h1>

              <div className={styles.card}>
                <ProfileHeader />
              </div>

              <main id="main-content" aria-label="Posts Feed">
                <PostsSection />
              </main>
            </div>
          </div>
        </ProfileProvider>
      </PostsProvider>
    </>
  );
}
