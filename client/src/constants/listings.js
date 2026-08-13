// Shared option lists for listings and seeker profiles.
//
// These are stored as plain strings on the Firestore documents, so the write
// side (AddListing / EditListing / AddSeekerProfile) and the read side
// (PropertyDetails / SeekerDetails) must agree exactly. Keeping one copy here
// is what stops a tag from silently disappearing on the details page — which
// is exactly what used to happen to seeker highlights.

/** Room highlights — AddListing, EditListing, PropertyDetails. */
export const highlightOptions = [
  'Attached washroom', 'Market nearby', 'Attached balcony', 'Close to metro station',
  'Public transport nearby', 'Gated society', 'No Restriction', 'Newly built',
  'Separate washrooms', 'House keeping', 'Park nearby', 'Gym nearby',
];

/** Room amenities — AddListing, EditListing, PropertyDetails. */
export const amenityOptions = [
  { name: 'TV', emoji: '📺' }, { name: 'Fridge', emoji: '🧊' },
  { name: 'Kitchen', emoji: '🍳' }, { name: 'Wifi', emoji: '📶' },
  { name: 'Machine', emoji: '🧼' }, { name: 'AC', emoji: '❄️' },
  { name: 'Powerbackup', emoji: '🔋' }, { name: 'Cook', emoji: '👨‍🍳' },
  { name: 'Parking', emoji: '🅿️' },
];

/** Seeker highlights — AddSeekerProfile, SeekerDetails. */
export const seekerHighlightOptions = [
  'Working full time', 'College student', '25+ age', '<25 age',
  'Working night shifts', 'Have 2 wheeler', 'Have 4 wheeler', 'Will shift immediately',
  'Have pets', 'Need no furnishing', 'Pure vegetarian',
];
