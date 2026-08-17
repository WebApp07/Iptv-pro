/**
 * Seeds the Sanity dataset with sample blog content:
 * one author, six categories, and three published articles.
 *
 * Usage:
 *   1. Configure SANITY_API_TOKEN (write access), NEXT_PUBLIC_SANITY_PROJECT_ID
 *      and NEXT_PUBLIC_SANITY_DATASET in .env.local.
 *   2. npm run seed:blog
 *
 * The script is idempotent: re-running it updates the same documents.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const env = { ...process.env };
  try {
    const content = readFileSync(resolve(".env.local"), "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && !(match[1] in env)) {
        env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local file; rely on process.env.
  }
  return env;
}

const env = loadEnv();

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET. Copy .env.example to .env.local and fill them in."
  );
  process.exit(1);
}

if (!token) {
  console.error(
    "Missing SANITY_API_TOKEN. Create a token with write access at manage.sanity.io -> API -> Tokens and add it to .env.local."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-01",
  token,
  useCdn: false,
});

/* ------------------------------------------------------------------ */
/* Portable text builders                                             */
/* ------------------------------------------------------------------ */

let counter = 0;
const key = (prefix) => `${prefix}${++counter}`;

function rich(text) {
  const children = [];
  const markDefs = [];
  const tokenRe = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;
  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push({
        _type: "span",
        _key: key("s"),
        text: text.slice(lastIndex, match.index),
      });
    }
    if (match[1] !== undefined) {
      const markKey = key("m");
      children.push({ _type: "span", _key: key("s"), text: match[1], marks: [markKey] });
      markDefs.push({ _key: markKey, _type: "link", href: match[2] });
    } else if (match[3] !== undefined) {
      const markKey = key("m");
      children.push({ _type: "span", _key: key("s"), text: match[3], marks: [markKey] });
      markDefs.push({ _key: markKey, _type: "code" });
    } else if (match[4] !== undefined) {
      const markKey = key("m");
      children.push({ _type: "span", _key: key("s"), text: match[4], marks: [markKey] });
      markDefs.push({ _key: markKey, _type: "strong" });
    } else if (match[5] !== undefined) {
      const markKey = key("m");
      children.push({ _type: "span", _key: key("s"), text: match[5], marks: [markKey] });
      markDefs.push({ _key: markKey, _type: "em" });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    children.push({ _type: "span", _key: key("s"), text: text.slice(lastIndex) });
  }
  return { children, markDefs };
}

function block(style, text, extra = {}) {
  const { children, markDefs } = rich(text);
  return { _type: "block", _key: key("b"), style, children, markDefs, ...extra };
}

const p = (text) => block("normal", text);
const h2 = (text) => block("h2", text);
const h3 = (text) => block("h3", text);

function list(items, listItem) {
  return items.map((item) => block("normal", item, { listItem, level: 1 }));
}

const bullets = (items) => list(items, "bullet");
const numbers = (items) => list(items, "number");

function codeBlock(code, language, filename) {
  return { _type: "code", _key: key("c"), code, language, filename };
}

function inlineImage(asset, alt, caption) {
  return {
    _type: "image",
    _key: key("i"),
    asset: { _type: "reference", _ref: asset._id },
    alt,
    caption,
  };
}

/* ------------------------------------------------------------------ */
/* Image uploads                                                       */
/* ------------------------------------------------------------------ */

async function uploadImage(seed, filename) {
  const url = `https://picsum.photos/seed/${seed}/1600/900`;
  console.log(`  uploading image from ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch placeholder image from picsum.photos (${response.status}). Check your connection and try again.`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return client.assets.upload("image", buffer, {
    contentType: "image/jpeg",
    filename,
  });
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

const author = {
  _id: "author.alex-carter",
  _type: "author",
  name: "Alex Carter",
  slug: { _type: "slug", current: "alex-carter" },
  bio: "Alex writes about streaming tech and spends way too much time testing boxes that all look identical. If it buffers, Alex has probably already hit it with a ping test.",
  twitter: "alexcartertv",
};

const categories = [
  {
    _id: "category.iptv-guides",
    _type: "category",
    title: "IPTV Guides",
    slug: { _type: "slug", current: "iptv-guides" },
    description: "How IPTV works, what to look for in a provider, and how to get the most from a subscription.",
  },
  {
    _id: "category.apps-devices",
    _type: "category",
    title: "Apps & Devices",
    slug: { _type: "slug", current: "apps-devices" },
    description: "Streaming apps, players, and the hardware that runs them.",
  },
  {
    _id: "category.streaming-tips",
    _type: "category",
    title: "Streaming Tips",
    slug: { _type: "slug", current: "streaming-tips" },
    description: "Small changes that make streaming smoother and better looking.",
  },
  {
    _id: "category.troubleshooting",
    _type: "category",
    title: "Troubleshooting",
    slug: { _type: "slug", current: "troubleshooting" },
    description: "Fixes for buffering, stutters, black screens, and other streaming annoyances.",
  },
  {
    _id: "category.entertainment",
    _type: "category",
    title: "Entertainment",
    slug: { _type: "slug", current: "entertainment" },
    description: "What's worth watching and how to find it.",
  },
  {
    _id: "category.technology",
    _type: "category",
    title: "Technology",
    slug: { _type: "slug", current: "technology" },
    description: "The tech behind streaming and where it's headed.",
  },
];

const posts = [
  {
    _id: "post.what-is-iptv",
    _type: "post",
    title: "What is IPTV, and is it legal? A plain-English answer",
    slug: { _type: "slug", current: "what-is-iptv" },
    excerpt:
      "IPTV delivers TV over the internet instead of cable. Here's how it works, where the legal line sits, and what to check before you pay anyone.",
    publishedAt: "2026-07-21T08:00:00.000Z",
    updatedAt: "2026-08-02T10:30:00.000Z",
    readingTime: 5,
    status: "published",
    seoTitle: "What Is IPTV and Is It Legal? A Plain-English Guide",
    seoDescription:
      "IPTV delivers TV over the internet. Here's how it works, where the legal line sits, and what to check before you pay a provider.",
    seoKeywords: ["what is iptv", "iptv legal", "iptv explained", "is iptv illegal"],
    author: { _type: "reference", _ref: author._id },
    categories: [{ _type: "reference", _ref: "category.iptv-guides" }],
    body: [
      h2("What IPTV actually is"),
      p(
        "IPTV stands for Internet Protocol Television. In plain terms, it delivers TV over your internet connection instead of a cable or satellite dish. When you stream a show on your phone, or watch a live match on a smart TV, you're already using the same idea."
      ),
      p(
        "The term gets used loosely, though. Some services are subscription platforms that buy rights and play fair. Others resell channel lists without permission. Both get called IPTV, which makes the legal question messy."
      ),
      h2("How IPTV works"),
      p(
        "Content arrives at your device as a stream of data packets, and your player turns that feed into something watchable. You don't download files to keep. You watch as the data comes in."
      ),
      p(
        "Most setups follow the same shape. A provider gives you an account, a playlist URL, and an app. Point the app at the playlist and you get a channel grid. The simplicity is a feature, and it's also why the market is full of resellers."
      ),
      h2("Where the legal line actually sits"),
      p(
        "A company that streams content it has licensed, a broadcaster or a VOD service, is operating legally. A reseller selling access to channels it doesn't own and hasn't paid for is not. The gray zone is where most people get burned."
      ),
      p(
        "Here's the honest version: if a package looks too cheap to be real, it usually is. A one-off payment for thousands of channels, premium sport included, is a strong sign the rights aren't in order."
      ),
      h2("Signs a service is probably reselling"),
      bullets([
        "It can't say who owns the content it sells.",
        "It wants a long prepayment before you've tested anything.",
        "The support channel is a chat group that goes quiet for days.",
        "It promises every league and every movie for a flat fee.",
      ]),
      p(
        "None of these on their own prove wrongdoing. Together, they point to a service that resells content it doesn't control."
      ),
      h2("What to check before you pay"),
      numbers([
        "Confirm the provider can identify the sources of its content.",
        "Ask whether you're dealing with the operator or a middleman.",
        "Start with the shortest plan, not the twelve-month deal.",
        "Keep payment on a method that lets you dispute a charge.",
      ]),
      h2("The practical takeaway"),
      p(
        "You can enjoy IPTV perfectly legally. Stick to services that can account for what they sell, expect to pay a normal price, and treat anyone who promises the whole world for pocket change with suspicion."
      ),
      p(
        "If your stream starts stuttering on a decent connection, that's a different problem. The common causes are covered in our guide to [fixing IPTV buffering](/blog/fix-iptv-buffering)."
      ),
    ],
  },
  {
    _id: "post.fix-iptv-buffering",
    _type: "post",
    title: "IPTV buffering: what actually causes it and how to fix it",
    slug: { _type: "slug", current: "fix-iptv-buffering" },
    excerpt:
      "Buffering on IPTV usually comes down to your connection, your network, or your device. Here's how to find the culprit and fix it for good.",
    publishedAt: "2026-07-14T09:00:00.000Z",
    updatedAt: "2026-07-28T14:00:00.000Z",
    readingTime: 7,
    status: "published",
    seoTitle: "IPTV Buffering? What Causes It and How to Fix It",
    seoDescription:
      "Buffering on IPTV usually comes down to your connection, your network, or your device. Here's how to find the culprit and fix it.",
    seoKeywords: ["iptv buffering", "iptv keeps buffering", "fix iptv buffering", "streaming buffering fix"],
    author: { _type: "reference", _ref: author._id },
    categories: [{ _type: "reference", _ref: "category.troubleshooting" }],
    body: [
      h2("Why IPTV buffers at all"),
      p(
        "Every stream travels a chain: the provider's server, your internet connection, your home network, and the device you watch on. A problem at any link shows up as a spinner. Most buffering is not the provider's fault. That's good news, because most of the chain is under your control."
      ),
      h2("Start with your internet connection"),
      p(
        "Run a speed test on the same device that's buffering, ideally at the same time you normally watch. You're looking at two numbers: download speed and stability. A fast connection that keeps dropping packets will buffer just as often as a slow one."
      ),
      p(
        "For rough guidance, most HD streams want 15 to 25 Mbps with room to spare. Live sport and 4K need more. If you're comfortably above that and still buffering, move on."
      ),
      h3("A quick test worth doing"),
      codeBlock("ping -c 20 8.8.8.8", "bash", "terminal"),
      p(
        "Twenty pings with more than a couple of percent loss points at your connection or router. High latency spikes are another warning sign. Run the same test on a wired computer to take Wi-Fi out of the picture."
      ),
      h2("Check the streaming device"),
      p(
        "Old boxes and TVs are a quiet, common cause. They stream fine until the bitrate climbs, then they stutter. If the same channel plays smoothly in a phone app but not on the TV, the device is the bottleneck."
      ),
      p(
        "Restart the device before you blame anyone. A full shutdown, not just sleep. That clears stale apps and stale network connections better than you'd expect."
      ),
      h2("The Wi-Fi trap"),
      p(
        "Wi-Fi is convenient and it's the most common buffering cause I see. Walls, distance, and interference from neighbors all eat into the signal. Two fixes help most people: move the box closer to the router, or run an Ethernet cable."
      ),
      p(
        "If you have to stay on Wi-Fi, try the 5 GHz band instead of 2.4 GHz. It's faster and less crowded, at the cost of range."
      ),
      h2("Sometimes it is the provider"),
      p(
        "If buffering happens at the same moment every evening, or the whole lineup is sluggish at once, the server is probably oversubscribed. A provider that can't handle peak times is a reason to shop around."
      ),
      p(
        "Knowing how to tell a solid service from a reseller helps here. Our guide to [what IPTV is](/blog/what-is-iptv) covers the difference."
      ),
      h2("A fix checklist, in order"),
      numbers([
        "Restart your router and your device.",
        "Test a wired connection to rule out Wi-Fi.",
        "Run a speed test on the device that's buffering.",
        "Drop the stream quality in the app and see if it holds.",
        "Try a different player or app.",
        "Ask the provider for a quieter server.",
      ]),
      p(
        "Work through them in order and stop at the first fix. Most people land on the Wi-Fi fix and never look back."
      ),
      h2("When better hardware is the answer"),
      p(
        "If the connection is fine, the provider is fine, and the box still chokes, it may be time for hardware with more headroom. Our rundown of the [best devices for IPTV](/blog/best-devices-for-iptv) covers what actually matters and what's just marketing."
      ),
    ],
  },
  {
    _id: "post.best-devices-for-iptv",
    _type: "post",
    title: "The best devices for IPTV in 2026: what to buy and what to skip",
    slug: { _type: "slug", current: "best-devices-for-iptv" },
    excerpt:
      "Smart TVs, streaming sticks, Android boxes, tablets: the device you pick shapes your whole IPTV experience. Here's how to choose.",
    publishedAt: "2026-08-05T10:00:00.000Z",
    readingTime: 6,
    status: "published",
    seoTitle: "Best Devices for IPTV in 2026: What to Buy and Skip",
    seoDescription:
      "Smart TVs, streaming sticks, Android boxes, tablets: the device you pick shapes your whole IPTV experience. Here's how to choose one.",
    seoKeywords: ["best iptv device", "iptv device 2026", "android tv box iptv", "fire stick iptv"],
    author: { _type: "reference", _ref: author._id },
    categories: [{ _type: "reference", _ref: "category.apps-devices" }],
    body: [
      h2("Why the device matters"),
      p(
        "IPTV is only as good as the box it runs on. A weak device stutters on high-bitrate channels, drags through 4K, and makes you wait on app restarts. A decent one just works, quietly, for years. The gap between the two costs a few dollars."
      ),
      h2("What to look for in any device"),
      bullets([
        "Support for your provider's app and for Widevine L1, so premium streams play at full quality.",
        "An Ethernet port, because a wired connection removes most Wi-Fi problems.",
        "Enough storage and RAM for your apps, with a little room to breathe.",
        "Automatic app updates, so your player doesn't quietly fall behind.",
      ]),
      h2("Streaming sticks and boxes"),
      h3("Android TV and Google TV"),
      p(
        "Android TV and Google TV devices are the easiest recommendation for most people. They run every major IPTV app, updates arrive automatically, and prices start low. The floor is low too: the cheapest sticks are slow. Pick a current-generation model rather than the bargain bin."
      ),
      h3("Apple TV"),
      p(
        "The Apple TV is the smoothest experience I've used, and the most expensive. If the rest of your home runs on Apple gear, it fits in perfectly. IPTV apps for it are fewer, so check that your provider supports it before you commit."
      ),
      h2("Smart TVs"),
      p(
        "A smart TV is fine as a starting point. The catch is that TV makers update software for a couple of years and then move on, so the app store stops receiving new versions. If your TV does everything you need today, use it. Don't buy a TV mainly for IPTV."
      ),
      h2("Tablets and phones"),
      p(
        "Phones and tablets are great second screens and solid travel companions. The limitation is that most won't push 4K to their own screen, and some apps are better on mobile than on TV. Fine for the sofa, fine for a hotel room."
      ),
      h2("What to skip"),
      bullets([
        "No-name boxes that ship with random firmware and no support channel.",
        "Anything advertised by listing specs nobody uses, like 64 cores and a terabyte of storage.",
      ]),
      h2("A sensible pick"),
      p(
        "If I had to narrow it to one recommendation: a current Android TV or Google TV stick with 4K, an Ethernet option, and Wi-Fi 5 or better. It covers the apps, the quality, and the price."
      ),
      p(
        "Not sure IPTV is for you? The [plain-English guide to IPTV](/blog/what-is-iptv) covers the basics. And if streams give you trouble once you're in, the [buffering guide](/blog/fix-iptv-buffering) is the next stop."
      ),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Run                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  console.log(`Targeting project ${projectId} / dataset ${dataset}\n`);

  console.log("Writing author...");
  await client.createOrReplace(author);

  console.log("Writing categories...");
  for (const category of categories) {
    await client.createOrReplace(category);
  }

  console.log("Uploading featured images...\n");
  const featuredAssets = {
    "post.what-is-iptv": await uploadImage("iptv-what-is", "featured-what-is-iptv.jpg"),
    "post.fix-iptv-buffering": await uploadImage("iptv-buffering", "featured-fix-buffering.jpg"),
    "post.best-devices-for-iptv": await uploadImage("iptv-devices", "featured-best-devices.jpg"),
  };
  const deviceInlineAsset = await uploadImage("iptv-device-stick", "inline-device-stick.jpg");

  console.log("\nWriting posts...\n");
  for (const post of posts) {
    const draft = { ...post };
    draft.featuredImage = {
      _type: "image",
      asset: { _type: "reference", _ref: featuredAssets[draft._id]._id },
      alt: `Photograph representing an article about ${draft.title}`,
    };
    if (draft._id === "post.best-devices-for-iptv") {
      const body = [...draft.body];
      const index = body.findIndex((node) => node._type === "block" && node.children?.[0]?.text?.startsWith("Android TV and Google TV"));
      body.splice(index + 1, 0, inlineImage(deviceInlineAsset, "A streaming stick next to an Ethernet cable", "A single streaming stick covers most setups, and a wired connection removes most Wi-Fi problems."));
      draft.body = body;
    }
    await client.createOrReplace(draft);
    console.log(`  ${draft.title}`);
  }

  console.log("\nDone. Open http://localhost:3000/studio to review the content.");
  console.log("Published articles appear on /blog within a couple of minutes (Sanity CDN + Next.js cache).");
}

main().catch((error) => {
  console.error("\nSeed failed:", error.message);
  process.exit(1);
});