export default function NavbarActions({ onRefresh }) {
  return (
    <div className="d-flex">
      <button className="btn btn-dark m-1">
        🎥
      </button>

      <button className="btn btn-dark m-1" onClick={onRefresh}>
        🔄
      </button>

      <a className="btn btn-dark m-1" href="/">
        🏠
      </a>
    </div>
  );
}