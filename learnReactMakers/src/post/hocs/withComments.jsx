// hocs/withComments.jsx
import { useState } from "react";

function withComments(WrappedComponent) {
  return function ComponentWithComments(props) {
    const [comments, setComments] = useState([]); //simpan daftar
    const [commentText, setCommentText] = useState(""); //simpan teks

    const addComment = () => { 
      if (!commentText.trim()) return;
      setComments(prev => [
        ...prev,
        { id: Date.now(), text: commentText.trim() }
      ]);
      setCommentText("");
    };

    const removeComment = (id) => {
      setComments(prev => prev.filter(c => c.id !== id));
    };

    return (
      <WrappedComponent //render komponen, disuntik state & fungsi lewat prop
        {...props}
        comments={comments}
        commentText={commentText}
        setCommentText={setCommentText}
        addComment={addComment}
        removeComment={removeComment}
      />
    );
  };
}

export default withComments;