/**
 * Single source of truth for the /channels browse menu.
 *
 * The site has no channel storage yet (Sanity holds blog content only), so
 * this static module acts as the data layer: the page maps country ->
 * channels from here and never inlines channel names in markup. When a
 * real backend arrives, swap this module's exports without touching the UI.
 */

export interface CountryChannels {
  country: string;
  /** Channel display names, in showcase order. */
  channels: readonly string[];
}

export const COUNTRY_CHANNELS: readonly CountryChannels[] = [
  {
    country: "Germany",
    channels: ["RTL", "ZDF", "ARD Das Erste", "ProSieben", "Sat.1", "VOX", "RTL II", "Kabel Eins", "Sport1"],
  },
  {
    country: "Netherlands",
    channels: ["NPO 1", "NPO 2", "NPO 3", "RTL 4", "SBS 6", "Veronica", "Net5"],
  },
  {
    country: "UK",
    channels: ["BBC One", "BBC Two", "ITV 1", "Channel 4", "Sky Sports", "TNT Sports", "E4", "Dave"],
  },
  {
    country: "USA",
    channels: ["ABC", "NBC", "CBS", "FOX", "ESPN", "HBO", "CNN", "AMC", "FX"],
  },
  {
    country: "Austria",
    channels: ["ORF 1", "ORF 2", "Puls 4", "ATV", "ServusTV"],
  },
  {
    country: "France",
    channels: ["TF1", "France 2", "France 3", "M6", "Canal+", "Arte", "W9"],
  },
  {
    country: "Denmark",
    channels: ["DR1", "DR2", "TV 2", "Kanal 4", "TV3+"],
  },
  {
    country: "Switzerland",
    channels: ["SRF 1", "SRF zwei", "RTS Un", "RTS Deux", "RSI La 1"],
  },
  {
    country: "Poland",
    channels: ["TVP 1", "TVN", "Polsat", "TVN 24", "TVP Sport"],
  },
  {
    country: "Norway",
    channels: ["NRK 1", "TV 2 Norge", "TVNorge", "Max Norway"],
  },
  {
    country: "Sweden",
    channels: ["SVT 1", "SVT 2", "TV4", "Kanal 5", "TV6 Sweden"],
  },
  {
    country: "Belgium",
    channels: ["Één", "La Une", "VRT Canvas", "RTL TVI", "Club RTL"],
  },
  {
    country: "Finland",
    channels: ["Yle TV1", "Yle TV2", "MTV3", "Nelonen"],
  },
  {
    country: "Spain",
    channels: ["La 1", "Antena 3", "Cuatro", "Telecinco", "La Sexta", "#0 de Movistar+"],
  },
  {
    country: "Ireland",
    channels: ["RTÉ One", "RTÉ2", "Virgin Media One", "TG4"],
  },
  {
    country: "Italy",
    channels: ["Rai 1", "Rai 2", "Rai 3", "Canale 5", "Italia 1", "La7", "Sky Uno"],
  },
  {
    country: "Australia",
    channels: ["ABC TV", "Seven", "Nine Network", "10", "SBS"],
  },
  {
    country: "Canada",
    channels: ["CBC", "CTV", "Global", "Citytv", "Sportsnet", "TSN"],
  },
  {
    country: "Portugal",
    channels: ["RTP 1", "RTP 2", "SIC", "TVI", "SIC Notícias"],
  },
  {
    country: "Russia",
    channels: ["Channel One Russia", "Rossiya 1", "NTV", "TNT", "Match TV"],
  },
  {
    country: "Turquie",
    channels: ["TRT 1", "Show TV", "Fox Türkiye", "Star TV", "ATV Türkiye"],
  },
  {
    country: "Estonia",
    channels: ["ETV", "ETV+", "Kanal 2", "TV3 Estonia"],
  },
  {
    country: "Greece",
    channels: ["ERT 1", "ERT 2", "Alpha TV", "ANT1", "Mega TV", "Skai TV"],
  },
  {
    country: "Czech Republic",
    channels: ["ČT 1", "TV Nova", "Prima", "Barrandov"],
  },
  {
    country: "Africa",
    channels: ["SuperSport", "M-Net", "Africa Magic", "e.tv Africa"],
  },
  {
    country: "Bulgaria",
    channels: ["BNT 1", "bTV", "Nova", "NOVA Sport"],
  },
  {
    country: "Ukraine",
    channels: ["1+1", "Inter", "STB", "ICTV"],
  },
  {
    country: "Bosnia",
    channels: ["BHT 1", "FTV", "OBN", "Hayat TV"],
  },
  {
    country: "Serbia",
    channels: ["RTS 1", "Prva", "Pink", "B92", "Arena Sport"],
  },
  {
    country: "China",
    channels: ["CCTV-1", "CGTN", "Hunan TV", "Dragon TV"],
  },
  {
    country: "Japan",
    channels: ["NHK General", "TV Asahi", "TBS", "Fuji TV", "TV Tokyo"],
  },
  {
    country: "India",
    channels: ["Star Plus", "Zee TV", "Colors", "Sony Entertainment", "DD National"],
  },
];

export const ARABIC_COUNTRY_CHANNELS: readonly CountryChannels[] = [
  {
    country: "Saudi Arabia",
    channels: ["SSC 1", "SSC 2", "SSC Extra", "Al Ekhbariya"],
  },
  {
    country: "UAE",
    channels: ["Abu Dhabi TV", "Dubai TV", "Sharjah TV", "Abu Dhabi Sports"],
  },
  {
    country: "Morocco",
    channels: ["Al Aoula", "2M Monde", "Arryadia", "Al Maghribia"],
  },
  {
    country: "Qatar",
    channels: ["Qatar TV", "Al Rayyan TV", "Alkass Sports"],
  },
  {
    country: "Bahrain",
    channels: ["Bahrain TV", "Bahrain International TV"],
  },
  {
    country: "Egypt",
    channels: ["ON E", "DMC", "Al Nahar", "CBC Egypt", "Dream TV"],
  },
  {
    country: "Kuwait",
    channels: ["KTV 1", "KTV 2", "KTV Sport"],
  },
  {
    country: "Iraq",
    channels: ["Iraqiya TV", "Al Sumaria", "Al Mada"],
  },
  {
    country: "Algeria",
    channels: ["Programme National", "Canal Algérie", "Ennahar TV", "Echorouk TV"],
  },
  {
    country: "Tunisia",
    channels: ["Watania 1", "Watania 2", "Nessma TV", "Hannibal TV"],
  },
  {
    country: "Syria",
    channels: ["Syrian Satellite TV", "Orient News", "Sama TV"],
  },
  {
    country: "Lebanon",
    channels: ["LBCI", "MTV Lebanon", "Al Jadeed", "Future TV", "NBN"],
  },
  {
    country: "Jordan",
    channels: ["Jordan TV", "Ro'ya TV", "Amman TV"],
  },
  {
    country: "Palestine",
    channels: ["Palestine TV", "Watan TV", "Ma'an TV"],
  },
];

/** Flat category/type shortcuts shown in the middle column. */
export const CHANNEL_TYPES: readonly string[] = [
  "Germany Sport",
  "BeIN Sports",
  "Lifestyle",
  "Kids",
  "ESPN Plus (Live Sports)",
  "Documentary",
  "Music",
  "BeIN Movies",
  "SSC",
  "OSN",
  "AD Sports",
  "MBC",
  "F1 MotoGP",
  "MLB Game Pass",
  "NFL Game Pass",
  "NFL Teams",
  "NBA League Pass",
  "NBA Teams",
  "NHL Game",
  "NCAAB NCAA",
  "PPV Events",
  "Motorsports",
];

/* ------------------------------------------------------------------ */
/* Full channel list (/channels/list)                                  */

/* ------------------------------------------------------------------ */

/**
 * Logos already shipped with the site (public/images/channels) matched by
 * normalized channel name. No external assets are introduced here.
 */
const CHANNEL_LOGOS: Record<string, string> = {
  "bein sports": "/images/channels/bein-sports.webp",
  "canal+": "/images/channels/canalplus.svg",
  "movistar+": "/images/channels/movistar.svg",
  dazn: "/images/channels/dazn.svg",
  eurosport: "/images/channels/eurosport.svg",
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/** Known local logo for a channel name, undefined when none exists. */
export function getChannelLogoUrl(name: string): string | undefined {
  return CHANNEL_LOGOS[normalizeName(name)];
}

/** Every country group (worldwide + Arabic) that actually has channels. */
export const ALL_COUNTRY_GROUPS: readonly CountryChannels[] = [
  ...COUNTRY_CHANNELS,
  ...ARABIC_COUNTRY_CHANNELS,
].filter((group) => group.channels.length > 0);
