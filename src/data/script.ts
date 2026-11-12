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
  'g-hand': L('Chill lang, ramdam ang hangin.', 'Relaks lang, damang-dama ang hangin.'),
  'g-lobby': L('Welcome sa staycation natin.', 'Maligayang pagdating sa ating bakasyon dito sa siyudad.'),
  'g-wake': L('Amoy dagat na!'),
  'g-hair': L('Hangin sa mukha, dagat sa paligid.'),
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
  'g-details': L('Tingnan n\'yo ang mga detalye.', 'Tingnan ninyo ang mga detalye.'),
  'g-pool': L('Pool muna bago lahat.', 'Langoy muna bago ang lahat.'),
  // Activities
  'g-reveal': L('Wait lang... ayan na!', 'Sandali lang... ayan na!'),
  'g-follow': L('Sunod lang kayo sa\'kin.', 'Sumunod lang kayo sa akin.'),
  'g-orbit': L('Ikutin natin para kita ang lahat.'),
  'g-jump': L('One, two, three, talon!', 'Isa, dalawa, tatlo, talon!'),
  'g-action': L('Ito ang ipinunta natin dito.'),
  'g-hands': L('Tara, sama ka sa\'kin.', 'Tara, sumama ka sa akin.'),
  'g-laugh': L('Walang script dito, puro tawanan lang.', 'Walang iskrip dito, puro tawanan lang.'),
  'g-blooper': L('Walang perfect na trip. Proof.', 'Walang perpektong biyahe. Ito ang patunay.'),
  'a-chest': L('Ganito ang view ko ngayon.', 'Ganito ang nakikita ko ngayon.'),
  'a-underwater': L('Silip tayo sa ilalim.'),
  'a-plunge': L('Three, two, one... talon!', 'Tatlo, dalawa, isa... talon!'),
  'a-timeshift': L('Lakad tayo, pero mabilisan.'),
  // Food
  'g-spread': L('Kainan na! Diet? Next week na \'yan.', 'Kainan na! Ang diyeta, sa susunod na linggo na.'),
  'g-bite': L('First bite... panalo.', 'Unang kagat... panalo.'),
  'g-pour': L('Pampalamig muna.'),
  'g-cheers': L('Cheers sa bakasyon!', 'Tagay para sa bakasyon!'),
  'g-market': L('Food trip mode: on.', 'Oras na para tumikim ng pagkain dito.'),
  // Golden hour
  'g-silhouette': L('Walang filter. Ganyan talaga ang sunset dito.', 'Walang filter. Ganyan talaga ang paglubog ng araw dito.'),
  'g-timelapse': L('Sunset, pero fast forward.', 'Paglubog ng araw, pero pinabilis.'),
  'g-flare': L('Golden hour na!', 'Gintong oras na!'),
  'g-goldenwalk': L('Golden hour: libreng ganda para sa lahat.', 'Gintong oras: libreng ganda para sa lahat.'),
  // Night
  'g-lights': L('Gising pa ang {destination} sa gabi.'),
  'g-dance': L('Walang uuwi nang hindi sumasayaw.'),
  'g-bokeh': L('Cheers sa gabing \'to.', 'Tagay para sa gabing ito.'),
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
/**
 * Extra sentences added after each line in "Mahaba" (long) mode. They describe
 * what's on screen and set up the next shot, and add no new factual claims.
 */
const MORE: Record<string, Line> = {
  // Departure
  'g-flatlay': L(
    'Konting outfit check muna: shades, swimwear, sunblock, passport. Kumpleto na ba? Mukhang ready na tayo.',
    'Silipin muna natin ang mga dadalhin: salamin, pangligo, sunblock, pasaporte. Kumpleto na ba? Mukhang handa na tayo.',
  ),
  'g-zip': L(
    'Sana lang hindi na ako bumalik dahil may nakalimutan. Every trip, may naiiwan talaga, \'di ba?',
    'Sana lang hindi na ako bumalik dahil may nakalimutan. Sa bawat biyahe, may naiiwan talaga, hindi ba?',
  ),
  'g-door': L(
    'Last look sa bahay bago umalis. Ilang araw kang mami-miss, pero may dagat na naghihintay.',
    'Huling sulyap sa bahay bago umalis. Ilang araw kitang mami-miss, pero may dagat na naghihintay.',
  ),
  'g-terminal': L(
    'Maaga kami dito para walang stress. Check-in, kape, tapos hintay na lang sa gate.',
    'Maaga kami rito para walang alalahanin. Mag-check-in, magkape, tapos hihintayin na lang ang tawag sa gate.',
  ),
  'g-pass': L(
    'Ilang buwan naming pinlano \'to, at ngayon totoo na. Wala nang atrasan.',
    'Ilang buwan naming pinlano ito, at ngayon totoo na. Wala nang atrasan.',
  ),
  'g-intro': L(
    'Sila ang magiging kasama ko sa lahat ng kalokohan at kuwentuhan. Kung may mangyari, sila ang may kasalanan.',
    'Sila ang makakasama ko sa lahat ng kalokohan at kuwentuhan. Kung may mangyari, sila ang may kasalanan.',
  ),
  'g-trunk': L(
    'Playlist ready, snacks ready, gas full. Ilang oras na biyahe, pero sulit pag nakarating.',
    'Handa na ang mga kanta, ang baon at ang gasolina. Ilang oras na biyahe, pero sulit kapag nakarating.',
  ),
  'g-ticket': L(
    'Sakay na tayo at hayaan ang dagat ang magdala sa atin.',
    'Sumakay na tayo at hayaan nating ang dagat ang magdala sa atin.',
  ),
  'g-checkin': L(
    'Ilang araw ng pahinga, walang trabaho, walang email. Deserve natin \'to.',
    'Ilang araw ng pahinga, walang trabaho, walang email. Karapat-dapat natin ito.',
  ),
  'a-flip': L(
    'Isasama ko kayo sa buong trip, mula biyahe hanggang uwian. Kaya stay tuned, at sana ma-enjoy n\'yo.',
    'Isasama ko kayo sa buong biyahe, mula pag-alis hanggang pag-uwi. Kaya manatili kayo, at sana masiyahan kayo.',
  ),
  // In transit
  'g-board': L(
    'Window seat, syempre. Dito ang best view pag nasa itaas na tayo.',
    'Sa tabi ng bintana, siyempre. Dito ang pinakamagandang tanawin kapag nasa itaas na tayo.',
  ),
  'g-takeoff': L(
    'Paalam muna sa lungsod. Ilang oras na lang, ibang mundo na.',
    'Paalam muna sa lungsod. Ilang oras na lang, ibang mundo na.',
  ),
  'g-clouds': L(
    'Walang signal, walang notifications. Ulap lang at ang excitement sa pupuntahan natin.',
    'Walang signal, walang abiso. Ulap lang at ang pananabik sa pupuntahan natin.',
  ),
  'g-snack': L(
    'Maliit lang, pero \'pag nasa eroplano ka, parang five-star meal na \'to.',
    'Maliit lang, pero kapag nasa eroplano ka, parang handaan na ito.',
  ),
  'g-road': L(
    'Bawat liko, mas lumalapit tayo. Habang nasa daan, tingnan n\'yo ang view sa labas.',
    'Bawat liko, mas lumalapit tayo. Habang nasa daan, tingnan ninyo ang tanawin sa labas.',
  ),
  'g-sing': L(
    'Walang tono, walang pakialam. Basta masaya ang lahat.',
    'Walang tono, walang pakialam. Basta masaya ang lahat.',
  ),
  'g-hand': L(
    'Walang pakialam sa traffic. Ang importante, kasama ang mga mahal mo.',
    'Walang pakialam sa trapiko. Ang mahalaga, kasama ang mga mahal mo.',
  ),
  'g-lobby': L(
    'Hindi kailangang lumayo para magpahinga. Minsan, isang gabi lang sa magandang hotel, okay na.',
    'Hindi kailangang lumayo para magpahinga. Minsan, isang gabi lang sa magandang hotel, sapat na.',
  ),
  'g-wake': L(
    'Ramdam n\'yo ba ang hangin? Ito na ang simula ng island life.',
    'Ramdam ba ninyo ang hangin? Ito na ang simula ng buhay sa isla.',
  ),
  'g-hair': L(
    'Wala nang pakialam sa buhok. Hangin, araw at dagat lang muna.',
    'Wala nang pakialam sa buhok. Hangin, araw at dagat muna.',
  ),
  // Arrival
  'g-airport': L(
    'Ramdam agad ang init at ang hangin ng probinsya. Konting byahe pa, at nandiyan na ang beach.',
    'Ramdam agad ang init at ang hangin ng probinsya. Kaunting biyahe pa, at nariyan na ang dalampasigan.',
  ),
  'g-port': L(
    'Konting lakad na lang. Hawakan nang mabuti ang mga gamit.',
    'Kaunting lakad na lang. Hawakan nang mabuti ang mga gamit.',
  ),
  'g-sign': L(
    'Matagal kong pinangarap \'to, at ngayon nandito na talaga ako.',
    'Matagal ko itong pinangarap, at ngayon narito na talaga ako.',
  ),
  'g-feet': L(
    'Ramdam n\'yo ba \'yung buhangin? Ito \'yung moment na alam mong nagsimula na ang bakasyon.',
    'Ramdam ba ninyo ang buhangin? Ito ang sandaling alam mong nagsimula na ang bakasyon.',
  ),
  'g-reaction': L(
    'Iba pala talaga pag nakita mo sa personal. Walang picture na makakapantay dito.',
    'Iba pala talaga kapag nakita mo nang personal. Walang larawang makapapantay rito.',
  ),
  'a-stick': L(
    'Tara, ikutin natin ang lugar at hanapin ang best spots para sa\'yo.',
    'Tara, libutin natin ang lugar at hanapin ang pinakamagagandang puwesto para sa inyo.',
  ),
  // Accommodation
  'g-roomdoor': L(
    'Dito kami magpapahinga sa mga susunod na araw. Malinis, maaliwalas, at malapit sa beach.',
    'Dito kami magpapahinga sa mga susunod na araw. Malinis, maaliwalas, at malapit sa dalampasigan.',
  ),
  'g-bedjump': L(
    'Walang adulting dito. Bakasyon mode na tayo.',
    'Walang seryosohan dito. Bakasyon na tayo.',
  ),
  'g-curtain': L(
    'Isipin n\'yo, ganito ang gigisingin mo tuwing umaga. Sulit na sulit.',
    'Isipin ninyo, ganito ang bubungad sa iyo tuwing umaga. Sulit na sulit.',
  ),
  'g-details': L(
    'Maliliit na detalye, pero sila ang nagpapaganda sa stay.',
    'Maliliit na detalye, pero sila ang nagpapaganda sa pananatili.',
  ),
  'g-pool': L(
    'Float muna, isip mamaya. Ganito pala ang tunay na pahinga.',
    'Lumutang muna, mag-isip mamaya. Ganito pala ang tunay na pahinga.',
  ),
  // Activities
  'g-reveal': L(
    'Ito ang isa sa pinakaaabangan ko sa trip na \'to. Mas maganda pa siya sa personal.',
    'Ito ang isa sa pinakaaabangan ko sa biyaheng ito. Mas maganda pa ito nang personal.',
  ),
  'g-follow': L(
    'May ipapakita ako sa inyo na sigurado akong magugustuhan n\'yo.',
    'May ipapakita ako sa inyo na sigurado akong magugustuhan ninyo.',
  ),
  'g-orbit': L(
    'Sayang kung hindi mo i-enjoy ang bawat anggulo ng lugar na \'to.',
    'Sayang kung hindi mo masisilayan ang bawat anggulo ng lugar na ito.',
  ),
  'g-jump': L(
    'Kailangan perfect ang timing. Ilang take kaya bago namin makuha?',
    'Kailangang tama ang tiyempo. Ilang ulit kaya bago namin makuha?',
  ),
  'g-action': L(
    'Konting kaba, pero mas malaki ang excitement. Go na!',
    'Kaunting kaba, pero mas malaki ang pananabik. Tara na!',
  ),
  'g-hands': L(
    'May ipapakita ako sa\'yo. Pikit ka muna... ayan, dilat na.',
    'May ipapakita ako sa iyo. Pumikit ka muna... ayan, dumilat ka na.',
  ),
  'g-laugh': L(
    'Ito ang mga moment na hindi mo ma-plano, pero sila ang pinakamasaya.',
    'Ito ang mga sandaling hindi mo maplano, pero sila ang pinakamasaya.',
  ),
  'g-blooper': L(
    'Pero \'yan ang mga kuwentong pagtatawanan natin pag-uwi.',
    'Pero iyan ang mga kuwentong pagtatawanan natin pag-uwi.',
  ),
  'a-chest': L(
    'Para ramdam n\'yo na parang kasama ko kayo dito mismo.',
    'Para maramdaman ninyong parang kasama ko kayo rito mismo.',
  ),
  'a-underwater': L(
    'Ang linaw ng tubig! Isda, coral, at ang tahimik ng mundo sa ilalim.',
    'Ang linaw ng tubig! May isda, may korales, at ang tahimik ng mundo sa ilalim.',
  ),
  'a-plunge': L(
    'Malamig sa umpisa, pero sulit na sulit pagkatapos.',
    'Malamig sa umpisa, pero sulit na sulit pagkatapos.',
  ),
  'a-timeshift': L(
    'Ganito kabilis lumipas ang oras pag nag-eenjoy ka.',
    'Ganito kabilis lumipas ang oras kapag masaya ka.',
  ),
  // Food
  'g-spread': L(
    'Bawat ulam, may kuwento. Tikman natin isa-isa.',
    'Bawat ulam, may kuwento. Tikman natin isa-isa.',
  ),
  'g-pour': L(
    'Konting refresher muna bago ang susunod na adventure.',
    'Kaunting pampalamig muna bago ang susunod na pakikipagsapalaran.',
  ),
  'g-bite': L(
    'Sasabihin ko sa inyo nang totoo: babalikan ko \'to.',
    'Sasabihin ko sa inyo nang totoo: babalikan ko ito.',
  ),
  'g-cheers': L(
    'Para sa magandang samahan, sa masarap na pagkain, at sa mga susunod pang trip.',
    'Para sa magandang samahan, sa masarap na pagkain, at sa mga susunod pang biyahe.',
  ),
  'g-market': L(
    'Pinakamasarap talaga ang pagkain na binibili mismo sa mga lokal. Suportahan natin sila.',
    'Pinakamasarap talaga ang pagkaing binibili mismo sa mga lokal. Suportahan natin sila.',
  ),
  // Golden hour
  'g-silhouette': L(
    'Tumigil muna tayo at panoorin. Minsan, ito lang ang kailangan natin.',
    'Tumigil muna tayo at manood. Minsan, ito lang ang kailangan natin.',
  ),
  'g-flare': L(
    'Ilang minuto lang ang golden hour, kaya sulitin natin.',
    'Ilang minuto lang ang gintong oras, kaya sulitin natin.',
  ),
  'g-timelapse': L(
    'Isang oras sa ilang segundo. Ang ganda pa rin, kahit pinabilis.',
    'Isang oras sa ilang segundo. Ang ganda pa rin, kahit pinabilis.',
  ),
  'g-goldenwalk': L(
    'Lahat gumaganda sa ganitong liwanag. Kahit ako, nagmukhang artista.',
    'Lahat gumaganda sa ganitong liwanag. Kahit ako, nagmukhang artista.',
  ),
  // Night
  'g-lights': L(
    'Iba ang vibe pag gabi. Mas chill, mas masaya, mas maraming kuwento.',
    'Iba ang dating kapag gabi. Mas maaliwalas, mas masaya, mas maraming kuwento.',
  ),
  'g-bokeh': L(
    'Isang drink, isang kuwento, at isang gabing hindi malilimutan.',
    'Isang inumin, isang kuwento, at isang gabing hindi malilimutan.',
  ),
  'g-dance': L(
    'Hindi kailangan magaling, basta masaya.',
    'Hindi kailangang magaling, basta masaya.',
  ),
  'g-chika': L(
    'Dito lumalabas ang mga totoong kuwento. Pero secret na lang \'yun.',
    'Dito lumalabas ang mga totoong kuwento. Pero lihim na lang iyon.',
  ),
  // Going home
  'g-packup': L(
    'Parang kahapon lang, kakarating lang namin. Ang daming alaala na iuuwi.',
    'Parang kahapon lang, kararating lang namin. Ang daming alaalang iuuwi.',
  ),
  'g-lastwindow': L(
    'Salamat sa mga alaala. Siguradong babalik kami.',
    'Salamat sa mga alaala. Siguradong babalik kami.',
  ),
  'g-dump': L(
    'Bawat resibo, may kuwento. Sulit ang bawat piso.',
    'Bawat resibo, may kuwento. Sulit ang bawat piso.',
  ),
  'g-ending': L(
    'Salamat sa panonood! Kung nagustuhan n\'yo, i-like, i-share, at sabihin n\'yo sa comments kung saan ang next trip natin.',
    'Salamat sa panonood! Kung nagustuhan ninyo, i-like, ibahagi, at sabihin ninyo sa komento kung saan ang susunod nating biyahe.',
  ),
  // Boracay
  'bor-jetty': L(
    'Tingnan n\'yo ang kulay ng tubig. Turquoise na turquoise. Konting tiis na lang sa alon.',
    'Tingnan ninyo ang kulay ng tubig. Napakalinaw at napakabughaw. Kaunting tiis na lang sa alon.',
  ),
  'bor-white': L(
    'Dito tayo halos buong araw. Lakad sa buhangin, langoy, tapos pahinga sa lilim.',
    'Dito tayo halos buong araw. Maglalakad sa buhangin, lalangoy, tapos magpapahinga sa lilim.',
  ),
  'bor-stations': L(
    'May kanya-kanyang vibe ang bawat station. Alamin natin kung alin ang favorite n\'yo.',
    'May kani-kaniyang dating ang bawat station. Alamin natin kung alin ang paborito ninyo.',
  ),
  'bor-puka': L(
    'Mas kaunti ang tao dito kaysa White Beach, kaya perfect para mag-relax.',
    'Mas kaunti ang tao rito kaysa sa White Beach, kaya perpekto para magpahinga.',
  ),
  'bor-willys': L(
    'Pag-akyat n\'yo, maging magalang lang. Sagradong lugar \'to para sa marami.',
    'Kapag umakyat kayo, maging magalang lang. Sagradong lugar ito para sa marami.',
  ),
  'bor-luho': L(
    'Mula dito, kita mo halos ang buong isla. Sulit ang akyat.',
    'Mula rito, kita mo halos ang buong isla. Sulit ang pag-akyat.',
  ),
  'bor-hopping': L(
    'Ibang isla, ibang beach, ibang adventure. Isang araw lang, pero ang dami nating mapupuntahan.',
    'Ibang isla, ibang dalampasigan, ibang pakikipagsapalaran. Isang araw lang, pero ang dami nating mapupuntahan.',
  ),
  'bor-paraw': L(
    'Tahimik, mahangin, at ang ganda ng langit. Ito na siguro ang pinaka-romantic na sakay sa buong trip.',
    'Tahimik, mahangin, at ang ganda ng langit. Ito na siguro ang pinakaromantikong sakay sa buong biyahe.',
  ),
  'bor-dmall': L(
    'Daming choices: shakes, street food, seafood. Saan kaya tayo uunahin?',
    'Ang daming pagpipilian: shake, pagkaing kalye, pagkaing-dagat. Saan kaya tayo uunahin?',
  ),
  'bor-fire': L(
    'Ilang taon nilang pinag-aralan \'yan, kaya bigyan natin sila ng palakpakan.',
    'Ilang taon nilang pinag-aralan iyan, kaya bigyan natin sila ng palakpakan.',
  ),
};

export type ScriptLength = 'short' | 'long';
export const SCRIPT_LENGTHS: { value: ScriptLength; label: string }[] = [
  { value: 'short', label: 'Maikli' },
  { value: 'long', label: 'Mahaba' },
];

/**
 * Short facts to drop into the vlog, keyed by destination id, then shot id.
 * Boracay facts were checked in November 2026 against news reports, government
 * documents and encyclopedias. Contested claims are worded as such.
 */
const FACTS: Record<string, Record<string, Line>> = {
  boracay: {
    'g-airport': L(
      'Ipinangalan ang airport kay Godofredo P. Ramos, ang congressman na nag-author ng batas na naghiwalay sa Aklan mula sa Capiz.',
      'Ipinangalan ang paliparan kay Godofredo P. Ramos, ang kongresistang may-akda ng batas na naghiwalay sa Aklan mula sa Capiz.',
    ),
    'bor-jetty': L(
      'Mga 7 kilometers lang ang haba ng Boracay. Maliit, pero world-famous.',
      'Mga 7 kilometro lang ang haba ng Boracay. Maliit, pero kilala sa buong mundo.',
    ),
    'g-feet': L(
      'Ayon sa mga Ati, galing ang "Boracay" sa "bora" (bula) at "bocay" (puti). Isa lang \'yan sa ilang kuwento tungkol sa pangalan.',
      'Ayon sa mga Ati, galing ang "Boracay" sa "bora" (bula) at "bocay" (puti). Isa lamang iyan sa ilang kuwento tungkol sa pangalan.',
    ),
    'bor-white': L('Mga 4 kilometers ang haba ng White Beach.', 'Mga 4 na kilometro ang haba ng White Beach.'),
    'bor-stations': L(
      'Ang Station 1, 2 at 3 ay mga dating boat station sa White Beach. Iisang beach lang sila, walang harang sa pagitan.',
      'Ang Station 1, 2 at 3 ay mga dating himpilan ng bangka sa White Beach. Iisang dalampasigan lang sila, walang harang sa pagitan.',
    ),
    'bor-puka': L(
      'Ang "puka" ay \'yung butas sa gitna ng kabibe. Bawal nang iuwi ang shells dito, kaya picture na lang.',
      'Ang "puka" ay ang butas sa gitna ng kabibe. Bawal nang iuwi ang mga kabibe rito, kaya litrato na lang.',
    ),
    'bor-willys': L(
      'May grotto ng Birheng Maria sa ibabaw ng bato. Kapag low tide, puwede mo itong lakarin.',
      'May grotto ng Birheng Maria sa ibabaw ng bato. Kapag kati ang dagat, puwede mo itong lakarin.',
    ),
    'bor-luho': L(
      'Ito ang pinakamataas na bahagi ng isla, mahigit 100 meters above sea level.',
      'Ito ang pinakamataas na bahagi ng isla, mahigit 100 metro mula sa dagat.',
    ),
    'bor-hopping': L(
      'Bago pa dumating ang mga Espanyol, ang mga Ati na ang nakatira sa Boracay.',
      'Bago pa dumating ang mga Espanyol, ang mga Ati na ang naninirahan sa Boracay.',
    ),
    'bor-paraw': L(
      'Ang paraw ay traditional na bangka ng Visayas na may dalawang katig. Dati, pangisda at pang-transport ito bago naging pang-turista.',
      'Ang paraw ay tradisyonal na bangka ng Visayas na may dalawang katig. Dati, ginagamit ito sa pangingisda at paghahatid bago naging pang-turista.',
    ),
    'bor-dmall': L(
      '"Boracay" ang itawag, hindi "Bora". Noong 2011, nagpasa pa ang bayan ng Malay ng resolusyon laban sa paggamit ng "Bora" sa mga negosyo.',
      '"Boracay" ang itawag, hindi "Bora". Noong 2011, nagpasa pa ang bayan ng Malay ng resolusyon laban sa paggamit ng "Bora" sa mga negosyo.',
    ),
    'g-silhouette': L(
      'Mula nang i-reopen noong 2018, bawal na ang pag-inom at paninigarilyo sa mismong beach. Sunset na lang ang lalanghapin mo.',
      'Mula nang muling buksan noong 2018, bawal na ang pag-inom at paninigarilyo sa mismong dalampasigan. Ang paglubog ng araw na lang ang lalanghapin mo.',
    ),
    'bor-fire': L(
      'Ang poi, \'yung pinaiikot na bola, ay galing sa mga Māori ng New Zealand. \'Yung may apoy, modern version na.',
      'Ang poi, iyong pinaiikot na bola, ay galing sa mga Māori ng New Zealand. Ang may apoy ay makabagong bersyon na.',
    ),
    'g-ending': L(
      'Noong April hanggang October 2018, isinara ang Boracay nang mga anim na buwan para linisin. Kaya ingatan natin.',
      'Mula Abril hanggang Oktubre 2018, isinara ang Boracay nang mga anim na buwan para linisin. Kaya ingatan natin.',
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

export function scriptFor(
  shot: Pick<ListShot, 'id'>,
  list: Pick<ShotList, 'destinationId' | 'destinationName'>,
  lang: ScriptLang,
  length: ScriptLength = 'long',
) {
  const fill = (s?: string) => s?.replace(/\{destination\}/g, list.destinationName.replace(/\s*\(copy\)$/, ''));
  const base = LINES[shot.id]?.[lang];
  const extra = length === 'long' ? MORE[shot.id]?.[lang] : undefined;
  return {
    line: fill(base && extra ? `${base} ${extra}` : base),
    fact: fill(FACTS[list.destinationId]?.[shot.id]?.[lang]),
  };
}

/** The whole vlog script for a trip, in shot order. Shots with nothing to say are left out. */
export function buildScript(list: ShotList, lang: ScriptLang, length: ScriptLength = 'long'): ScriptEntry[] {
  return list.shots
    .filter((s) => !s.skipped)
    .sort((a, b) => a.order - b.order)
    .map((shot, i) => ({ shot, number: i + 1, ...scriptFor(shot, list, lang, length) }))
    .filter((e) => e.line || e.fact);
}

export function scriptToText(list: ShotList, lang: ScriptLang, length: ScriptLength = 'long') {
  const lines = [`Vlog script: ${list.destinationName} (${lang === 'taglish' ? 'Taglish' : 'Tagalog'})`, ''];
  for (const e of buildScript(list, lang, length)) {
    lines.push(`${e.number}. [${e.shot.title}]`);
    if (e.line) lines.push(`   "${e.line}"`);
    if (e.fact) lines.push(`   ${factLabel(lang)} ${e.fact}`);
  }
  return lines.join('\n');
}
