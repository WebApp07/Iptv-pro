import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Message = {
  from: "them" | "me";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
};

type Chat = {
  name: string;
  status: string;
  initials: string;
  avatarClass: string;
  typing?: { time: string };
  messages: Message[];
};

const chats: Chat[] = [
  {
    name: "Nikos P.",
    status: "online",
    initials: "NP",
    avatarClass: "border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]",
    messages: [
      {
        from: "them",
        text: "How's that new IPTV working out?",
        time: "21:14",
      },
      {
        from: "me",
        text: "Good. Watched the whole derby on Saturday, not one freeze.",
        time: "21:16",
        status: "delivered",
      },
      {
        from: "them",
        text: "Setup was easy then?",
        time: "21:17",
      },
      {
        from: "me",
        text: "Five minutes on the Fire Stick. Login landed on WhatsApp the minute I paid.",
        time: "21:18",
        status: "read",
      },
    ],
  },
  {
    name: "Elena K.",
    status: "last seen recently",
    initials: "EK",
    avatarClass: "border-[#046bd2]/30 bg-[#046bd2]/15 text-[#6db3ff]",
    typing: { time: "18:04" },
    messages: [
      {
        from: "them",
        text: "You switched the whole house to IPTV?",
        time: "18:03",
      },
      {
        from: "me",
        text: "Yeah. Living room TV and the kitchen tablet at the same time, no lag.",
        time: "18:05",
        status: "read",
      },
      {
        from: "them",
        text: "And the Greek channels?",
        time: "18:06",
      },
      {
        from: "me",
        text: "All of them. ERT, Mega, Ant1, the lot. Cheaper than what we paid the cable guy.",
        time: "18:07",
        status: "read",
      },
    ],
  },
  {
    name: "Giorgos T.",
    status: "online",
    initials: "GT",
    avatarClass: "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#22d3ee]",
    messages: [
      {
        from: "them",
        text: "That movie library as big as they claim?",
        time: "22:41",
      },
      {
        from: "me",
        text: "Bigger than I expected, honestly.",
        time: "22:42",
        status: "delivered",
      },
      {
        from: "me",
        text: "The EPG makes finding something to watch actually easy.",
        time: "22:43",
        status: "read",
      },
      {
        from: "them",
        text: "Any problems so far?",
        time: "22:44",
      },
      {
        from: "me",
        text: "One glitch on my TV. Support fixed it over WhatsApp in a few minutes.",
        time: "22:45",
        status: "read",
      },
    ],
  },
];

function MessageStatus({ status }: { status: "sent" | "delivered" | "read" }) {
  return (
    <svg
      viewBox="0 0 16 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "h-3 w-3.5",
        status === "read" ? "text-[#53bdeb]" : "text-[#8696a0]"
      )}
      aria-hidden="true"
    >
      {status !== "sent" && <path d="M1.5 5.5 4.5 8.5 9 4" opacity="0.55" />}
      <path d="M6.5 5.5 9.5 8.5 14.5 3" />
    </svg>
  );
}

export function CustomerFeedback() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Customer Feedback
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Feedback from our customers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Most feedback we get arrives as a short WhatsApp message: did the
            stream hold, did the login show up fast enough. The chats below are
            samples in that style.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {chats.map((chat, index) => (
            <article
              key={chat.name}
              className="group relative animate-[hero-fade-in_0.7s_ease-out_both] overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:-translate-y-1 hover:border-[#25d366]/40 hover:shadow-[0_20px_60px_-20px] hover:shadow-[#25d366]/15"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#25d366]/30 bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#25d366]">
                Sample conversation
              </span>

              <div className="flex items-center gap-3 border-b border-black/30 bg-[#1f2c34] px-4 py-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-xs font-bold",
                    chat.avatarClass
                  )}
                >
                  {chat.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {chat.name}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-[#8696a0]">
                    {chat.status === "online" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#25d366] animate-[hero-glow-pulse_2.5s_ease-in-out_infinite]" />
                    )}
                    {chat.status}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[#8696a0]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect x="2" y="6" width="14" height="12" rx="2" />
                  </svg>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </div>
              </div>

              <div className="relative bg-[#0b141a] px-4 py-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(37,211,102,0.05),transparent_45%)]" />
                <div className="relative space-y-2">
                  {chat.typing && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-lg rounded-tl-sm bg-[#202c33] px-4 py-3">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="h-1.5 w-1.5 rounded-full bg-white/60 animate-[hero-rise_1.1s_ease-in-out_infinite]"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {chat.messages.map((message, messageIndex) => {
                    const outgoing = message.from === "me";
                    return (
                      <div
                        key={messageIndex}
                        className={cn(
                          "flex",
                          outgoing ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                            outgoing
                              ? "rounded-tr-sm bg-[#005c4b] text-white"
                              : "rounded-tl-sm bg-[#202c33] text-white/90"
                          )}
                        >
                          <p>{message.text}</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#8696a0]">
                            {message.time}
                            {outgoing && (
                              <MessageStatus status={message.status ?? "delivered"} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted">
          Sample conversations with fictional names. These aren&apos;t real
          WhatsApp screenshots or verified reviews.
        </p>
      </div>
    </section>
  );
}