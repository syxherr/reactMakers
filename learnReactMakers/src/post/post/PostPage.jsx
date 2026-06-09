import { Suspense, useState, useRef, useId, useContext, useCallback, memo, lazy, useMemo } from "react";
import { usePosts } from "../../hooks/UsePosts";
import { useProfile } from "../../hooks/UseProfile";
import styles from "./PostPage.module.css";
import withComments from "../../hocs/withComments";
import SkeletonCard from "../../style/SkeletonCard";
import { ProfileProvider } from "../context/ProfileContext";
import { PostsProvider } from "../context/PostsContext";
import { Helmet } from "react-helmet-async";
import { UserContext } from "../context/UserContext";

function PostCard({ post, comments, commentText, setCommentText, addComment, removeComment }) {
  const { removePost, likePost } = usePosts();
  const commentInputId  = useId();
  const commentListId   = useId();
  const commentInputRef = useRef(null);

  const handleAddComment = useCallback(() => {
    addComment();
    commentInputRef.current?.focus();
  }, [addComment]);

  const handleCommentKeyDown = useCallback((e) => {
    if (e.key === "Enter")  handleAddComment();
    if (e.key === "Escape") { setCommentText(""); commentInputRef.current?.focus(); }
  }, [handleAddComment, setCommentText]);

  return (
    <article
      className={styles.postCard}
      aria-labelledby={`post-title-${post.id}`}
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      <meta itemProp="headline" content={post.title} />
      <meta itemProp="author"   content="Rainstagram User" />
      {post.excerpt && <meta itemProp="description" content={post.excerpt} />}

      <h3 id={`post-title-${post.id}`} className={styles.postTitle} itemProp="name">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className={styles.postExcerpt} itemProp="abstract">{post.excerpt}</p>
      )}

      <div className={styles.postActions}>
        <button
          className={`${styles.likeBtn} ${post.liked ? styles.liked : ""}`}
          onClick={() => likePost(post.id)}
          aria-pressed={post.liked}
          aria-label={post.liked ? `Unlike "${post.title}"` : `Like "${post.title}"`}
        >
          <span aria-hidden="true">{post.liked ? "❤️" : "🤍"}</span>
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => removePost(post.id)}
          aria-label={`Delete post: "${post.title}"`}
        >
          Delete
        </button>
      </div>

      <section className={styles.commentSection} aria-label={`Comments on "${post.title}"`}>
        {comments?.length > 0 && (
          <ul
            id={commentListId}
            aria-label={`${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
            aria-live="polite"
            aria-atomic="false"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {comments.map((c) => (
              <li key={c.id} className={styles.commentItem}>
                <span>{c.text}</span>
                <button onClick={() => removeComment(c.id)} aria-label={`Remove comment: "${c.text}"`}>
                  <span aria-hidden="true">🗑️</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.commentForm} role="group" aria-label="Add a comment">
          <label htmlFor={commentInputId} className={styles.srOnly}>
            Write a comment on &quot;{post.title}&quot;
          </label>
          <input
            ref={commentInputRef}
            id={commentInputId}
            className={styles.input}
            placeholder="Write a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            autoComplete="off"
            aria-describedby={comments?.length > 0 ? commentListId : undefined}
          />
          <button className={styles.addBtn} onClick={handleAddComment} aria-label="Submit comment">
            Send
          </button>
        </div>
      </section>
    </article>
  );
}

const PostCardWithComments = memo(withComments(PostCard));

const ProfileHeader = memo(function ProfileHeader() {
  const { profile } = useProfile();
  return (
    <div className={styles.heroBorder}>
      <h2 className={styles.heroTitle}>{profile.greeting}</h2>
      <p className={styles.heroTagline}>{profile.tagline}</p>
    </div>
  );
});

const PostsSection = memo(function PostsSection() {
  const { posts, addPost } = usePosts();
  const [title,      setTitle]      = useState("");
  const [excerpt,    setExcerpt]    = useState("");
  const [titleError, setTitleError] = useState("");

  const titleInputId   = useId();
  const excerptInputId = useId();
  const titleErrorId   = useId();
  const titleRef       = useRef(null);

  const handleAdd = useCallback(() => {
    if (!title.trim()) {
      setTitleError("Post title is required.");
      titleRef.current?.focus();
      return;
    }
    setTitleError("");
    addPost({ title: title.trim(), excerpt: excerpt.trim() });
    setTitle("");
    setExcerpt("");
    titleRef.current?.focus();
  }, [title, excerpt, addPost]);

  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    if (titleError) setTitleError("");
  }, [titleError]);

  const handleFormKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setTitle("");
      setExcerpt("");
      setTitleError("");
      titleRef.current?.focus();
    }
  }, []);

  return (
    <div className={styles.card}>
      <Suspense fallback={<SkeletonCard />}>
        <h2 className={styles.sectionTitle}>Recent Posts</h2>

        <section aria-label="Posts feed" aria-live="polite" aria-atomic="false">
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
          noValidate
          onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
          onKeyDown={handleFormKeyDown}
        >
          <h3 className={styles.formHeading}>New Post</h3>

          <label htmlFor={titleInputId} className={styles.srOnly}>Post title (required)</label>
          <input
            id={titleInputId}
            ref={titleRef}
            className={`${styles.input}${titleError ? ` ${styles.inputError}` : ""}`}
            placeholder="Post title…"
            value={title}
            onChange={handleTitleChange}
            aria-required="true"
            aria-invalid={!!titleError}
            aria-describedby={titleError ? titleErrorId : undefined}
            autoComplete="off"
          />

          {titleError && (
            <p id={titleErrorId} role="alert" className={styles.fieldError}>{titleError}</p>
          )}

          <label htmlFor={excerptInputId} className={styles.srOnly}>Post excerpt (optional)</label>
          <input
            id={excerptInputId}
            className={styles.input}
            placeholder="Short excerpt…"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            autoComplete="off"
          />

          <button type="submit" className={styles.addBtn}>Add Post</button>
        </form>
      </Suspense>
    </div>
  );
});

export default function PostPage() {
  const { user } = useContext(UserContext);
  const postsKey = useMemo(() => `posts_${user.name}`, [user.name]);

  return (
    <>
      <Helmet>
        <title>Rainstagram — Share your thoughts and ideas</title>
        <meta name="description" content="Rainstagram is a space to share your thoughts, ideas, and stories with the world." />
        <meta property="og:title"       content="Rainstagram — Share your thoughts and ideas" />
        <meta property="og:description" content="Rainstagram is a space to share your thoughts, ideas, and stories with the world." />
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="Rainstagram" />
        <link rel="canonical"           href="https://www.rainstagram.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context":    "https://schema.org",
          "@type":       "WebSite",
          "name":        "Rainstagram",
          "url":         "https://www.rainstagram.com/",
          "description": "A space to share your thoughts, ideas, and stories.",
        })}</script>
      </Helmet>

      <PostsProvider storageKey={postsKey}>
        <ProfileProvider>
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>Rainstagram</h1>
            <div className={styles.card}>
              <ProfileHeader />
            </div>
            <PostsSection />
          </div>
        </ProfileProvider>
      </PostsProvider>
    </>
  );
}