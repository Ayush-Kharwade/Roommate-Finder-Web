// Shared lifestyle preference tags used for the compatibility % match score.
// Used at collection time (AddListing, AddSeekerProfile, EditListing, Preferences)
// and at display time (PropertyDetails, SeekerDetails, AllListings match calc).
// Keep this the single source of truth — a mismatched name in any one place
// silently breaks matching for that tag.
export const preferenceOptions = [
  { name: 'Night Owl', emoji: '🦉' },
  { name: 'Early Bird', emoji: '🐦' },
  { name: 'Studious', emoji: '📚' },
  { name: 'Fitness Freak', emoji: '🏋️' },
  { name: 'Sporty', emoji: '⚽' },
  { name: 'Wanderer', emoji: '🚗' },
  { name: 'Party Lover', emoji: '🎉' },
  { name: 'Pet Lover', emoji: '🐾' },
  { name: 'Vegan', emoji: '🌱' },
  { name: 'Non-Alcoholic', emoji: '💧' },
  { name: 'Music Lover', emoji: '🎵' },
  { name: 'Non Smoker', emoji: '🚭' },
];
