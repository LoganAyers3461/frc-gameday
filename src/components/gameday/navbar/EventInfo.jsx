export default function EventInfo({ event }) {
  let title = "Loading...";
  if (event.district) {
    title = `[${event.district.abbreviation.toUpperCase()}] ${event.name.length > 50 ? event.short_name : event.name}`;
  } else {
    title = event.name.length > 50 ? event.short_name : event.name;
  }

  return (
    <div className="text-nowrap text-center">
      <h4>{title}</h4>
    </div>
  );
  
}