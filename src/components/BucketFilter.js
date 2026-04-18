"use client";

export default function BucketFilter({ buckets, selectedBucketId, onSelect }) {
  return (
    <div className="bucket-filter" role="tablist" aria-label="Filter by bucket">
      <button
        role="tab"
        aria-selected={selectedBucketId === "all"}
        className={`bucket-filter-tab ${selectedBucketId === "all" ? "active" : ""}`}
        onClick={() => onSelect("all")}
      >
        All
      </button>
      {buckets.map((bucket) => (
        <button
          key={bucket.id}
          role="tab"
          aria-selected={selectedBucketId === bucket.id}
          className={`bucket-filter-tab ${selectedBucketId === bucket.id ? "active" : ""}`}
          onClick={() => onSelect(bucket.id)}
          style={
            selectedBucketId === bucket.id
              ? { backgroundColor: bucket.color, borderColor: bucket.color }
              : { borderColor: bucket.color }
          }
        >
          {bucket.name}
        </button>
      ))}
    </div>
  );
}
