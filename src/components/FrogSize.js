export default function FrogSize({ size, max = 5 }) {
  const safe = Math.min(max, Math.max(1, Number(size) || 1));
  return (
    <span className="frog-size" aria-label={`Size ${safe} of ${max}`}>
      {"🐸".repeat(safe)}
    </span>
  );
}
