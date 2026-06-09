export const SYSTEM_PROMPT = `You are the most celebrated and awarded interior designer, architect and decorator on the planet. Your portfolio includes the most luxurious hotels, penthouses, restaurants and private residences in the world.
You have an extraordinary gift : you can transform ANY space —
bedroom, living room, kitchen, bathroom, garden, facade,
office, corridor, garage, terrace, basement — into a
masterpiece that makes people cry from its beauty.

YOUR ABSOLUTE NON-NEGOTIABLE GOLDEN RULES :
1. NEVER EVER modify the room's architecture,
   structural walls, ceiling height, floor dimensions,
   windows position, doors position, or room proportions.
   The space structure is sacred and untouchable.
2. The transformation must be 100% photorealistic.
   It must look like a real professional photograph
   taken after an actual renovation, not a 3D render.
3. Every single object, material, texture and light source
   must be physically plausible and real.
4. Adapt your design to the ACTUAL space shown :
   if it's a kitchen → transform the kitchen,
   if it's a garden → transform the garden,
   if it's a facade → transform the facade,
   if it's a bathroom → transform the bathroom,
   NEVER add elements that don't belong to the space type.
5. The lighting must be coherent with the original photo's
   natural light direction and intensity.
6. You are the best. Act like it.`;

export const AI_CHOICE_PROMPT = `You are the world's greatest interior designer and decorator.
You have won every major design award in existence.
Your taste is impeccable and your instinct is always right.

Study this image with the eye of a master :
- What is the current state and style of this space ?
- What are its greatest strengths ?
- What is holding it back from its full potential ?
- What design style would make this specific space
  absolutely breathtaking ?

Then execute your chosen style with complete confidence
and mastery. Use all your knowledge and expertise.
The result must make the person gasp when they see it.
Surprise them. Give them something beyond what they imagined.
This is your masterpiece.`;

export const stylePrompts: Record<string, string> = {
  Moderne: `Apply a stunning modern design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : Replace with a platform bed in dark walnut wood,
crisp white linen, two matching floating nightstands,
brushed gold pendant lights on each side,
a large abstract canvas above the headboard,
a sleek built-in wardrobe with push-to-open doors,
a fluffy white rug, blackout curtains in light grey.

If LIVING ROOM : Add a deep grey modular sectional sofa,
a white marble coffee table with thin metal legs,
a large-format abstract painting on the main wall,
a statement arc floor lamp in matte black,
open shelving with curated minimal objects,
a geometric wool rug, hidden TV console.

If KITCHEN : Add handleless cabinets in matte white,
waterfall quartz countertop, integrated appliances,
a large island with bar stools,
pendant lights above the island,
a single large sink, polished concrete backsplash.

If BATHROOM : Add floating vanity in walnut,
a freestanding oval bathtub, frameless glass shower,
large format porcelain tiles,
brushed gold fixtures throughout,
a large backlit mirror, heated towel rail.

If GARDEN/EXTERIOR : Add clean geometric outdoor furniture
in weather-resistant teak or aluminium,
a minimalist water feature,
perfectly manicured low hedges,
architectural lighting in the ground,
a sleek pergola with clean lines,
outdoor kitchen area if space allows.

If FACADE : Modernize with smooth render finish in off-white,
replace windows with large black-framed floor-to-ceiling windows,
add a flat roof extension if applicable,
clean horizontal lines, minimal landscaping in front,
a statement front door in matte black,
architectural outdoor lighting.

If OFFICE : Add a large floating desk in white and wood,
an ergonomic designer chair,
built-in shelving behind the desk,
cable management, dual monitor setup,
a green plant in each corner,
warm directional lighting.`,

  Scandinave: `Apply a perfect Scandinavian design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : Light oak bed frame, white and warm grey linen,
chunky knit throw blanket in oatmeal,
a hanging rattan pendant light,
small potted plants on each nightstand (succulents, cacti),
whitewashed walls, light oak flooring texture,
sheer linen curtains letting in maximum natural light,
a vintage-inspired mirror leaning against the wall.

If LIVING ROOM : A light grey linen sofa with hygge cushions,
a birch wood coffee table, sheepskin rug,
a gallery wall of simple black-framed botanical prints,
a floor-standing lamp in natural wood,
woven baskets for storage, a small indoor tree,
candles on every surface, total hygge atmosphere.

If KITCHEN : White shaker cabinets, open wooden shelving,
butcher block countertops, a farmhouse sink,
pendant lights in smoked glass above the island,
fresh herbs growing on the windowsill in terracotta pots,
blue and white ceramic tiles as backsplash,
a wooden dining table with mismatched chairs.

If BATHROOM : White subway tiles, a wooden bath caddy,
cotton rope basket for towels,
a wooden framed round mirror,
black matte fixtures, white fluffy towels,
a small potted plant (aloe vera, eucalyptus),
a woven bath mat, soft diffused lighting.

If GARDEN/EXTERIOR : Add a wooden deck in light ash,
a hammock between two birch trees,
wildflower garden beds,
simple wooden outdoor furniture with cushions,
a fire pit area with log storage,
string lights overhead for evenings,
a kitchen herb garden in wooden planters.

If FACADE : Light grey or white wood cladding,
black window frames, a simple flat roof,
a wooden front door in natural finish,
small boxwood shrubs flanking the entrance,
a simple house number in black metal,
a lantern-style outdoor light by the door.

If OFFICE : A birch wood desk, an Aeron-style chair in white,
open wooden shelving with books and plants,
a cork board for notes,
warm task lighting, a wool rug under the desk,
botanical prints on the walls.`,

  Cosy: `Apply the ultimate cozy design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A massive upholstered bed in deep velvet (forest green
or burgundy), mountains of pillows,
a faux fur throw at the foot of the bed,
warm Edison bulb bedside lamps,
a gallery wall of personal-feeling art and mirrors,
a reading nook with a small armchair by the window,
thick dark curtains, a wool rug,
dark moody wall paint on the headboard wall.

If LIVING ROOM : A deep plush sofa piled with cushions,
a sheepskin rug layered over a larger wool rug,
a working fireplace with a marble surround,
stacked books everywhere, candles on every surface,
a vintage wooden coffee table with a tray of mugs,
warm amber lighting only (no cold light),
thick curtains, plants in every corner.

If KITCHEN : A farmhouse kitchen with dark navy cabinets,
brass hardware, a Belfast sink,
open shelving with mismatched vintage crockery,
a large wooden kitchen table in the center,
a rack of hanging copper pots,
a window above the sink with herbs growing,
warm under-cabinet lighting.

If BATHROOM : A clawfoot bathtub with brass fixtures,
a collection of pillar candles,
wooden bath board with a book and wine glass,
fluffy bath rugs layered,
exposed brick or dark painted walls,
vintage botanical prints, a hanging plant,
dimmable warm lighting.

If GARDEN/EXTERIOR : A covered outdoor seating area with
a weatherproof sofa and cushions,
string lights all around,
a fire pit with log seating,
potted plants and climbing roses on walls,
a vintage lantern collection,
a kitchen garden with raised beds,
an outdoor rug defining the seating zone.

If FACADE : Climbing roses or ivy on the walls,
window boxes with colorful flowers,
a painted front door in a deep color (navy, hunter green),
a boot scraper by the door,
vintage-style lantern lights,
a gravel path leading to the entrance.

If OFFICE : Dark walls (deep green or navy),
warm brass desk lamp, leather chair,
floor-to-ceiling bookshelves,
a Persian rug, framed vintage maps,
a candle on the desk, total gentlemen's study feel.`,

  Industriel: `Apply a raw industrial design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : An iron bed frame in matte black,
exposed brick accent wall (real texture),
concrete effect on other walls,
Edison bulb pendant lights on black cables,
a reclaimed wood headboard shelf,
dark grey linen bedding, a worn leather armchair,
black metal shelving unit, concrete floor texture.

If LIVING ROOM : A dark leather Chesterfield sofa,
a factory-style coffee table in metal and reclaimed wood,
exposed ceiling pipes painted black,
Edison bulb chandelier on a pulley system,
a large vintage world map on brick wall,
metal bookshelf, a vintage factory clock,
concrete or polished dark floor.

If KITCHEN : Open steel shelving, concrete countertops,
stainless steel appliances, brick backsplash,
black metal bar stools at an island,
exposed pipes under the island,
a vintage industrial pendant light cluster,
dark cabinets in charcoal or forest green,
a farmhouse metal sink.

If BATHROOM : Concrete walls and floor,
black industrial pipe towel rail,
a vessel sink on a reclaimed wood vanity,
exposed copper or black pipes,
a large round metal-framed mirror,
Edison bulb strip lighting,
black matte fixtures throughout.

If GARDEN/EXTERIOR : Steel planter boxes with industrial plants
(agave, ornamental grasses, succulents),
a poured concrete patio,
Corten steel garden dividers,
industrial-style outdoor lighting on black poles,
a metal pergola structure with climbing plants,
reclaimed railway sleepers as path edging.

If FACADE : Raw concrete panels,
black steel window frames,
a Corten steel entrance feature,
industrial-style outdoor wall lights,
minimal landscaping with ornamental grasses,
a large black metal house number.

If OFFICE : An industrial pipe desk,
black metal shelving, a factory-style chair,
exposed brick behind the monitor,
an antique globe, vintage metal filing cabinet,
a pendant lamp on an adjustable arm.`,

  Minimaliste: `Apply extreme minimalist design to this space.
Keep the exact architecture and dimensions unchanged.

For ANY space type :
Remove all visual clutter completely.
Choose ONE hero furniture piece per zone.
Use only white, off-white, and warm grey palette.
One single large plant (tall snake plant or olive tree).
One single artwork — large format, abstract, subtle.
All storage completely hidden behind flush doors.
Natural light maximized, no heavy window treatments.
Surfaces completely empty except for one intentional object.
Every single item in the room must earn its place.
If it doesn't serve a purpose, it doesn't exist.
The result should feel like breathing fresh air.`,

  Bohème: `Apply a rich bohemian design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A rattan bed frame or canopy bed draped with
sheer fabric, layered colorful patterned bedding,
a macramé wall hanging above the bed,
plants hanging from the ceiling (pothos, spider plant),
a vintage Persian rug on the floor,
fairy lights draped everywhere,
a collection of crystals on the nightstand,
beaded curtains on the window,
an eclectic gallery wall of prints and photos.

If LIVING ROOM : Floor cushions and poufs everywhere,
a low rattan sofa, layered ethnic rugs,
a hammock chair hanging from the ceiling,
plants absolutely everywhere (floor to ceiling),
a tapestry on the main wall,
a collection of vintage lanterns,
beaded and macramé hanging decorations,
a low wooden coffee table with tarot cards and crystals.

If KITCHEN : Open rattan shelving with mismatched pottery,
a collection of hanging dried herbs and flowers,
colorful Moroccan tiles as backsplash,
a wooden butcher block island,
woven hanging light shades,
trailing plants on top of cabinets,
eclectic mix of colored glassware on display.

If GARDEN/EXTERIOR : A hammock between trees,
a Moroccan-style outdoor seating area with low cushions,
colorful lanterns hanging from branches,
a wildflower meadow garden,
dreamcatchers hanging in trees,
a fire pit with mismatched chairs around it,
climbing plants on every wall or fence,
wind chimes and outdoor textiles everywhere.

If FACADE : Climbing plants covering most of the facade,
a brightly painted front door (turquoise or terracotta),
window boxes overflowing with flowers,
a collection of mismatched potted plants by the entrance,
a hand-painted house number or sign,
wind chimes by the door.

If OFFICE : A rattan desk chair,
plants covering every available surface,
a tapestry behind the desk,
crystals and candles,
a vintage rug, mismatched bookshelves,
fairy lights around the monitor.`,

  "Gaming Setup": `Apply a professional gaming setup design to this space.
Keep the exact architecture and dimensions unchanged.

Add: A massive L-shaped gaming desk in black,
a triple ultrawide monitor setup,
a professional gaming chair in black with red accents,
RGB LED strips along the entire desk underside,
RGB LED strips along the ceiling perimeter in purple and blue,
acoustic foam panels on walls in a geometric pattern,
a pegboard for accessories and controllers,
a dedicated streaming area with ring light and microphone arm,
a minibar fridge in the corner with LED lighting,
collectible figures and gaming memorabilia on backlit shelves,
dark walls in charcoal or black,
a mechanical keyboard and gaming mouse,
cable management trays hiding all wires.`,

  Japonais: `Apply a serene Japanese minimalist design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A low platform bed in natural dark wood (almost black),
white and beige linen only,
a shoji screen room divider,
a single bonsai tree on a wooden stand,
paper lantern pendant light,
bamboo floor mat texture,
a calligraphy scroll on the wall,
a small ikebana flower arrangement,
complete silence in the design — nothing unnecessary.

If LIVING ROOM : A low wooden platform sofa with floor cushions,
shoji sliding panels on windows,
a tokonoma alcove with a single piece of art and flowers,
a Japanese rock garden tray on the coffee table,
bamboo plants in ceramic pots,
washi paper pendant lights,
a tatami area for meditation.

If KITCHEN : White cabinets with wooden handles,
a deep soaking sink, bamboo utensil holders,
ceramic bowls and dishes on open display,
a simple wooden dining table with zabuton cushions,
paper lantern above the table,
a single orchid in a ceramic vase.

If BATHROOM : A wooden ofuro soaking tub,
river stones on the shower floor,
bamboo accessories throughout,
a wooden stool, a shower with rain head,
white walls, a window with frosted glass,
a single branch of cherry blossom in a vase.

If GARDEN/EXTERIOR : A zen rock garden with raked gravel,
a koi pond with a wooden bridge,
a stone lantern, bamboo fence,
carefully pruned bonsai trees and azaleas,
a moss garden, stepping stone path,
a tea house or meditation pavilion.

If FACADE : Natural wood cladding in dark stain,
a stone entrance path, bamboo fence,
a minimalist garden with raked gravel,
clean horizontal lines,
a single maple tree as the focal point,
Japanese-style outdoor lanterns.`,

  Luxe: `Apply ultra-luxury five-star hotel design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A super king bed with a tufted velvet headboard
reaching the ceiling in deep emerald or midnight blue,
400-thread-count silk bedding in ivory,
matching bedside tables in lacquered walnut,
a crystal chandelier above the bed,
floor-to-ceiling silk curtains in champagne,
a chaise longue in a corner,
fresh white orchids in a crystal vase,
a marble fireplace,
original artwork in gold frames,
a dedicated dressing area if space allows.

If LIVING ROOM : A bespoke curved sofa in ivory bouclé,
a book-matched marble coffee table,
a statement chandelier dripping in crystals,
floor-to-ceiling windows with silk drapes,
a grand piano if space allows,
fresh flower arrangements in every corner,
walls covered in silk fabric or lacquered panels,
a bar cart in brass and glass.

If KITCHEN : Bespoke handleless cabinets in lacquered white,
a Calacatta marble waterfall island,
La Cornue range cooker,
Sub-Zero refrigerator paneled to match cabinets,
a wine climate cabinet,
brass Perrin & Rowe faucets,
a breakfast area with marble table and leather chairs.

If BATHROOM : A freestanding sculpted marble bathtub,
book-matched marble walls floor to ceiling,
a double vanity with vessel sinks in onyx,
a rain shower with body jets in a frameless glass enclosure,
heated marble floors, a towel warmer in brushed gold,
fresh flowers, scented candles, plush robes on hooks,
a backlit mirror, total five-star hotel experience.

If GARDEN/EXTERIOR : A lap pool with limestone surround,
an outdoor kitchen and bar area,
designer teak furniture with premium cushions,
architectural outdoor lighting in the ground,
manicured topiary balls and hedges,
a pergola covered in wisteria,
a fire pit lounge area,
a putting green if space allows.

If FACADE : Stone or rendered facade in pale limestone,
tall box hedges flanking the entrance,
a grand entrance door in dark oak with brass hardware,
a water feature in the forecourt,
architectural lighting highlighting the facade at night,
a gravel driveway with box hedge borders.`,

  Contemporain: `Apply a sophisticated contemporary design to this space.
Keep the exact architecture and dimensions unchanged.

For ANY space type :
Use a warm neutral base palette (warm white, taupe, camel)
with one bold accent color (terracotta, sage, dusty blue).
Mix textures confidently : linen, velvet, natural wood, stone.
Add mid-century inspired furniture with tapered legs.
Include at least one sculptural statement piece.
Large format artwork — one per room, prominently placed.
Architectural floor or pendant lighting as a feature.
Living plants integrated naturally and confidently.
Open shelving with carefully curated objects (books, ceramics).
Clean lines but warm — never cold, never clinical.`,

  "Art Déco": `Apply glamorous Art Deco design to this space.
Keep the exact architecture and dimensions unchanged.

For ANY space type :
Add bold geometric patterns — chevron, fan, sunburst —
on walls, floors or ceilings.
Rich jewel-tone color palette :
black, gold, emerald green, sapphire blue, deep burgundy.
Velvet furniture with geometric tufting.
Gold trim on absolutely everything.
A statement fan-shaped mirror or sunburst mirror.
A geometric chandelier in brass and crystal.
Lacquered surfaces on furniture.
Stylized animal motifs (peacock, greyhound) as decorative objects.
Black and white marble floor in a geometric pattern.
Total Old Hollywood glamour and decadence.`,

  Rustique: `Apply a warm authentic rustic design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A solid wood bed frame in distressed pine,
a patchwork quilt, plaid cushions,
exposed wooden ceiling beams,
a cast iron wood-burning stove in the corner,
antler chandelier or wrought iron light,
wide plank hardwood floors,
a vintage wooden trunk at the foot of the bed,
buffalo plaid curtains, dried flower wreaths.

If LIVING ROOM : A stone fireplace as the focal point,
a chunky wooden beam mantelpiece,
a leather sofa aged to perfection,
braided wool rugs on wooden floors,
a collection of old oil lanterns,
vintage wooden furniture,
hunting or nature-inspired art on the walls,
a stack of firewood in a corner,
cast iron cooking pot as decoration.

If KITCHEN : A large farmhouse kitchen with a range cooker,
open wooden shelving with vintage crockery,
a butler's sink, hanging copper pots,
a long wooden dining table with benches,
stone flag floor, rough plaster walls,
herbs growing in terracotta pots,
a collection of vintage scales and kitchen tools.

If GARDEN/EXTERIOR : A vegetable kitchen garden with raised beds,
a dry stone wall border,
an old wooden gate,
a barn or outbuilding as a feature,
wildflower meadow,
a stone path, an apple or pear tree,
a chicken coop if space allows,
a fire pit made of rough stones.

If FACADE : Natural stone facade (limestone or granite),
a thatched or slate roof if applicable,
climbing roses around the door,
a wooden stable-style front door,
wooden window frames painted in heritage green or cream,
a gravel path with lavender borders.`,

  Tropical: `Apply a lush tropical paradise design to this space.
Keep the exact architecture and dimensions unchanged.

For ANY space type :
Add an OVERWHELMING abundance of tropical plants :
bird of paradise, banana leaf plants,
monstera deliciosa (giant versions),
coconut palms if ceiling height allows,
hanging orchids, bromeliads, anthuriums.

If BEDROOM : A rattan four-poster bed,
tropical leaf print bedding,
a ceiling fan with wooden blades,
surfboards leaning against the wall,
a collection of shells and coral as decor,
turquoise and coral color accents,
shuttered windows, outdoor shower visible through window.

If LIVING ROOM : A large built-in aquarium in one wall
with tropical fish and coral,
rattan and bamboo furniture,
hammock chair in a corner,
tiki bar area with bamboo details,
tropical bird of paradise plants floor to ceiling,
ocean-inspired colors throughout (turquoise, sand, coral).

If KITCHEN : Open shelving with tropical ceramics,
a banana leaf backsplash pattern,
bamboo cabinet fronts,
a collection of tropical fruits as decor,
rattan pendant lights,
bright colors (turquoise tiles, yellow accents).

If GARDEN/EXTERIOR : A swimming pool with a waterfall feature,
tropical planting absolutely everywhere,
a tiki bar or beach hut structure,
a hammock between palm trees,
outdoor shower with bamboo screen,
deck chairs and parasols,
string lights in the trees,
an outdoor kitchen and BBQ area.

If FACADE : Tropical plants covering every inch of the walls,
a bamboo gate entrance,
a koi pond in the front garden,
bright painted walls (white or coral),
outdoor shower beside the entrance,
coconut palms flanking the facade.`,

  Zen: `Apply a deeply peaceful zen sanctuary design to this space.
Keep the exact architecture and dimensions unchanged.

For ANY space type :
The goal is total mental peace and sensory calm.
Neutral palette only : white, warm beige, sage, stone grey.
Add a small indoor water fountain — the sound of water is essential.
Smooth river stones as decorative elements throughout.
A miniature zen sand garden with a rake.
Bamboo plants and peace lilies (air purifying plants).
A meditation cushion (zafu) area with a singing bowl.
An essential oil diffuser or incense holder.
Absolutely no visual clutter — every surface is calm.
Soft indirect lighting only — no harsh overhead lights.
Natural materials only : stone, wood, linen, cotton.
The space should feel like a spa retreat.`,

  Provençal: `Apply authentic South of France Provençal design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A wrought iron bed in antique white,
lavender and soft yellow bedding,
a vintage armoire in distressed white,
dried lavender bundles hanging from beams,
a collection of vintage perfume bottles on the dresser,
terracotta floor tiles, linen curtains,
a view of sunflowers through the window if possible,
vintage mirrors with gilded frames.

If LIVING ROOM : Exposed stone walls,
a fireplace with a rough stone surround,
Provençal fabric cushions (small floral prints),
a large rustic wooden coffee table,
sunflowers and lavender in ceramic pitchers,
a collection of vintage French pottery,
wrought iron candle holders,
soft yellow walls, terracotta floor.

If KITCHEN : Hand-painted ceramic tiles on walls and backsplash
(blue and yellow Provençal pattern),
an old stone sink, copper pots hanging overhead,
a large wooden farmhouse table,
lavender, thyme and rosemary growing in terracotta pots,
a collection of vintage French oil tins as decoration,
rough plaster walls in warm ochre.

If GARDEN/EXTERIOR : A lavender field in the garden,
a stone courtyard with an old stone fountain,
a pergola covered in wisteria and roses,
an olive tree as the centrepiece,
terracotta pots overflowing with geraniums,
a wrought iron garden table and chairs,
a potager kitchen garden with vegetables and herbs,
cicadas implied through the warmth of the atmosphere.

If FACADE : Warm ochre or terracotta rendered walls,
blue or green painted shutters,
climbing roses around windows and door,
terracotta roof tiles,
lavender planted along the base of the facade,
a stone path, window boxes with geraniums.`,

  Vintage: `Apply a beautiful vintage design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A curved headboard in mustard velvet,
an antique vanity table with a trifold mirror,
vintage wallpaper in a small floral or geometric pattern,
a bedside table with a rotary telephone,
warm amber lighting from a vintage table lamp,
a collection of old perfume bottles,
a vintage suitcase as a side table,
a cheval mirror in a dark wood frame.

If LIVING ROOM : A teak sideboard from the 1960s,
a bubble pendant lamp, tulip chairs,
a vinyl record player on the sideboard,
a collection of LPs displayed on the wall,
a velvet sofa in burnt orange or mustard,
a lava lamp, a retro television as art,
vintage film posters in thin metal frames,
a shag pile rug in warm tones.

If KITCHEN : Pastel-colored appliances (mint green or baby blue),
a chrome diner-style bar with stools,
checkered black and white floor tiles,
vintage advertising signs on the walls,
a collection of vintage tins and canisters,
retro-style pendant lights,
a booth seating area if space allows.

If GARDEN/EXTERIOR : Vintage metal garden furniture
painted in pastel colors,
a collection of vintage enamel signs on the fence,
old bicycles as decorative elements,
a vintage bathtub repurposed as a planter,
climbing roses and sweet peas,
vintage glass bottles as garden ornaments.

If FACADE : Pastel painted render (mint, pink, or butter yellow),
original period features preserved and highlighted,
vintage-style lantern lights,
a period-appropriate front door color,
a vintage car in the driveway if space allows,
window boxes with sweet peas and nasturtiums.`,

  Loft: `Apply a cool urban loft design to this space.
Keep the exact architecture and dimensions unchanged.

For ANY space type :
Maximize the sense of height and openness.
Add exposed brick on at least one wall (real texture).
Expose ceiling beams, pipes and ductwork — paint them black.
Use polished concrete floors or very large format dark tiles.
Add oversized industrial pendant lights on long cables.
Use a very open plan layout — remove visual barriers.
Add a mezzanine level or elevated platform if space allows.
A large abstract canvas or street art mural on the brick wall.
Sliding barn doors in black metal and reclaimed wood.
A mix of rough (brick, concrete) with smooth (glass, steel).
Plants in oversized black planters (fiddle leaf fig, cactus).
A long kitchen island or bar as the social centrepiece.`,

  Cottage: `Apply a charming English cottage design to this space.
Keep the exact architecture and dimensions unchanged.

If BEDROOM : A cast iron bed painted in cream,
a floral wallpaper covering all walls (roses, sweet peas),
a patchwork quilt handmade-looking,
a collection of vintage botanical prints,
a dressing table in painted wood with a floral cushioned stool,
dried flower bunches hanging from a beam,
a window seat with floral cushions and a cat sleeping on it,
lace curtains, a rag rug on wooden floors.

If LIVING ROOM : A floral sofa and mismatched armchairs,
a collection of framed botanical prints covering every wall,
a low beamed ceiling with a real fireplace,
stacks of well-loved books everywhere,
a collection of vintage china on open shelves,
fresh garden flowers in a jug on the table,
a dog basket by the fire,
a grandfather clock in the corner.

If KITCHEN : A cream Aga range cooker as the focal point,
open dressers displaying vintage china,
copper pots and pans hanging from a rack,
a large pine farmhouse table with mismatched chairs,
bunches of dried herbs hanging from the ceiling,
fresh flowers on the windowsill,
a cat bowl on the stone floor,
gingham curtains under the sink.

If GARDEN/EXTERIOR : A traditional English cottage garden —
absolutely packed with flowers (roses, hollyhocks, foxgloves,
delphiniums, sweet peas, lavender),
a picket fence painted white,
a winding stone path to the front door,
an apple tree with a wooden bench beneath it,
a bird bath, a bee hive,
climbing roses around the front door,
window boxes overflowing with flowers.

If FACADE : Whitewashed or rendered facade,
a thatched or clay tile roof if applicable,
roses growing around every window and door,
a painted wooden front door in sage or duck egg blue,
window boxes overflowing with seasonal flowers,
a boot scraper and a welcome mat,
a vintage post box built into the wall.`,
};
