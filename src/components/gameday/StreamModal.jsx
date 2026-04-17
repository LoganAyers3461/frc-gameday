export function StreamModal({ streams }) {
  return (
    <div className="p-4">
      <h3>Streams</h3>

      <div className="flex flex-col gap-2">
        {streams.map((s, i) => (
          <a
            key={i}
            href={s.url}
            className="p-2 bg-gray-800 rounded"
            target="_blank"
          >
            {s.type.toUpperCase()} Stream
          </a>
        ))}
      </div>
    </div>
  );
}