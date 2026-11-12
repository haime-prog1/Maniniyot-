import type { Angle, Movement, Phase, Shot, Style, TripType } from '../types';

const ALL_STYLES: Style[] = ['cinematic', 'vlog', 'aesthetic', 'funny', 'couple', 'barkada'];
const ALL_TRIPS: TripType[] = ['flight', 'roadtrip', 'ferry', 'staycation'];
const TRAVEL: TripType[] = ['flight', 'roadtrip', 'ferry'];

type Row = [
  id: string,
  phase: Phase,
  title: string,
  description: string,
  duration: [number, number],
  angle: Angle,
  movement: Movement,
  tip: string,
  transition: string | undefined,
  styles: Style[] | 'all',
  trips: TripType[] | 'all',
];

const toShot = (r: Row, destinationSpecific?: string, gear?: 'action'): Shot => ({
  gear,
  id: r[0],
  phase: r[1],
  title: r[2],
  description: r[3],
  durationSec: r[4],
  angle: r[5],
  movement: r[6],
  tip: r[7],
  transition: r[8],
  styles: r[9] === 'all' ? ALL_STYLES : r[9],
  tripTypes: r[10] === 'all' ? ALL_TRIPS : r[10],
  destinationSpecific,
});

const C = 'cinematic', V = 'vlog', A = 'aesthetic', F = 'funny', CP = 'couple', B = 'barkada';

/** Generic shots. Tokens: {destination}, {airportName}, {portName}, {landmark}. */
const GENERIC: Row[] = [
  // Departure
  ['g-flatlay', 'departure', 'Packing flat lay', 'Lay out your outfits, sunnies, passport and camera on the bed and film from directly above.', [2, 3], 'Overhead', 'Static', 'Use a plain white sheet as the background so the colours pop.', 'Hand cover', 'all', 'all'],
  ['g-zip', 'departure', 'Zipping the bag', 'Tight shot of the luggage zipper closing. The sound makes a great first beat.', [1, 2], 'Close-up', 'Static', 'Record the sound too. It works as a natural cut point in the edit.', 'Match cut', [C, A, V], 'all'],
  ['g-door', 'departure', 'Leaving the house', 'POV opening the front door and stepping out with your bag.', [2, 3], 'POV', 'Walk-forward', 'Hold the phone at chest height and walk slowly to keep it smooth.', 'Whip pan', 'all', TRAVEL],
  ['g-terminal', 'departure', 'Walking into the terminal', 'Rolling your luggage into the departure terminal, filmed from behind at knee height.', [2, 3], 'Low angle', 'Walk-forward', 'Low angles make ordinary walks look cinematic.', undefined, 'all', ['flight']],
  ['g-pass', 'departure', 'Boarding pass and passport', 'Hand holding the boarding pass and passport against the departure board.', [1, 2], 'Close-up', 'Static', 'Focus on the pass, and let the board blur behind it.', 'Rack focus', [C, A, CP], ['flight']],
  ['g-intro', 'departure', 'Squad intro', 'Everyone says hi to the camera one by one before leaving.', [2, 4], 'Medium', 'Pan', 'Pan quickly between faces. Energy matters more than framing.', 'Whip pan', [V, F, B], 'all'],
  ['g-trunk', 'departure', 'Loading the car', 'Bags going into the trunk and the trunk closing.', [2, 3], 'Overhead', 'Static', 'Prop the phone on the car roof for a stable top-down shot.', 'Hand cover', 'all', ['roadtrip']],
  ['g-ticket', 'departure', 'Ferry ticket', 'Close-up of the ferry ticket with the terminal behind it.', [1, 2], 'Close-up', 'Static', 'Shoot near a window for soft side light.', undefined, 'all', ['ferry']],
  ['g-checkin', 'departure', 'Hotel check-in', 'Key card being handed over at the front desk.', [1, 2], 'Close-up', 'Static', 'Ask before filming staff, or keep the frame on hands only.', 'Match cut', 'all', ['staycation']],
  // In transit
  ['g-board', 'transit', 'Boarding the plane', 'POV walking up the stairs or through the jet bridge onto the plane.', [2, 3], 'POV', 'Walk-forward', 'Turn on Action Mode or stabilisation. Stairs are bumpy.', undefined, 'all', ['flight']],
  ['g-takeoff', 'transit', 'Window seat takeoff', 'Through the airplane window during takeoff or above the clouds.', [3, 4], 'Close-up', 'Static', 'Press the phone lens against the glass to kill reflections.', 'Fade to white', 'all', ['flight']],
  ['g-clouds', 'transit', 'Above the clouds', 'Slow pan across the clouds with the wing in the frame.', [3, 5], 'Wide', 'Pan', 'Shoot in 4K 60fps so you can slow it down later.', undefined, [C, A, CP], ['flight']],
  ['g-snack', 'transit', 'In-flight snack moment', 'Someone excitedly opening the plane snack, or asleep with mouth open.', [2, 3], 'Medium', 'Static', 'Candid is funnier. Don\'t warn them.', undefined, [F, B, V], ['flight']],
  ['g-road', 'transit', 'Road ahead hyperlapse', 'Phone on the dashboard filming the road for a few minutes.', [3, 4], 'Wide', 'Hyperlapse', 'Use the Time-lapse mode and a dashboard mount.', 'Speed ramp', 'all', ['roadtrip']],
  ['g-hand', 'transit', 'Hand out the window', 'Hand surfing the wind out the car window.', [2, 3], 'Close-up', 'Slow-mo', 'Golden hour plus slow-mo looks amazing.', undefined, [C, A, CP], ['roadtrip']],
  ['g-sing', 'transit', 'Road trip singalong', 'The whole car singing to the song you\'ll use in the Reel.', [3, 4], 'Medium', 'Static', 'Play the actual Reel song so the lip-sync matches later.', undefined, [F, B, V, CP], ['roadtrip']],
  ['g-wake', 'transit', 'Boat wake splash', 'Water splashing off the side of the boat.', [2, 3], 'Close-up', 'Slow-mo', 'Shoot 120fps slo-mo. Keep the phone strapped. Spray is real.', 'Whip pan', 'all', ['ferry']],
  ['g-hair', 'transit', 'Wind in your hair', 'Medium shot of someone at the boat railing, hair blowing, island in the distance.', [2, 3], 'Medium', 'Slow-mo', 'Put the sun behind the subject for a glowing rim light.', undefined, [C, A, CP], ['ferry']],
  ['g-lobby', 'transit', 'Lobby walk-through', 'Walking through the hotel lobby toward the elevator.', [2, 3], 'POV', 'Walk-forward', 'Symmetry is your friend. Walk down the centre.', undefined, 'all', ['staycation']],
  // Arrival
  ['g-airport', 'arrival', 'Getting off the plane at {airportName}', 'Walking off the plane or out of arrivals with the "{airportName}" sign clearly visible.', [2, 3], 'Low angle', 'Tilt', 'Start on your feet and tilt up to reveal the airport sign.', 'Whip pan', 'all', ['flight']],
  ['g-port', 'arrival', 'Docking at {portName}', 'The boat pulling into {portName}, with the port sign or crowd in frame.', [2, 3], 'Wide', 'Static', 'Stand near the front to capture the arrival.', undefined, 'all', ['ferry']],
  ['g-sign', 'arrival', 'Welcome to {destination}', 'A road sign, arch or landmark that says you\'re in {destination}.', [1, 2], 'Close-up', 'Static', 'Start out of focus, then tap to focus on the sign.', 'Rack focus', [C, A, V], ['roadtrip', 'ferry', 'flight']],
  ['g-feet', 'arrival', 'First steps', 'Close-up of your feet touching the ground, sand or dock for the first time.', [1, 2], 'Close-up', 'Slow-mo', 'Hold the phone just above the ground and slow it down.', 'Match cut', 'all', 'all'],
  ['g-reaction', 'arrival', 'First reaction', 'Your genuine reaction to the first view.', [2, 3], 'Medium', 'Static', 'Ask a friend to film you before you know it\'s rolling.', undefined, [V, F, B, CP], 'all'],
  // Accommodation
  ['g-roomdoor', 'accommodation', 'Room door reveal', 'POV opening the door to your room and walking in.', [2, 4], 'POV', 'Walk-forward', 'Open the curtains first so the room is bright when you enter.', 'Door wipe', 'all', 'all'],
  ['g-bedjump', 'accommodation', 'Bed jump', 'Everyone jumping onto the bed at the same time.', [1, 2], 'Medium', 'Slow-mo', 'Count down so everyone jumps together.', undefined, [F, B, V], 'all'],
  ['g-curtain', 'accommodation', 'Curtain reveal', 'Pulling the curtains open to reveal the view.', [2, 3], 'Wide', 'Walk-forward', 'Expose for the outside, and let the room go dark for drama.', 'Light leak', [C, A, CP], 'all'],
  ['g-details', 'accommodation', 'Room details', 'Close-ups of textures: towels folded into swans, the coffee setup, the view.', [1, 2], 'Close-up', 'Pan', 'Three quick close-ups make a great beat sequence.', undefined, [A, C], 'all'],
  ['g-pool', 'accommodation', 'Pool float from above', 'Someone floating in the pool, filmed from directly above.', [2, 3], 'Overhead', 'Static', 'Shoot from a balcony or ask the hotel for a higher floor.', undefined, [A, CP, C], 'all'],
  // Activities
  ['g-reveal', 'activities', 'Landmark reveal at {landmark}', 'Walk out from behind a tree, wall or rock to reveal {landmark}.', [3, 4], 'Wide', 'Walk-forward', 'Start with the foreground blocking the lens, then step to the side.', 'Object wipe', 'all', 'all'],
  ['g-follow', 'activities', 'Follow-me shot', 'Following your subject from behind as they walk into the scene.', [2, 3], 'Medium', 'Walk-forward', 'Keep the subject on a third line, not dead centre.', undefined, 'all', 'all'],
  ['g-orbit', 'activities', 'Orbit at {landmark}', 'Circle around the subject with {landmark} behind them.', [3, 4], 'Medium', 'Orbit', 'Keep the subject the same size in frame as you walk around.', 'Whip pan', [C, CP, A], 'all'],
  ['g-jump', 'activities', 'Group jump', 'The whole group jumping at once with the scenery behind.', [1, 2], 'Wide', 'Slow-mo', 'Shoot from a low angle so the jump looks higher.', undefined, [B, F, CP], 'all'],
  ['g-action', 'activities', 'Action POV', 'POV of the main activity: snorkelling, surfing, ziplining or hiking.', [3, 5], 'POV', 'Walk-forward', 'Use a waterproof pouch or case near water.', undefined, 'all', 'all'],
  ['g-hands', 'activities', 'Hand-in-hand lead', 'POV being led by the hand toward the view.', [2, 3], 'POV', 'Walk-forward', 'Shoot over the shoulder of the person holding the camera.', undefined, [CP], 'all'],
  ['g-laugh', 'activities', 'Candid laughs', 'Close-up of real laughter between shots.', [1, 2], 'Close-up', 'Static', 'Keep recording after the "real" shot ends. That\'s where the gold is.', undefined, 'all', 'all'],
  ['g-blooper', 'activities', 'Blooper', 'A fail, a fall or a wave hitting someone at the worst time.', [2, 3], 'Medium', 'Static', 'Leave the camera rolling during group shots.', undefined, [F, B, V], 'all'],
  // Food
  ['g-spread', 'food', 'Table spread from above', 'All the dishes on the table, filmed from directly above.', [2, 3], 'Overhead', 'Static', 'Stand on a chair (safely!) and keep the phone parallel to the table.', 'Hand cover', 'all', 'all'],
  ['g-pour', 'food', 'Slow-mo pour', 'A drink, sauce or cheese pull in slow motion.', [2, 3], 'Close-up', 'Slow-mo', 'Backlight the liquid with a window behind it.', undefined, [C, A, V], 'all'],
  ['g-bite', 'food', 'First bite reaction', 'Close-up of the first bite and the reaction.', [2, 3], 'Close-up', 'Static', 'An honest reaction beats a fake "mmm".', undefined, [V, F, B, CP], 'all'],
  ['g-cheers', 'food', 'Cheers!', 'Glasses or coconuts clinking together.', [1, 2], 'Close-up', 'Slow-mo', 'Line up the clink with a beat in your song.', 'Match cut', [CP, B, C], 'all'],
  ['g-market', 'food', 'Local food walk', 'POV walking past food stalls, local snacks and vendors.', [3, 4], 'POV', 'Walk-forward', 'Ask vendors before filming them up close.', undefined, [V, C, A], 'all'],
  // Golden hour / sunset
  ['g-silhouette', 'golden', 'Silhouette at sunset', 'A person in full silhouette against the setting sun.', [3, 4], 'Wide', 'Static', 'Tap and hold on the sky to lock exposure, so the subject goes dark.', 'Fade', 'all', 'all'],
  ['g-flare', 'golden', 'Sun flare through fingers', 'Sun peeking through fingers, a glass or palm leaves.', [2, 3], 'Close-up', 'Pan', 'Move slowly so the flare dances across the lens.', 'Light leak', [A, C, CP], 'all'],
  ['g-timelapse', 'golden', 'Sunset time-lapse', 'The sun sinking into the horizon as a time-lapse.', [3, 5], 'Wide', 'Hyperlapse', 'Start 20 minutes before sunset and don\'t touch the phone.', undefined, [C, A], 'all'],
  ['g-goldenwalk', 'golden', 'Golden-hour walk', 'Slow-motion walk with the warm light behind your subject.', [2, 3], 'Medium', 'Slow-mo', 'Walk toward the sun for glowing hair and edges.', undefined, 'all', 'all'],
  // Night
  ['g-lights', 'night', 'Night lights pan', 'Slow pan across the lights, the beach bars or the city skyline.', [3, 4], 'Wide', 'Pan', 'Brace your arms on a railing. Low light blurs easily.', undefined, 'all', 'all'],
  ['g-bokeh', 'night', 'Bokeh drinks', 'Close-up of a drink with blurry lights behind it.', [2, 3], 'Close-up', 'Static', 'Use Portrait or Cinematic mode for creamy bokeh.', undefined, [A, C, CP], 'all'],
  ['g-dance', 'night', 'Dance clip', 'The group dancing or vibing to music.', [2, 4], 'Medium', 'Orbit', 'Turn on the flash or a phone light for party energy.', 'Spin transition', [B, F, V], 'all'],
  ['g-chika', 'night', 'Late-night chika', 'Late-night snacks and stories back at the room.', [2, 3], 'Medium', 'Static', 'Warm lamp light only. Turn off the harsh ceiling light.', undefined, [B, F, CP, V], 'all'],
  // Going home
  ['g-packup', 'home', 'Packing up', 'POV packing the bag one last time, maybe with sand still on things.', [2, 3], 'POV', 'Static', 'Mirror the opening packing shot for a satisfying bookend.', 'Match cut', 'all', 'all'],
  ['g-lastwindow', 'home', 'Last window view', 'Looking out of the plane, car or boat window as {destination} gets smaller.', [3, 4], 'Close-up', 'Static', 'Mirror your opening window shot for a full-circle ending.', 'Fade', [C, A, CP], TRAVEL],
  ['g-dump', 'home', 'Trip recap dump', 'Receipts, tickets, shells and souvenirs laid out on a table.', [2, 3], 'Overhead', 'Static', 'Each item can be a quick one-beat cut.', undefined, [F, V, B], 'all'],
  ['g-ending', 'home', 'Goodbye {destination}', 'Walking away from the camera, then a slow zoom out on {destination}.', [3, 5], 'Wide', 'Walk-forward', 'End on a held shot for at least 2 seconds so the Reel loops nicely.', 'Fade to black', 'all', 'all'],
];

/** Destination-specific shots. */
const SPECIFIC: Record<string, Row[]> = {
  boracay: [
    ['bor-jetty', 'transit', 'Boat ride from {portName}', 'Board the outrigger boat at Caticlan Jetty Port and film the turquoise water as Boracay gets closer.', [3, 4], 'Wide', 'Slow-mo', 'Sit near the front and shoot 120fps so the splashes look dreamy.', 'Whip pan', 'all', ['flight', 'ferry']],
    ['bor-white', 'arrival', 'First look at White Beach', 'Walk through the path from the road and reveal White Beach\'s powdery sand and turquoise water.', [3, 4], 'Wide', 'Tilt', 'Start pointing at the sand, then tilt up slowly to reveal the sea.', 'Object wipe', 'all', 'all'],
    ['bor-stations', 'activities', 'Station 1 → 2 → 3 walk', 'Hyperlapse the shoreline walk from Station 1 to Station 3 along White Beach.', [3, 4], 'Wide', 'Hyperlapse', 'Walk at the water line with the hyperlapse running. Keep the horizon level.', 'Speed ramp', 'all', 'all'],
    ['bor-puka', 'activities', 'Puka Shell Beach', 'Close-up of shells in the sand and waves rushing in at Puka Shell Beach.', [2, 3], 'Low angle', 'Slow-mo', 'Put the phone near the sand and let a wave roll toward it (carefully!).', undefined, 'all', 'all'],
    ['bor-willys', 'activities', "Willy's Rock", "Wide shot of Willy's Rock and its Virgin Mary grotto, ideally at low tide.", [2, 3], 'Wide', 'Static', 'Go early in the morning to avoid the crowds.', undefined, 'all', 'all'],
    ['bor-luho', 'activities', 'Mt. Luho viewpoint', 'Panorama of the whole island from Mt. Luho, the highest point in Boracay.', [3, 5], 'Wide', 'Pan', 'Pan slowly, about 10 seconds for a full sweep, and trim it later.', 'Whip pan', 'all', 'all'],
    ['bor-hopping', 'activities', 'Island hopping', 'POV jumping off the boat into the clear water during island hopping (Crystal Cove, Crocodile Island).', [3, 4], 'POV', 'Slow-mo', 'Use a waterproof pouch and start recording before you jump.', undefined, 'all', 'all'],
    ['bor-paraw', 'golden', 'Paraw sailing at sunset', 'The silhouette of a paraw sailboat against the Boracay sunset. Even better: film from on board.', [3, 5], 'Wide', 'Slow-mo', 'Book the 5:30 PM paraw ride, which is peak golden hour.', 'Fade', 'all', 'all'],
    ['bor-dmall', 'food', "D'Mall food crawl", "POV walking through D'Mall: shakes, chori burgers and calamansi muffins.", [3, 4], 'POV', 'Walk-forward', 'Get a close-up of the mango shake being handed to you.', undefined, 'all', 'all'],
    ['bor-fire', 'night', 'Fire dancers on White Beach', 'The fire dancers spinning flames on the beach at night.', [3, 4], 'Wide', 'Slow-mo', 'Lock exposure on the flames (tap and hold) so they don\'t blow out.', 'Flash cut', 'all', 'all'],
  ],
  siargao: [
    ['sia-palms', 'activities', 'Coconut Palm Road ride', 'POV on a scooter or habal-habal down the famous palm-lined road.', [3, 4], 'POV', 'Walk-forward', 'Mount the phone or have the passenger film over the driver\'s shoulder.', undefined, 'all', 'all'],
    ['sia-cloud9', 'golden', 'Cloud 9 Boardwalk sunset', 'Surfers paddling out at Cloud 9, filmed from the boardwalk at sunset.', [3, 4], 'Wide', 'Static', 'Zoom 2x to compress the waves and the surfers.', 'Fade', 'all', 'all'],
  ],
  elnido: [
    ['eln-lagoon', 'activities', 'Kayak into Big Lagoon', 'POV paddling a kayak through the limestone walls into Big Lagoon.', [3, 5], 'POV', 'Walk-forward', 'Film the paddle dipping into the water in the frame.', undefined, 'all', 'all'],
    ['eln-cabanas', 'golden', 'Las Cabanas sunset', 'The sunset at Las Cabanas Beach, ideally from the zipline.', [3, 4], 'Wide', 'Pan', 'Arrive 30 minutes early to get a spot on the sand.', 'Fade', 'all', 'all'],
  ],
  baguio: [
    ['bag-zigzag', 'transit', 'Zigzag road up to Baguio', 'Hyperlapse up Kennon Road or Marcos Highway through the pine trees.', [3, 4], 'Wide', 'Hyperlapse', 'Clean the windshield first. The fog is atmosphere enough.', 'Speed ramp', 'all', ['roadtrip']],
    ['bag-strawberry', 'activities', 'Strawberry picking', 'Close-up of hands picking strawberries at the La Trinidad farm.', [2, 3], 'Close-up', 'Static', 'Go early in the morning when the berries are dewy.', undefined, 'all', 'all'],
  ],
  bohol: [
    ['boh-hills', 'activities', 'Chocolate Hills viewpoint', 'A slow pan across the Chocolate Hills from the viewing deck.', [3, 5], 'Wide', 'Pan', 'In the dry season (March to May) the hills are at their most "chocolate".', undefined, 'all', 'all'],
    ['boh-loboc', 'food', 'Loboc River lunch cruise', 'Buffet lunch floating down the green Loboc River.', [3, 4], 'Medium', 'Pan', 'Film the river first, then pan to the food.', undefined, 'all', 'all'],
  ],
  coron: [
    ['cor-kayangan', 'activities', 'Kayangan Lake viewpoint', 'The famous lagoon view from the Kayangan Lake viewpoint.', [3, 4], 'Wide', 'Static', 'Get there before the tour boats arrive.', undefined, 'all', 'all'],
    ['cor-tapyas', 'golden', 'Mt. Tapyas sunset', 'The view over Coron town and the islands from Mt. Tapyas at sunset.', [3, 5], 'Wide', 'Hyperlapse', 'It\'s about 700 steps. Start the climb 45 minutes before sunset.', 'Fade', 'all', 'all'],
  ],
  japan: [
    ['jpn-shibuya', 'night', 'Shibuya Crossing', 'A high-angle hyperlapse of the scramble crossing at night.', [3, 5], 'Wide', 'Hyperlapse', 'The Shibuya Sky deck or a café window over the crossing gives the best angle.', 'Speed ramp', 'all', 'all'],
    ['jpn-konbini', 'food', 'Konbini haul', 'Overhead shot of your 7-Eleven haul: onigiri, egg sandos, drinks.', [2, 3], 'Overhead', 'Static', 'Cut each item on a beat.', 'Hand cover', 'all', 'all'],
  ],
};

/** Bonus shots that need an action camera (waterproof, wide and mountable). */
const ACTION: Row[] = [
  ['a-flip', 'departure', 'Flip-screen intro', 'Flip the screen up, hold the camera at arm\'s length and say where you\'re going.', [2, 4], 'Medium', 'Static', 'Look at the lens, not at yourself on the screen.', 'Whip pan', [V, F, B, CP], 'all'],
  ['a-stick', 'arrival', 'Selfie-stick follow shot', 'Hold the selfie stick high and slightly behind you as you walk into {destination}, for a third-person view.', [3, 4], 'Wide', 'Walk-forward', 'Extend the stick fully and keep your arm still. The stabilisation does the rest.', undefined, 'all', 'all'],
  ['a-chest', 'activities', 'Chest-mount POV', 'Mount the camera on your chest for a hands-free POV of the main activity.', [3, 5], 'POV', 'Walk-forward', 'Tilt the camera up a little. Chest mounts tend to point at the ground.', undefined, 'all', 'all'],
  ['a-underwater', 'activities', 'Underwater shot', 'Dip the camera under the surface: fish, coral, or friends swimming past.', [3, 5], 'Wide', 'Slow-mo', 'It is waterproof to 12 m without a case. Lock the screen first, and rinse it in fresh water afterwards.', 'Water wipe', 'all', 'all'],
  ['a-plunge', 'activities', 'Jump-in plunge', 'Hold the camera and jump into the water, filming the splash from above to below the surface.', [2, 3], 'POV', 'Slow-mo', 'Use a floating hand grip or wrist strap so the camera cannot sink.', 'Water wipe', [F, B, CP, V, C], 'all'],
  ['a-timeshift', 'activities', 'TimeShift walk-through', 'Walk through a busy street, market or beach path with TimeShift running.', [3, 4], 'Wide', 'Hyperlapse', 'Walk at a steady pace and keep the camera pointed at one spot ahead.', 'Speed ramp', 'all', 'all'],
];

export const GENERIC_SHOTS: Shot[] = GENERIC.map((r) => toShot(r));
export const ACTION_SHOTS: Shot[] = ACTION.map((r) => toShot(r, undefined, 'action'));
export const DESTINATION_SHOTS: Shot[] = Object.entries(SPECIFIC).flatMap(([dest, rows]) =>
  rows.map((r) => toShot(r, dest)),
);
