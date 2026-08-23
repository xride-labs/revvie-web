import { describe, it, expect } from "vitest";
import ridesReducer, {
  setUpcomingRides,
  setCurrentRide,
  updateParticipantLocation,
  updateParticipantStatus,
  setError,
  clearError,
  Ride,
  RideDetails,
} from "./ridesSlice";

describe("web ridesSlice", () => {
  const initial = {
    upcomingRides: [],
    myRides: [],
    pastRides: [],
    currentRide: null,
    activeRide: null,
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  };

  it("should handle setUpcomingRides", () => {
    const rides: Ride[] = [
      {
        id: "r1",
        title: "Weekend Highway Rally",
        description: "Group ride along NH44",
        type: "club",
        status: "scheduled",
        startLocation: { name: "Bangalore", lat: 12.97, lng: 77.59 },
        scheduledAt: "2026-08-01T06:00:00Z",
        estimatedDuration: 180,
        participantsCount: 12,
        organizer: { id: "u1", name: "Rider 1", avatar: null },
        createdAt: "2026-07-28T00:00:00Z",
      },
    ];

    const state = ridesReducer(initial, setUpcomingRides(rides));
    expect(state.upcomingRides).toHaveLength(1);
    expect(state.upcomingRides[0].title).toBe("Weekend Highway Rally");
  });

  it("should handle updateParticipantStatus for active ride", () => {
    const activeRide: RideDetails = {
      id: "r1",
      title: "Active Ride",
      description: "",
      type: "personal",
      status: "active",
      startLocation: { name: "A", lat: 10, lng: 20 },
      scheduledAt: "2026-07-28T00:00:00Z",
      estimatedDuration: 60,
      participantsCount: 2,
      organizer: { id: "u1", name: "Lead", avatar: null },
      createdAt: "2026-07-28T00:00:00Z",
      participants: [
        {
          id: "p1",
          userId: "u1",
          name: "Rider 1",
          username: "r1",
          avatar: null,
          status: "confirmed",
          liveStatus: "ok",
        },
      ],
      isParticipant: true,
      isPending: false,
      chatEnabled: true,
      trackingEnabled: true,
    };

    const stateWithActive = {
      ...initial,
      activeRide,
    };

    const state = ridesReducer(
      stateWithActive,
      updateParticipantStatus({ participantId: "p1", liveStatus: "need-help" })
    );

    expect(state.activeRide?.participants[0].liveStatus).toBe("need-help");
  });
});
