import type { ListShot, ShotList } from '../types';

export type ScriptLang = 'taglish' | 'tagalog';

export const SCRIPT_LANGS: { value: ScriptLang; label: string }[] = [
  { value: 'taglish', label: 'Taglish' },
  { value: 'tagalog', label: 'Tagalog' },
];

type Line = Record<ScriptLang, string>;
const L = (taglish: string, tagalog: string = taglish): Line => ({ taglish, tagalog });

/** One short spoken line per shot, keyed by shot id. `{destination}` is filled in. */
const LINES: Record<string, Line> = {
  // Departure
  'g-flatlay': L('Packing day na! Next stop: {destination}.', 'Araw na ng pag-iimpake! Susunod na hinto: {destination}.'),
  'g-zip': L('Bag: closed. Excitement: sobra.', 'Sarado na ang bag. Sobra na ang pananabik.'),
  'g-door': L('Alis na tayo. Bye, bahay!', 'Aalis na tayo. Paalam muna, bahay!'),
  'g-terminal': L('Airport na. Ito na talaga \'to.', 'Nasa paliparan na. Totoo na talaga ito.'),
  'g-pass': L('Boarding pass, check. Tara na!', 'Hawak na ang boarding pass. Tara na!'),
  'g-intro': L('Kilalanin ang squad na kasama ko sa {destination}.', 'Kilalanin ang mga kasama ko papuntang {destination}.'),
  'g-trunk': L('Karga na lahat. Road trip na!', 'Naikarga na ang lahat. Biyahe na!'),
  'g-ticket': L('Ticket sa barko, hawak na.', 'Hawak na ang tiket sa barko.'),
  'g-checkin': L('Check-in muna bago ang chill.', 'Mag-check-in muna bago magpahinga.'),
  'a-flip': L('Hi guys! Papunta na kami sa {destination}.', 'Kumusta! Papunta na kami sa {destination}.'),
  // In transit
  'g-board': L('Boarding na. See you sa taas!', 'Sasakay na. Kita-kits sa itaas!'),
  'g-takeoff': L('And... lipad!', 'At... lumipad na tayo!'),
  'g-clouds': L('Ganito pala ka-peaceful sa taas.', 'Ganito pala katahimik sa itaas.'),
  'g-snack': L('Ang tunay na bida ng flight: ang snack.', 'Ang tunay na bida ng biyahe: ang meryenda.'),
  'g-road': L('Mahaba ang daan, pero sulit \'yan.', 'Mahaba ang daan, pero sulit iyan.'),
  'g-sing': L('Walang road trip kung walang kantahan.', 'Walang biyahe kung walang kantahan.'),
  'g-wake': L('Amoy dagat na!'),
  // Arrival
  'g-airport': L('Touchdown, {destination}!', 'Nakalapag na sa {destination}!'),
  'g-port': L('Daong na tayo. Ilang hakbang na lang.', 'Dumaong na tayo. Ilang hakbang na lang.'),
  'g-sign': L('Official na: nasa {destination} na tayo.', 'Opisyal na: nasa {destination} na tayo.'),
  'g-feet': L('First step. Hello, {destination}!', 'Unang hakbang. Kumusta, {destination}!'),
  'g-reaction': L('Grabe. Ang ganda pala talaga.', 'Grabe. Napakaganda pala talaga.'),
  'a-stick': L('Samahan n\'yo kami.', 'Samahan ninyo kami.'),
  // Accommodation
  'g-roomdoor': L('Room tour tayo, guys.', 'Silipin natin ang kuwarto.'),
  'g-bedjump': L('Rule number one: talon muna sa kama.', 'Unang patakaran: tumalon muna sa kama.'),
  'g-curtain': L('At ito ang view natin.', 'At ito ang tanawin natin.'),
  'g-pool': L('Pool muna bago lahat.', 'Langoy muna bago ang lahat.'),
  // Activities
  'g-reveal': L('Wait lang... ayan na!', 'Sandali lang... ayan na!'),
  'g-follow': L('Sunod lang kayo sa\'kin.', 'Sumunod lang kayo sa akin.'),
  'g-jump': L('One, two, three, talon!', 'Isa, dalawa, tatlo, talon!'),
  'g-action': L('Ito ang ipinunta natin dito.'),
  'g-blooper': L('Walang perfect na trip. Proof.', 'Walang perpektong biyahe. Ito ang patunay.'),
  'a-chest': L('Ganito ang view ko ngayon.', 'Ganito ang nakikita ko ngayon.'),
  'a-underwater': L('Silip tayo sa ilalim.'),
  'a-plunge': L('Three, two, one... talon!', 'Tatlo, dalawa, isa... talon!'),
  'a-timeshift': L('Lakad tayo, pero mabilisan.'),
  // Food
  'g-spread': L('Kainan na! Diet? Next week na \'yan.', 'Kainan na! Ang diyeta, sa susunod na linggo na.'),
  'g-bite': L('First bite... panalo.', 'Unang kagat... panalo.'),
  'g-cheers': L('Cheers sa bakasyon!', 'Tagay para sa bakasyon!'),
  'g-market': L('Food trip mode: on.', 'Oras na para tumikim ng pagkain dito.'),
  // Golden hour
  'g-silhouette': L('Walang filter. Ganyan talaga ang sunset dito.', 'Walang filter. Ganyan talaga ang paglubog ng araw dito.'),
  'g-timelapse': L('Sunset, pero fast forward.', 'Paglubog ng araw, pero pinabilis.'),
  'g-goldenwalk': L('Golden hour: libreng ganda para sa lahat.', 'Gintong oras: libreng ganda para sa lahat.'),
  // Night
  'g-lights': L('Gising pa ang {destination} sa gabi.'),
  'g-dance': L('Walang uuwi nang hindi sumasayaw.'),
  'g-chika': L('Late-night kuwentuhan, the best part.', 'Kuwentuhan sa hatinggabi, ang pinakamasarap na bahagi.'),
  // Going home
  'g-packup': L('Uwian na. Bakit ang bilis?'),
  'g-lastwindow': L('Bye muna, {destination}.', 'Paalam muna, {destination}.'),
  'g-dump': L('Mga resibo ng saya.'),
  'g-ending': L('Hanggang sa susunod, {destination}. Babalik kami!'),
  // Boracay
  'bor-jetty': L('Ilang minutong bangka na lang, Boracay na!'),
  'bor-white': L('Ito na ang White Beach. Parang pulbos ang buhangin!'),
  'bor-stations': L('Lakad tayo mula Station 1 hanggang Station 3.'),
  'bor-puka': L('Puka Beach: mas tahimik, mas raw.', 'Puka Beach: mas tahimik, mas natural.'),
  'bor-willys': L('Willy\'s Rock, isa sa pinaka-pinipicture-an sa Boracay.', 'Willy\'s Rock, isa sa pinakamadalas kunan ng larawan sa Boracay.'),
  'bor-luho': L('Akyat tayo sa Mt. Luho para sa 360 view.', 'Akyatin natin ang Mt. Luho para makita ang buong isla.'),
  'bor-hopping': L('Island hopping day! Sino\'ng unang tatalon?', 'Araw ng paglilibot sa mga isla! Sino ang unang tatalon?'),
  'bor-paraw': L('Paraw sailing sa sunset. Walang makina, hangin lang.', 'Sakay ng paraw sa paglubog ng araw. Walang makina, hangin lang.'),
  'bor-dmall': L('D\'Mall food crawl. Bawal umuwi nang gutom.', 'Kainan sa D\'Mall. Bawal umuwi nang gutom.'),
  'bor-fire': L('Fire dancers! \'Wag itong gagayahin sa bahay.', 'Mga mananayaw ng apoy! Huwag itong gagayahin sa bahay.'),
};

/** Short facts to drop into the vlog, keyed by destination id, then shot id. */
const FACTS: Record<string, Record<string, Line>> = {
  boracay: {
    'g-airport': L(
      'Ang airport ay ipinangalan kay Godofredo P. Ramos, na tinawag na "Father of Aklan".',
      'Ipinangalan ang paliparan kay Godofredo P. Ramos, na tinaguriang "Ama ng Aklan".',
    ),
    'bor-jetty': L(
      'Mga 7 kilometers lang ang haba ng Boracay. Maliit, pero world-famous.',
      'Mga 7 kilometro lang ang haba ng Boracay. Maliit, pero kilala sa buong mundo.',
    ),
    'g-feet': L(
      'Sabi ng ilan, galing ang "Boracay" sa salitang "borac" na ibig sabihin ay bulak, dahil sa puting buhangin.',
    ),
    'bor-white': L('Mga 4 kilometers ang haba ng White Beach.', 'Mga 4 na kilometro ang haba ng White Beach.'),
    'bor-stations': L(
      'Ang "Station" ay galing sa mga dating babaan ng bangka dito sa beach.',
      'Ang "Station" ay galing sa mga dating babaan ng bangka rito sa dalampasigan.',
    ),
    'bor-puka': L(
      'Ipinangalan ito sa puka shells. Sumikat ang puka shell necklace noong 1970s.',
      'Ipinangalan ito sa mga kabibeng puka. Sumikat ang kuwintas na puka noong dekada 70.',
    ),
    'bor-willys': L(
      'May grotto ng Birheng Maria sa ibabaw ng bato. Kapag low tide, puwede mo itong lakarin.',
      'May grotto ng Birheng Maria sa ibabaw ng bato. Kapag kati ang dagat, puwede mo itong lakarin.',
    ),
    'bor-luho': L(
      'Ito ang pinakamataas na bahagi ng isla, mga 100 meters above sea level.',
      'Ito ang pinakamataas na bahagi ng isla, mga 100 metro mula sa dagat.',
    ),
    'bor-hopping': L(
      'Bago pa dumating ang mga turista, ang mga Ati ang unang nanirahan sa Boracay.',
    ),
    'bor-paraw': L(
      'Ang paraw ay traditional na bangka ng Visayas na may dalawang katig.',
      'Ang paraw ay tradisyonal na bangka ng Visayas na may dalawang katig.',
    ),
    'g-silhouette': L(
      'Bawal uminom at manigarilyo sa mismong beach. Sunset na lang ang lalanghapin mo.',
      'Bawal uminom at manigarilyo sa mismong dalampasigan. Ang paglubog ng araw na lang ang lalanghapin mo.',
    ),
    'bor-fire': L(
      'Ang poi, \'yung pinaiikot na apoy, ay galing sa mga Māori ng New Zealand.',
      'Ang poi, iyong pinaiikot na apoy, ay galing sa mga Māori ng New Zealand.',
    ),
    'g-ending': L(
      'Noong 2018, isinara ang Boracay nang anim na buwan para linisin. Kaya ingatan natin.',
    ),
  },
};

export interface ScriptEntry {
  shot: ListShot;
  number: number;
  line?: string;
  fact?: string;
}

/** Label shown before a fact, with its punctuation. */
export const factLabel = (lang: ScriptLang) => (lang === 'taglish' ? 'Fun fact:' : 'Alam mo ba?');

export function scriptFor(shot: Pick<ListShot, 'id'>, list: Pick<ShotList, 'destinationId' | 'destinationName'>, lang: ScriptLang) {
  const fill = (s?: string) => s?.replace(/\{destination\}/g, list.destinationName.replace(/\s*\(copy\)$/, ''));
  return {
    line: fill(LINES[shot.id]?.[lang]),
    fact: fill(FACTS[list.destinationId]?.[shot.id]?.[lang]),
  };
}

/** The whole vlog script for a trip, in shot order. Shots with nothing to say are left out. */
export function buildScript(list: ShotList, lang: ScriptLang): ScriptEntry[] {
  return list.shots
    .filter((s) => !s.skipped)
    .sort((a, b) => a.order - b.order)
    .map((shot, i) => ({ shot, number: i + 1, ...scriptFor(shot, list, lang) }))
    .filter((e) => e.line || e.fact);
}

export function scriptToText(list: ShotList, lang: ScriptLang) {
  const lines = [`Vlog script: ${list.destinationName} (${lang === 'taglish' ? 'Taglish' : 'Tagalog'})`, ''];
  for (const e of buildScript(list, lang)) {
    lines.push(`${e.number}. [${e.shot.title}]`);
    if (e.line) lines.push(`   "${e.line}"`);
    if (e.fact) lines.push(`   ${factLabel(lang)} ${e.fact}`);
  }
  return lines.join('\n');
}
