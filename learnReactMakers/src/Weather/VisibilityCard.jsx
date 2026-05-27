export default function VisibilityCard({ hasError }) {

  if (hasError) {
    throw new Error("Gagal memuat jarak pandang!");
  }

  return (
    <div className="weatherCard">
      <p className="cardLabel">👁 Visibilitas</p>
      <p className="cardValue">6 km</p>
      <div className="cardBar">
        <div className="cardBarFill" style={{ width: "50%" }} />
      </div>
    </div>
  );
}
