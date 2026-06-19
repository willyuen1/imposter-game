/*
 * WORD PACK
 * ---------
 * Insiders see the category + the WORD. The imposter sees the category + ONE
 * "related" word, drawn at random from the list below — a decoy in the same
 * ballpark, NOT the real word. The imposter uses it to bluff and blend in.
 *
 * Each entry is:
 *     { word: "The thing insiders see", related: [ "decoy 1", "decoy 2", "decoy 3" ] }
 *
 * Good decoys are close cousins of the real word (usually same category), so the
 * imposter's vague clues can pass — but specific ones give them away.
 *
 * To add your own: copy a line. Give as many related words as you like (1+).
 * You can add whole new categories too: just add a "Category Name": [ ... ] block.
 */
const WORD_PACK = {
  "Animals": [
    { word: "Elephant",  related: ["Rhino", "Hippo", "Giraffe"] },
    { word: "Penguin",   related: ["Seal", "Walrus", "Puffin"] },
    { word: "Kangaroo",  related: ["Wallaby", "Koala", "Wombat"] },
    { word: "Octopus",   related: ["Squid", "Jellyfish", "Cuttlefish"] },
    { word: "Cheetah",   related: ["Leopard", "Jaguar", "Lion"] },
    { word: "Owl",       related: ["Hawk", "Eagle", "Falcon"] },
    { word: "Sloth",     related: ["Anteater", "Koala", "Lemur"] },
    { word: "Dolphin",   related: ["Whale", "Porpoise", "Shark"] },
    { word: "Chameleon", related: ["Lizard", "Iguana", "Gecko"] },
    { word: "Beaver",    related: ["Otter", "Muskrat", "Badger"] }
  ],
  "Food & Drink": [
    { word: "Pizza",     related: ["Calzone", "Lasagna", "Flatbread"] },
    { word: "Sushi",     related: ["Sashimi", "Ramen", "Tempura"] },
    { word: "Coffee",    related: ["Tea", "Hot chocolate", "Espresso"] },
    { word: "Pancakes",  related: ["Waffles", "Crepes", "French toast"] },
    { word: "Tacos",     related: ["Burrito", "Quesadilla", "Enchilada"] },
    { word: "Spaghetti", related: ["Macaroni", "Ravioli", "Noodles"] },
    { word: "Ice cream", related: ["Gelato", "Sorbet", "Frozen yogurt"] },
    { word: "Popcorn",   related: ["Chips", "Pretzels", "Nachos"] },
    { word: "Chocolate", related: ["Candy", "Fudge", "Caramel"] },
    { word: "Lemonade",  related: ["Iced tea", "Orange juice", "Limeade"] }
  ],
  "Places": [
    { word: "Beach",      related: ["Lake", "Pool", "Island"] },
    { word: "Library",    related: ["Bookstore", "Archive", "Study hall"] },
    { word: "Airport",    related: ["Train station", "Bus terminal", "Harbor"] },
    { word: "Gym",        related: ["Yoga studio", "Pool", "Sports center"] },
    { word: "Zoo",        related: ["Aquarium", "Safari park", "Farm"] },
    { word: "Museum",     related: ["Art gallery", "Exhibit hall", "Planetarium"] },
    { word: "Casino",     related: ["Arcade", "Racetrack", "Lottery hall"] },
    { word: "Cinema",     related: ["Theater", "Concert hall", "Drive-in"] },
    { word: "Hospital",   related: ["Clinic", "Pharmacy", "Doctor's office"] },
    { word: "Restaurant", related: ["Cafe", "Diner", "Bistro"] }
  ],
  "Sports": [
    { word: "Soccer",     related: ["Rugby", "Hockey", "Futsal"] },
    { word: "Basketball", related: ["Netball", "Volleyball", "Dodgeball"] },
    { word: "Tennis",     related: ["Badminton", "Squash", "Ping pong"] },
    { word: "Swimming",   related: ["Diving", "Water polo", "Surfing"] },
    { word: "Boxing",     related: ["Wrestling", "Karate", "Kickboxing"] },
    { word: "Bowling",    related: ["Darts", "Billiards", "Curling"] },
    { word: "Skiing",     related: ["Snowboarding", "Sledding", "Skating"] },
    { word: "Golf",       related: ["Mini golf", "Croquet", "Frisbee golf"] },
    { word: "Cycling",    related: ["Mountain biking", "BMX", "Skateboarding"] },
    { word: "Marathon",   related: ["Sprint", "Triathlon", "Jogging"] }
  ],
  "Jobs": [
    { word: "Doctor",         related: ["Nurse", "Surgeon", "Dentist"] },
    { word: "Teacher",        related: ["Professor", "Tutor", "Principal"] },
    { word: "Chef",           related: ["Baker", "Cook", "Waiter"] },
    { word: "Pilot",          related: ["Co-pilot", "Flight attendant", "Navigator"] },
    { word: "Firefighter",    related: ["Paramedic", "Lifeguard", "EMT"] },
    { word: "Farmer",         related: ["Rancher", "Gardener", "Shepherd"] },
    { word: "Police officer", related: ["Detective", "Security guard", "Sheriff"] },
    { word: "Astronaut",      related: ["Cosmonaut", "Scientist", "Explorer"] },
    { word: "Plumber",        related: ["Electrician", "Carpenter", "Mechanic"] },
    { word: "Barber",         related: ["Hairdresser", "Stylist", "Beautician"] }
  ],
  "Around the House": [
    { word: "Refrigerator", related: ["Freezer", "Oven", "Microwave"] },
    { word: "Television",   related: ["Monitor", "Radio", "Projector"] },
    { word: "Toothbrush",   related: ["Comb", "Razor", "Toothpaste"] },
    { word: "Pillow",       related: ["Cushion", "Mattress", "Duvet"] },
    { word: "Clock",        related: ["Watch", "Timer", "Alarm"] },
    { word: "Umbrella",     related: ["Raincoat", "Parasol", "Poncho"] },
    { word: "Candle",       related: ["Lantern", "Lamp", "Torch"] },
    { word: "Mirror",       related: ["Window", "Picture frame", "Glass"] },
    { word: "Vacuum",       related: ["Broom", "Mop", "Duster"] },
    { word: "Blanket",      related: ["Quilt", "Comforter", "Throw"] }
  ],
  "Nature": [
    { word: "Rainbow",   related: ["Sunset", "Aurora", "Mirage"] },
    { word: "Volcano",   related: ["Mountain", "Geyser", "Earthquake"] },
    { word: "Ocean",     related: ["Sea", "Lake", "Gulf"] },
    { word: "Tornado",   related: ["Hurricane", "Cyclone", "Whirlwind"] },
    { word: "Desert",    related: ["Savanna", "Dunes", "Oasis"] },
    { word: "River",     related: ["Stream", "Creek", "Canal"] },
    { word: "Lightning", related: ["Thunder", "Storm", "Hail"] },
    { word: "Moon",      related: ["Sun", "Star", "Planet"] },
    { word: "Forest",    related: ["Jungle", "Woods", "Grove"] },
    { word: "Snow",      related: ["Ice", "Hail", "Frost"] }
  ],
  "Celebrities": [
    { word: "Taylor Swift",      related: ["Katy Perry", "Ariana Grande", "Adele"] },
    { word: "Cristiano Ronaldo", related: ["Lionel Messi", "Neymar", "Mbappe"] },
    { word: "Elon Musk",         related: ["Jeff Bezos", "Bill Gates", "Mark Zuckerberg"] },
    { word: "Albert Einstein",   related: ["Isaac Newton", "Stephen Hawking", "Nikola Tesla"] },
    { word: "Lady Gaga",         related: ["Madonna", "Rihanna", "Pink"] },
    { word: "Dwayne Johnson",    related: ["John Cena", "Vin Diesel", "Mark Wahlberg"] },
    { word: "Leonardo DiCaprio", related: ["Brad Pitt", "Tom Cruise", "Matt Damon"] },
    { word: "Beyonce",           related: ["Alicia Keys", "Mariah Carey", "Whitney Houston"] },
    { word: "Oprah Winfrey",     related: ["Ellen DeGeneres", "Jimmy Fallon", "Dr. Phil"] },
    { word: "Michael Jackson",   related: ["Prince", "Elvis Presley", "Justin Timberlake"] }
  ],
  "Brands": [
    { word: "Nike",       related: ["Adidas", "Puma", "Reebok"] },
    { word: "Apple",      related: ["Samsung", "Microsoft", "Sony"] },
    { word: "McDonald's", related: ["Burger King", "KFC", "Wendy's"] },
    { word: "Coca-Cola",  related: ["Pepsi", "Sprite", "Fanta"] },
    { word: "Lego",       related: ["Playmobil", "Duplo", "Mega Bloks"] },
    { word: "Google",     related: ["Yahoo", "Bing", "Microsoft"] },
    { word: "Disney",     related: ["Pixar", "Universal", "DreamWorks"] },
    { word: "Amazon",     related: ["eBay", "Alibaba", "Walmart"] },
    { word: "Ferrari",    related: ["Lamborghini", "Porsche", "Maserati"] },
    { word: "Starbucks",  related: ["Costa", "Dunkin'", "Peet's"] }
  ],
  "Household Members": [
    { word: "Jacob",     related: ["Stephen", "Anthony", "Claire"] },
    { word: "Katherine", related: ["Claire", "Mama", "Willow"] },
    { word: "Claire",    related: ["Katherine", "Jacob", "Anthony"] },
    { word: "Stephen",   related: ["Jacob", "Anthony", "Baba"] },
    { word: "Anthony",   related: ["Stephen", "Jacob", "Claire"] },
    { word: "Baba",      related: ["Mama", "Stephen", "Napoleon"] },
    { word: "Mama",      related: ["Baba", "Katherine", "Willow"] },
    { word: "Clover",    related: ["Napoleon", "Willow", "Anthony"] },
    { word: "Napoleon",  related: ["Clover", "Willow", "Baba"] },
    { word: "Willow",    related: ["Clover", "Napoleon", "Katherine"] }
  ],
  "School": [
    { word: "Pencil",      related: ["Pen", "Crayon", "Marker"] },
    { word: "Backpack",    related: ["Lunchbox", "Satchel", "Tote bag"] },
    { word: "Homework",    related: ["Quiz", "Project", "Assignment"] },
    { word: "Ruler",       related: ["Protractor", "Compass", "Tape measure"] },
    { word: "Chalkboard",  related: ["Whiteboard", "Notebook", "Bulletin board"] },
    { word: "Recess",      related: ["Lunch break", "Gym class", "Field trip"] },
    { word: "Calculator",  related: ["Abacus", "Slide rule", "Computer"] },
    { word: "Report card", related: ["Transcript", "Diploma", "Certificate"] },
    { word: "Scissors",    related: ["Stapler", "Glue stick", "Hole punch"] },
    { word: "Cafeteria",   related: ["Canteen", "Food court", "Snack bar"] }
  ]
};

// expose globally for app.js
window.WORD_PACK = WORD_PACK;
