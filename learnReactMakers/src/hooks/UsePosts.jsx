import { useContext } from "react";
import { PostsContext } from "../post/context/PostsContext";

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside <PostsProvider>");
  return ctx;
}