import { createContext, useState } from "react";

export const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([
    { id: 1, title: "The Blooming of Lily of Valley", excerpt:"Every spring, a field of small white flowers blooms, quietly growing with breathtaking beauty and gentle grace, as if the valley itself is softly coming back to life." },
    { id: 2, title: "The Silmarillion", excerpt: "In Middle-earth, even when the long night seems without end and every road fades into shadow, a quiet truth endures: where despair takes root, hope is also born, for the world is shaped by the turning of tides, and no darkness has ever ruled without the promise of dawn." },
  ]);

   const addPost = (post) => setPosts((prev) => [
  ...prev,
  { ...post, id: Date.now(), likes: 0, liked: false },
]);

  const likePost = (id) =>
  setPosts((prev) =>
    prev.map((p) =>
      p.id === id
        ? { ...p, liked: !p.liked, likes: (p.likes ?? 0) + (p.liked ? -1 : 1) }
        : p
    )
  );

  const removePost = (id) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <PostsContext.Provider value={{ posts, addPost, likePost, removePost }}>
      {children}
    </PostsContext.Provider>
  );
}
