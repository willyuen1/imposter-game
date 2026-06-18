/*
 * WORD PACK
 * ---------
 * This is the content of the game. Everyone who knows the word is an "insider";
 * the imposter only sees the category + ONE clue, drawn at random from the list.
 *
 * Each entry is:
 *     { word: "The thing insiders see", clues: [ "hint 1", "hint 2", "hint 3" ] }
 *
 * The game picks one of the clues at random each round, so the same word can feel
 * different each time. Good clues are SUBTLE — they nudge toward the word without
 * giving it away, so the imposter can bluff (and maybe guess) but isn't handed it.
 *
 * To add your own: copy a line. You can give as many clues as you like (1+).
 * You can add whole new categories too: just add a "Category Name": [ ... ] block.
 */
const WORD_PACK = {
  "Animals": [
    { word: "Elephant", clues: [
      "Grudges are said to last a lifetime",
      "The herd follows the eldest female",
      "Poachers want what's in its mouth" ] },
    { word: "Penguin", clues: [
      "Huddles in a crowd to keep warm",
      "Dad takes the egg-sitting shift",
      "Clumsy on land, graceful below" ] },
    { word: "Kangaroo", clues: [
      "Can't move backwards",
      "Carries the kids up front",
      "Settles disputes with its fists" ] },
    { word: "Octopus", clues: [
      "Has three hearts",
      "Squeezes through impossible gaps",
      "Vanishes by changing its skin" ] },
    { word: "Cheetah", clues: [
      "Zero to sixty in a blink",
      "Dark streaks run down its face",
      "Built for the sprint, not the long haul" ] },
    { word: "Owl", clues: [
      "A symbol of wisdom",
      "Turns its head almost all the way round",
      "Hunts on silent wings" ] },
    { word: "Sloth", clues: [
      "Only comes down once a week",
      "Algae can grow on its coat",
      "In no hurry, ever" ] },
    { word: "Dolphin", clues: [
      "Sleeps with one eye open",
      "Speaks in clicks and whistles",
      "Answers to its own signature sound" ] },
    { word: "Chameleon", clues: [
      "Each eye looks a different way",
      "A tongue faster than you can see",
      "Its mood shows on its skin" ] },
    { word: "Beaver", clues: [
      "Nature's engineer",
      "Front teeth never stop growing",
      "Can reshape a whole stream" ] }
  ],
  "Food & Drink": [
    { word: "Pizza", clues: [
      "Geometry you can eat",
      "Naples sent it to the world",
      "Pineapple on it starts arguments" ] },
    { word: "Sushi", clues: [
      "Raw, and proud of it",
      "Green heat on the side",
      "Tokyo street food gone global" ] },
    { word: "Coffee", clues: [
      "Beans ground before sunrise",
      "Brazil grows mountains of it",
      "Decaf misses the point, some say" ] },
    { word: "Pancakes", clues: [
      "Flip it or flop it",
      "A tower drowned in syrup",
      "The star of one Tuesday before Lent" ] },
    { word: "Tacos", clues: [
      "One day of the week claims it",
      "Fold it before it spills",
      "A handful from Mexico" ] },
    { word: "Spaghetti", clues: [
      "Twirl it, don't cut it",
      "A meatball's favourite bed",
      "Two who shared a strand, in one cartoon" ] },
    { word: "Ice cream", clues: [
      "Eat too fast and your head aches",
      "Two scoops, please",
      "First to suffer in the sun" ] },
    { word: "Popcorn", clues: [
      "Kernels that explode",
      "Its smell means the film's starting",
      "Salt mandatory, butter optional" ] },
    { word: "Chocolate", clues: [
      "Cocoa in its sweetest form",
      "Melts at body temperature",
      "February 14th's safest gift" ] },
    { word: "Lemonade", clues: [
      "What life hands you, make this",
      "A kid's first sidewalk business",
      "Sweet meets pucker" ] }
  ],
  "Places": [
    { word: "Beach", clues: [
      "It comes home hidden in your shoes",
      "Castles here are built to be lost",
      "The tide sets the schedule" ] },
    { word: "Library", clues: [
      "Late returns cost you",
      "A whole world, alphabetised",
      "The quietest room around" ] },
    { word: "Airport", clues: [
      "Shoes off before you pass",
      "Hurry up, then wait",
      "Where goodbyes drag on" ] },
    { word: "Gym", clues: [
      "Packed in January, empty by February",
      "Mirrors on every wall, on purpose",
      "Leave it all on the floor" ] },
    { word: "Zoo", clues: [
      "Glass between you and them",
      "A world tour of animals in an afternoon",
      "Most of them are asleep when you visit" ] },
    { word: "Museum", clues: [
      "Please don't touch",
      "Centuries under one roof",
      "Velvet ropes and hushed voices" ] },
    { word: "Casino", clues: [
      "No clocks, no windows, by design",
      "The odds were never really yours",
      "Chips stand in for cash" ] },
    { word: "Cinema", clues: [
      "Phones off, please",
      "Snacks cost more than the ticket",
      "Best seats are in the middle" ] },
    { word: "Hospital", clues: [
      "Visiting hours apply",
      "The gowns never quite close",
      "Everything smells of clean" ] },
    { word: "Restaurant", clues: [
      "Leave a little extra on the way out",
      "Someone else does the washing up",
      "Best to book ahead" ] }
  ],
  "Sports": [
    { word: "Soccer", clues: [
      "Most of the world calls it football",
      "Only the keeper may use hands",
      "Sometimes it ends nil-nil" ] },
    { word: "Basketball", clues: [
      "The target sits ten feet up",
      "Dribble, or it's a travel",
      "Nothing but net" ] },
    { word: "Tennis", clues: [
      "Zero goes by a romantic name",
      "Strawberries and cream at one tournament",
      "Served, then volleyed" ] },
    { word: "Swimming", clues: [
      "Goggles leave a ring around your eyes",
      "Lap after lap in a lane",
      "No running on the wet edge" ] },
    { word: "Boxing", clues: [
      "Saved by the bell",
      "Float, then sting",
      "Twelve rounds at most" ] },
    { word: "Bowling", clues: [
      "Mind the gutter",
      "Rented shoes required",
      "Ten of them, knocked down at once" ] },
    { word: "Skiing", clues: [
      "Pizza to slow, fries to go",
      "Fresh powder is the dream",
      "The lift hauls you up; gravity does the rest" ] },
    { word: "Golf", clues: [
      "A good walk, spoiled — so they say",
      "Shout a warning so no one's hit",
      "Eighteen tries to stay under par" ] },
    { word: "Cycling", clues: [
      "A yellow jersey is the prize",
      "Two wheels and a chain",
      "You never forget how" ] },
    { word: "Marathon", clues: [
      "A Greek messenger gave it its name",
      "Twenty-six miles and a stubborn bit more",
      "The wall hits near the end" ] }
  ],
  "Jobs": [
    { word: "Doctor", clues: [
      "Say 'ahh'",
      "An apple a day keeps them away",
      "Bedside manner counts" ] },
    { word: "Teacher", clues: [
      "Grading eats the weekend",
      "Chalk dust and patience",
      "Off all summer, supposedly" ] },
    { word: "Chef", clues: [
      "Yes, chef",
      "A tall white hat",
      "Taste, season, repeat" ] },
    { word: "Pilot", clues: [
      "Mind the altitude",
      "Wings pinned to the uniform",
      "A crackly voice over the speaker" ] },
    { word: "Firefighter", clues: [
      "Slides down a pole",
      "Runs in as others run out",
      "A dalmatian rides along" ] },
    { word: "Farmer", clues: [
      "Up with the rooster",
      "Prays for rain, then for sun",
      "Makes hay while it shines" ] },
    { word: "Police officer", clues: [
      "Reads you your rights",
      "Walks a beat",
      "Lights and a siren" ] },
    { word: "Astronaut", clues: [
      "Breakfast floats away up here",
      "One small step",
      "A very long commute" ] },
    { word: "Plumber", clues: [
      "Follows the leak",
      "A famous video-game duo did this work",
      "Lefty loosey, righty tighty" ] },
    { word: "Barber", clues: [
      "A red-and-white pole out front",
      "Just a little off the top",
      "Gossip comes with the trim" ] }
  ],
  "Around the House": [
    { word: "Refrigerator", clues: [
      "Hums all night and goes nowhere",
      "Does the little light really turn off?",
      "Where the leftovers live" ] },
    { word: "Television", clues: [
      "Everyone faces the same wall",
      "Its remote always goes missing",
      "Once needed rabbit ears" ] },
    { word: "Toothbrush", clues: [
      "Two minutes, twice a day",
      "Swap it every few months",
      "Best friends with mint" ] },
    { word: "Pillow", clues: [
      "A fight was named after it",
      "Flip it for the cool side",
      "Where dreams begin" ] },
    { word: "Clock", clues: [
      "Two hands but never waves",
      "Springs forward in spring",
      "Ticks without going anywhere" ] },
    { word: "Umbrella", clues: [
      "Bad luck to open it indoors",
      "Turns inside out in a gust",
      "Forgotten the moment skies clear" ] },
    { word: "Candle", clues: [
      "Make a wish, then blow",
      "Burned at both ends, they warn",
      "Wax runs down its side" ] },
    { word: "Mirror", clues: [
      "Lefty becomes righty in it",
      "Break it for seven years of trouble",
      "The queen asked it who's fairest" ] },
    { word: "Vacuum", clues: [
      "Nature abhors one, they say",
      "Drags a cord around the room",
      "The pet hair's worst enemy" ] },
    { word: "Blanket", clues: [
      "The best wall for a fort",
      "Crackles with static on cold nights",
      "One small boy won't part with his" ] }
  ],
  "Nature": [
    { word: "Rainbow", clues: [
      "Seven colours in one arc",
      "Gold waits at the end, supposedly",
      "Needs both sun and rain" ] },
    { word: "Volcano", clues: [
      "Sleeps, then wakes in a temper",
      "Pompeii knew it well",
      "Builds islands over ages" ] },
    { word: "Ocean", clues: [
      "Five share one vast body",
      "Its deepest parts are unmapped",
      "All that water, none to drink" ] },
    { word: "Tornado", clues: [
      "It carried Dorothy off",
      "Chase it and you've got a hobby",
      "Touches down, then lifts away" ] },
    { word: "Desert", clues: [
      "Mirages promise what isn't there",
      "Freezing once the sun is gone",
      "A camel's home turf" ] },
    { word: "River", clues: [
      "You can't step in the same one twice",
      "It always finds the sea",
      "Bridges exist to beat it" ] },
    { word: "Lightning", clues: [
      "Count the seconds to the boom",
      "Never the same spot twice, they claim",
      "A rod on the roof tames it" ] },
    { word: "Moon", clues: [
      "It only borrows its light",
      "A man supposedly lives there",
      "Wolves get blamed for howling at it" ] },
    { word: "Forest", clues: [
      "Easy to miss for all the trees",
      "Hansel left crumbs in one",
      "Called the planet's lungs" ] },
    { word: "Snow", clues: [
      "No two are ever alike",
      "Lie down and make an angel",
      "Out come the shovels" ] }
  ],
  "Celebrities": [
    { word: "Taylor Swift", clues: [
      "Re-recorded her own back catalogue",
      "Counts her career in 'eras'",
      "Fans decode her every lyric" ] },
    { word: "Cristiano Ronaldo", clues: [
      "Pushed the fizzy drinks aside, famously",
      "Goes by his initials and a seven",
      "Forever measured against an Argentine" ] },
    { word: "Elon Musk", clues: [
      "Named a car company after an inventor",
      "Bought a blue bird and rebranded it",
      "Wants to retire on another planet" ] },
    { word: "Albert Einstein", clues: [
      "Stuck his tongue out for a photo",
      "Made time itself bend",
      "A short, very famous equation is his" ] },
    { word: "Lady Gaga", clues: [
      "Calls her fans little monsters",
      "Once arrived at an awards show in an egg",
      "Went from pop stages to an Oscar one" ] },
    { word: "Dwayne Johnson", clues: [
      "His nickname is rock-solid",
      "Raises a single eyebrow on cue",
      "From the wrestling ring to the box office" ] },
    { word: "Leonardo DiCaprio", clues: [
      "Drew a portrait on a sinking ship",
      "Survived a bear to finally win gold",
      "Spun a top to test if he was dreaming" ] },
    { word: "Beyoncé", clues: [
      "Her fandom is a 'hive'",
      "Half of a music power couple",
      "Once one of three, now one of one" ] },
    { word: "Oprah Winfrey", clues: [
      "You get one, and you get one!",
      "Her book pick makes a bestseller",
      "Goes by one name, like royalty" ] },
    { word: "Michael Jackson", clues: [
      "One sequined glove was the look",
      "Glided backwards across the stage",
      "Crowned the king of his genre" ] }
  ],
  "Brands": [
    { word: "Nike", clues: [
      "Named for a winged goddess of victory",
      "A simple curved tick is its mark",
      "Tells you to stop hesitating and act" ] },
    { word: "Apple", clues: [
      "Born in a California garage",
      "A bite taken out of the badge",
      "Its products often start with a small letter" ] },
    { word: "McDonald's", clues: [
      "A clown was once the face",
      "Golden and arched",
      "Home of a famously Big sandwich" ] },
    { word: "Coca-Cola", clues: [
      "The recipe is a guarded secret",
      "Said to have shaped how we picture Santa",
      "A polar bear shows up in its winter ads" ] },
    { word: "Lego", clues: [
      "The worst thing to step on barefoot",
      "Danish bricks that lock together",
      "Its name means 'play well'" ] },
    { word: "Google", clues: [
      "A misspelled enormous number",
      "Now a verb for looking things up",
      "Its homepage doodle changes daily" ] },
    { word: "Disney", clues: [
      "It all started with a mouse",
      "A castle opens every film",
      "Claims to be the happiest place" ] },
    { word: "Amazon", clues: [
      "Shares its name with the biggest river",
      "An arrow runs from A to Z",
      "Boxes appear on the step by morning" ] },
    { word: "Ferrari", clues: [
      "A prancing horse on red",
      "The pride of Maranello",
      "A regular winner in Formula racing" ] },
    { word: "Starbucks", clues: [
      "A twin-tailed siren on the cup",
      "Your name, often misspelled",
      "Sizes in a language of its own" ] }
  ],
  "Household Members": [
    { word: "Jacob",     clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Katherine", clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Claire",    clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Stephen",   clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Anthony",   clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Baba",      clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Mama",      clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Clover",    clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Napoleon",  clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] },
    { word: "Willow",    clues: ["Sometimes annoying", "You don't get to pick them", "Shares the same roof"] }
  ],
  "School": [
    { word: "Pencil", clues: [
      "Sharpen it when it goes dull",
      "Mistakes rub away at one end",
      "The number two is the classic" ] },
    { word: "Backpack", clues: [
      "Straps over both shoulders",
      "Heavier every semester",
      "A keychain dangles from the zip" ] },
    { word: "Homework", clues: [
      "Due first thing tomorrow",
      "The dog allegedly eats it",
      "Eats into playtime" ] },
    { word: "Ruler", clues: [
      "Straight lines, every time",
      "Twelve inches of authority",
      "Snaps if you bend it too far" ] },
    { word: "Chalkboard", clues: [
      "Screeches if you drag the wrong thing across it",
      "Erasers clap out clouds of dust",
      "Going white-and-marker replaced it" ] },
    { word: "Recess", clues: [
      "A short burst of freedom",
      "The bell ends the fun",
      "The playground rules here" ] },
    { word: "Calculator", clues: [
      "Type a number, flip it, read a word",
      "Banned during some tests",
      "Does the sums for you" ] },
    { word: "Report card", clues: [
      "Arrives at the end of term",
      "Hard to hide from parents",
      "Letters that can decide the allowance" ] },
    { word: "Scissors", clues: [
      "Never run holding them",
      "Beats paper, loses to rock",
      "Lefties need their own pair" ] },
    { word: "Cafeteria", clues: [
      "Trays slide along a rail",
      "Mystery meat on the menu",
      "Where the tables get claimed" ] }
  ]
};

// expose globally for app.js
window.WORD_PACK = WORD_PACK;
