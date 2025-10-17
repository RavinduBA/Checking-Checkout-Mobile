import { Database } from "../../../integrations/supabase/types";
import { MultiRoomSelector, type RoomSelection } from "../MultiRoomSelector";

// Re-export RoomSelection for compatibility
export type { RoomSelection };

type Room = Database["public"]["Tables"]["rooms"]["Row"];

interface RoomSelectionStepProps {
  rooms: Room[];
  roomSelections: RoomSelection[];
  onRoomSelectionsChange: (selections: RoomSelection[]) => void;
  defaultCurrency: string;
}

export function RoomSelectionStep({
  rooms,
  roomSelections,
  onRoomSelectionsChange,
  defaultCurrency,
}: RoomSelectionStepProps) {
  return (
    <MultiRoomSelector
      rooms={rooms}
      roomSelections={roomSelections}
      onRoomSelectionsChange={onRoomSelectionsChange}
      defaultCurrency={defaultCurrency}
    />
  );
}
