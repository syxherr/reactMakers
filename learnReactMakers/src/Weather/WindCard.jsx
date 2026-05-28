export default function WindCard({ hasError }) {

  if (hasError) {
    throw new Error("Something went wrong.");
  }

  return (
    <div className="weatherCard">
      <p className="cardLabel">💨 Angin</p>
      <p className="cardValue">14 km/h</p>
      <div className="cardBar">
        <div className="cardBarFill" style={{ width: "40%" }} />
      </div>
    </div>
  );
}
