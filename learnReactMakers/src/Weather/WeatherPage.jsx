import "../style/index.css";
import PixelSnow from "../style/effect/PixelSnow";
import React, { Suspense } from "react";
import ErrorBoundary from "../ErrorBoundary";

import SkeletonCard from "../style/SkeletonCard";
import withComments from "../hocs/withComments";
import { lazy } from "react";

export const WindCard = lazy(() => import("./WindCard"));
export const VisibilityCard = lazy(() => import("./VisibilityCard"));
export const HumidityCard = lazy(() => import("./HumidityCard"));

function WeatherPage({
  comments,
  commentText,
  setCommentText,
  addComment,
  removeComment,
}) {
  return (
    <div className="weather-container">
      {/* Snow Effect */}
      <div style={{ width: "100%", height: "600px", position: "absolute" }}>
        <PixelSnow
          color="#ffffff"
          flakeSize={0.008}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.35}
          density={0.3}
          direction={135}
          brightness={1}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
      </div>

      <div className="weatherContent">
        <div className="weatherGrid">
          <ErrorBoundary> 
            <Suspense fallback={<SkeletonCard />}>
              <WindCard hasError/>
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<SkeletonCard />}>
              <VisibilityCard />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<SkeletonCard />}>
              <HumidityCard />
            </Suspense>
          </ErrorBoundary>
        </div>

        <div className="commentSection">
          <p className="commentTitle">Komen soal cuaca hari ini...</p>

          {comments?.map((c) => (
            <div key={c.id} className="commentItem">
              <span>{c.text}</span>
              <button onClick={() => removeComment(c.id)}>🗑️</button>
            </div>
          ))}

          <div className="commentForm">
            <input
              className="commentInput"
              placeholder="Tulis komentarmu..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()} // ← tambahin ini
            />
            <button className="commentBtn" onClick={addComment}>
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
const WeatherPageWithComments = withComments(React.memo(WeatherPage));

export default WeatherPageWithComments;
