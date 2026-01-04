import type { ScreenshotMessaging } from "@/lib/types"

/**
 * Demo screenshot messaging data for RedRain Slots Casino
 * Based on the Creative Brief: "Unlock Your Fortune" concept
 * Egyptian Fortune theme with clear differentiation
 */
export const demoScreenshotMessaging: Omit<ScreenshotMessaging, "id" | "screenshot_id" | "created_at" | "updated_at">[] = [
  {
    tagline: "Unlock Your Fortune",
    value_proposition: "Discover the power of destiny with premium Egyptian-themed slot games. Every spin brings you closer to ancient treasures and legendary jackpots.",
    cta_text: "Start Spinning",
    ab_test_variant: "A",
  },
  {
    tagline: "Epic Slot Games Inspired by Ancient Fortune",
    value_proposition: "Journey through time with stunning slot machines featuring Cleopatra, pharaohs, and hidden pyramids. Premium graphics, exciting features, and massive rewards await.",
    cta_text: "Explore Games",
    ab_test_variant: "A",
  },
  {
    tagline: "Big Jackpots. Daily Rewards.",
    value_proposition: "Win legendary prizes every single day. Claim your daily bonus, spin the fortune wheel, and unlock exclusive rewards. The bigger the risk, the greater the fortune.",
    cta_text: "Claim Bonus",
    ab_test_variant: "A",
  },
  {
    tagline: "Play Anytime. Just for Fun.",
    value_proposition: "Entertainment designed for your lifestyle. Play during breaks, unwind after work, or enjoy a quick spin. No real money, no pressure—just pure casino fun.",
    cta_text: "Play Now",
    ab_test_variant: "A",
  },
  {
    tagline: "Start Spinning Today",
    value_proposition: "Join millions discovering their fortune. Download now and receive a welcome bonus of 1,000,000 free coins plus 100 free spins. Your destiny awaits.",
    cta_text: "Download Now",
    ab_test_variant: "A",
  },
  // Variant B examples for A/B testing
  {
    tagline: "Your Fortune Awaits",
    value_proposition: "Step into the world of ancient Egypt where every spin could unlock legendary treasures. Premium slot games with stunning visuals and exciting bonus features.",
    cta_text: "Begin Journey",
    ab_test_variant: "B",
  },
  {
    tagline: "Ancient Treasures, Modern Thrills",
    value_proposition: "Experience the perfect blend of legendary Egyptian mythology and cutting-edge slot gameplay. Cleopatra's gold, pharaoh's riches, and your next big win are just a spin away.",
    cta_text: "Discover More",
    ab_test_variant: "B",
  },
  {
    tagline: "Fortune Favours the Bold",
    value_proposition: "Take a chance and unlock rewards that grow with every play. Daily jackpots, progressive prizes, and exclusive bonuses for the brave. Your courage will be rewarded.",
    cta_text: "Spin & Win",
    ab_test_variant: "B",
  },
]
