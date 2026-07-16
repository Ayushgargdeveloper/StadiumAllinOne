import type { CrowdLocation, InclusiveSupportGroup, OperationsAlert, StadiumContext } from "../types";

export const stadiumContext: StadiumContext = {
  navigation: "Gate B has the clearest route to sections 120-138; use the north concourse signs.",
  crowd: "Gate A is high traffic; Gate B and the accessible entrance currently have lower pressure.",
  accessibility: "Accessible Entrance E has step-free access, nearby restrooms, and volunteer support.",
  transportation: "Transport Exit T connects to public rail and accessible shuttle pickup.",
  medical: "The medical assistance desk is beside Section 112 near the quiet zone.",
  sustainability: "Water refill is available beside Food Zone F, with waste sorting at each concourse island.",
  staff: "Venue volunteers should escalate crowd concerns to the operations desk before redirecting fans."
};

export const crowdLocations: readonly CrowdLocation[] = [
  {
    id: "gate-a",
    name: "Gate A",
    crowdStatus: "High",
    waitingTimeCategory: "Long",
    recommendedAlternative: "Gate B",
    recommendedAction: "Redirect arriving fans through east queue lanes and add two volunteer guides."
  },
  {
    id: "gate-b",
    name: "Gate B",
    crowdStatus: "Moderate",
    waitingTimeCategory: "Medium",
    recommendedAlternative: "Accessible Entrance E for step-free entry",
    recommendedAction: "Keep signage visible and reserve one lane for family groups."
  },
  {
    id: "food-zone-f",
    name: "Food Zone F",
    crowdStatus: "Low",
    waitingTimeCategory: "Short",
    recommendedAlternative: "Water refill station beside Section 116",
    recommendedAction: "Promote refill points and keep waste-separation volunteers nearby."
  },
  {
    id: "transport-exit-t",
    name: "Transport Exit T",
    crowdStatus: "Critical",
    waitingTimeCategory: "Severe",
    recommendedAlternative: "South pedestrian route to rail platform 2",
    recommendedAction: "Hold departures in waves and send staff to the accessible shuttle queue."
  },
  {
    id: "accessible-entrance-e",
    name: "Accessible Entrance E",
    crowdStatus: "Low",
    waitingTimeCategory: "Short",
    recommendedAlternative: "Gate B family lane",
    recommendedAction: "Maintain wheelchair clearance and keep a volunteer at the assistance point."
  }
];

export const operationsAlerts: readonly OperationsAlert[] = [
  {
    id: "gate-congestion",
    title: "Gate congestion",
    severity: "Elevated",
    location: "Gate A",
    responsibleTeam: "Volunteer coordination",
    recommendedResponse: "Open an overflow lane and direct late arrivals to Gate B."
  },
  {
    id: "transport-delay",
    title: "Transport delay",
    severity: "Urgent",
    location: "Transport Exit T",
    responsibleTeam: "Transport operations",
    recommendedResponse: "Stage fan departures and prioritize accessible shuttle boarding."
  },
  {
    id: "accessibility-request",
    title: "Accessibility assistance request",
    severity: "Advisory",
    location: "Accessible Entrance E",
    responsibleTeam: "Accessibility support",
    recommendedResponse: "Send one trained volunteer to assist wheelchair users and confirm restroom access."
  }
];

export const inclusiveSupportGroups: readonly InclusiveSupportGroup[] = [
  {
    title: "Accessibility",
    items: [
      "Wheelchair-friendly entrance: Accessible Entrance E",
      "Accessible restroom: North concourse beside Section 118",
      "Medical assistance desk: Section 112",
      "Quiet or sensory-friendly zone: Section 114 family room"
    ]
  },
  {
    title: "Transportation",
    items: [
      "Recommended stadium exit: Transport Exit T",
      "Public transport guidance: Follow rail signs for platform 2",
      "Accessible transport option: Step-free shuttle pickup outside Transport Exit T"
    ]
  },
  {
    title: "Sustainability",
    items: [
      "Water-refill location: Food Zone F",
      "Waste-separation guidance: Use labeled recycling, compost, and landfill bins",
      "Public transport recommendation: Use rail or shuttle before private rideshare"
    ]
  }
];
