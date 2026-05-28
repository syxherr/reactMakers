export default function HumidityCard({ hasError }) {
  if (hasError) {
    throw new Error("Something went wrong. ");
  }

  return (
    <div className="weatherCard">
      <p className="cardLabel">💧 Kelembapan</p>
      <p className="cardValue">82%</p>
      <div className="cardBar">
        <div className="cardBarFill" style={{ width: "82%" }} />
      </div>
    </div>
  );
}
