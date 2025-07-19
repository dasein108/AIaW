import { PersonalGraphType } from "./types"

const INTRO_PERSONALITY = `
### 🧠 Describe Yourself — and AI Will Generate Your Personal Graph in Cyber Graph Space

This system maps your identity into a **dynamic personal graph** — a data-driven reflection of *you* in the cyber graph space.

Upload your core nodes and attributes by sharing anything about yourself:

- **Who are you?** (Name, age, location, occupation — basic node data)
- **What makes you tick?** (Core values, passions, emotional drivers)
- **How do you think or respond?** (Introvert/extrovert? Logical, emotional, or creative?)
- **What's your background?** (Cultural roots, family structure, past experiences)
- **What drives you?** (Dreams, missions, lifelong quests — these are your forward vectors)
- **What don't you like?** (Negative weights: pet peeves, boundaries, avoidances)
- **Other data points?** (Hobbies, routines, fears, random facts, favorite things)

🎤 You can also **use your voice** — in your native language — to build your graph.
No pressure. Just speak or type what feels real.
Let's map *you* into the system.
`

const INTRO_FACTS = `
### 🧩 Drop Your Life Facts — and Expand Your Personal Graph in Cyber Graph Space

Every fact you share becomes a **node** or **connection** in your evolving personal graph.
These aren't just memories — they're structured data points in your identity map.

Upload any key life events, big or small:

- 🎓 **Education**: "I graduated from university", "I completed an online course"
- 🧠 **Skills**: "I learned Python", "I picked up graphic design"
- 📚 **Knowledge**: "I read *Sapiens*", "I studied ancient history"
- 🎯 **Hobbies**: "I started painting", "I got into hiking"
- 🌍 **Location**: "I relocated to Berlin", "I moved back home"
- 🎬 **Media**: "I watched *Inception*", "I finished a documentary on AI"
- ✈️ **Travel**: "I traveled to Japan", "I went on a solo road trip"
- 💡 **Other events**: New routines, habits, health milestones, discoveries, etc.

🗂️ Think of this as a **living log**.
You can update your facts anytime — just like a diary — to keep your personal graph in sync with your real life.

No story is too small. Every fact is a signal.
`

const INTRO_WISHLIST = `
### 🎯 Upload Your Goals — and Create Connection Points in the Cyber Graph Space

Your **goals** are more than just intentions — they become **live nodes** in the cyber graph, opening paths for collaboration, exchange, discovery, and support.

Each goal you share acts as a **connection point** between your personal graph and others — helping you reach the right people, resources, or opportunities.

📡 Here are some examples you can include:

- 🛒 **Buy / Sell / Offer**:
  - "I want to sell my MacBook M4, 32GB RAM, 512GB SSD"
  - "I'm looking for someone to design a logo for my app"
  - "I want to buy used camera gear"

- 💼 **Career & Projects**:
  - "I'm looking for a frontend developer position in a Web3 project"
  - "I want to build a side project with someone in crypto"
  - "I need a mentor in product design"

- 🧠 **Personal Needs**:
  - "I'm looking for a psychotherapist I can trust"
  - "I need help organizing my schedule and routines"
  - "I want to connect with someone who's been through burnout recovery"

- 🧘 **Lifestyle & Growth**:
  - "I want to get in shape this year"
  - "I plan to start meditating regularly"
  - "I want to meet people who share my values"

Your graph becomes more useful and connected the more clearly your goals are defined.
🧭 **Update your goals anytime** — they keep your graph dynamic, alive, and synced with what you're moving toward.

Your intent = your signal.
Your signal = your connection.
`

export const PERSONAL_GRAPH_ADVICES: Record<PersonalGraphType, string> = {
  personality: INTRO_PERSONALITY,
  facts: INTRO_FACTS,
  wishlist: INTRO_WISHLIST
}
