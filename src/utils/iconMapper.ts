import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export function getIconForCategory(name: string): IconName {
  const lowercaseName = name.toLowerCase();

  // Dictionary mapping keywords to Ionicons
  const iconMap: Record<string, IconName> = {
    // Work / Education
    code: 'code-slash',
    program: 'code-slash',
    dev: 'code-slash',
    design: 'color-palette',
    study: 'book',
    read: 'book',
    school: 'school',
    college: 'school',
    university: 'school',
    work: 'briefcase',
    office: 'business',
    write: 'pencil',

    // Entertainment / Leisure
    netflix: 'play',
    movie: 'film',
    watch: 'tv',
    game: 'game-controller',
    play: 'game-controller',
    music: 'musical-notes',

    // Health / Fitness
    workout: 'barbell',
    gym: 'barbell',
    run: 'walk',
    walk: 'walk',
    football: 'football',
    soccer: 'football',
    cricket: 'baseball',
    basketball: 'basketball',
    tennis: 'tennisball',
    swim: 'water',
    fitness: 'fitness',
    health: 'medkit',
    sleep: 'moon',
    meditate: 'leaf',

    // Travel / Commute
    travel: 'airplane',
    flight: 'airplane',
    drive: 'car',
    car: 'car',
    commute: 'train',
    bus: 'bus',
    bike: 'bicycle',

    // Social / Life
    eat: 'restaurant',
    food: 'restaurant',
    cook: 'restaurant',
    shop: 'cart',
    buy: 'cart',
    friend: 'people',
    family: 'home',
    house: 'home',
    clean: 'trash-bin',
  };

  // Check if any keyword exists in the entered name
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (lowercaseName.includes(keyword)) {
      return icon;
    }
  }

  // Default fallback icons if no match is found
  const defaultIcons: IconName[] = ['list', 'cube', 'apps', 'grid', 'star', 'albums'];
  const randomIndex = Math.floor(Math.random() * defaultIcons.length);
  return defaultIcons[randomIndex];
}
