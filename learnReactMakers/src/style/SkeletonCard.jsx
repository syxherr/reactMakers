
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonCard = () => {
  return (
    <div className="weatherCard" style={{ minWidth: "140px" }}>
      <p
        className="cardLabel"
        style={{
          height: "14px",
          width: "80px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "6px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <p
        className="cardValue"
        style={{
          height: "28px",
          width: "60px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "6px",
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: "0.1s",
        }}
      />
      <div className="cardBar">
        <div
          className="cardBarFill"
          style={{
            width: "55%",
            background: "rgba(255,255,255,0.08)",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: "0.2s",
          }}
        />
      </div>
    </div>
  );
};

export default SkeletonCard;