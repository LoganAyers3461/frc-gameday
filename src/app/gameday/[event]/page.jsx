import GamedayWidget from "@/components/gameday/GamedayWidget";

export default async function GamedayPage({ params, searchParams }) {
  const { event } = await params; 
  const sp = await searchParams; 

  const team = sp?.team || [];

  console.log("EVENT:", event);
  console.log("TEAM:", team);


  return (
    console.log("Rendering GamedayPage with:", { event, team }) || 
    <div className="w-full h-screen flex flex-col bg-black text-white overflow-hidden">
      <GamedayWidget event={event} initialTeams={team} isMultiview={false} />
    </div>
  );
}