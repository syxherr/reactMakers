import { Suspense, useState } from "react";
import { usePosts } from "../hooks/UsePosts";
import { useProfile } from "../hooks/UseProfile";
import styles from "./PostPage.module.css";
import withComments from "../hocs/withComments";
import SkeletonCard from "../../style/SkeletonCard";
import { ProfileProvider } from "../context/ProfileContext";
import { PostsProvider } from "../context/PostsContext";


function ProfileHeader() {
  const { profile } = useProfile();

  return (
    <div className={styles.heroBorder}>
      <h2 className={styles.heroTitle}>{profile.greeting}</h2>
      <p className={styles.heroTagline}>{profile.tagline}</p>
    </div>
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
  return (
    <div className={styles.postCard}>
      <p className={styles.postTitle}>{post.title}</p>
      <p className={styles.postExcerpt}>{post.excerpt}</p>

      <div className={styles.postActions}>
        <button
          className={`${styles.likeBtn} ${post.liked ? styles.liked : ""}`}
          onClick={() => likePost(post.id)}
        >
          {post.liked ? "❤️" : "🤍"}
        </button>

        <button
          className={styles.deleteBtn}
          onClick={() => removePost(post.id)}
        >
          Hapus
        </button>
      </div>

      <div className={styles.commentSection}>
        {comments?.map((c) => (
          <div key={c.id} className={styles.commentItem}>
            <span>{c.text}</span>
            <button onClick={() => removeComment(c.id)}>🗑️</button>
          </div>
        ))}

        <div className={styles.commentForm}>
          <input
            className={styles.input}
            placeholder="Tulis komentar..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className={styles.addBtn} onClick={addComment}>
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}

const PostCardWithComments = withComments(PostCard);

function PostsSection() {
  const { posts, addPost } = usePosts();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addPost({ title: title.trim(), excerpt: excerpt.trim() });
    setTitle("");
    setExcerpt("");
  };

  return (
    <div className={styles.card}>
      <Suspense fallback={<SkeletonCard />}>
        <p className={styles.sectionTitle}>Posts</p>

        <div className={styles.innerCard}>
          <p className={styles.sectionTitle}>Recent Posts</p>
          {posts?.length === 0 && (
            <p className={styles.emptyText}>Belum ada post.</p>
          )}
          {posts?.map((p) => (
            <PostCardWithComments key={p.id} post={p} />
          ))}
        </div>

        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Judul post..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Penggalan cerita..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
          <button className={styles.addBtn} onClick={handleAdd}>
            Tambah Post
          </button>
        </div>
      </Suspense>
    </div>
  );
}

export default function PostPage() {

  return (
    <PostsProvider>
      <ProfileProvider>
        <div className={styles.page}>
          <div className={styles.content}>

            <h1 className={styles.pageTitle}>Rainstagram</h1>

            <div className={styles.card}>
              <ProfileHeader />
            </div>

            <PostsSection />
          </div>
        </div>
      </ProfileProvider>
    </PostsProvider>
  );
}
