
/**
 * GLOBAL RULES (STRICT)
 * These guidelines are injected into the system prompt to ensure quality and safety.
 */
export const STRICT_GUIDELINES = `
TYPOGRAPHY & MEDIUM RULES (MANDATORY & AGGRESSIVE)

1. Quote Integrity
- Copy the quote text exactly as provided, character-for-character.
- Do NOT paraphrase, shorten, rephrase, translate, or add emojis.
- Do NOT change punctuation or capitalization.
- If you cannot render the text clearly and correctly, leave the text area BLANK.

2. Allowed Visible Text
- The ONLY readable text in the image or video is:
  (a) the quote text, and
  (b) a small watermark: "@mantra.wayfinding".
- Both the quote and the watermark must be on the SAME physical surface.
- Never place the watermark floating in an empty corner of the frame.

3. No Other Text
- Never show the author name or source book title on the image.
- No other readable text is allowed: no logos, brands, shop signs, etc.

4. Typography Style
- The visual style of the letters should match the physical medium.
- **Readability > Decoration**.
- Letters must be clearly separated, not fused together.
- Avoid overly ornate calligraphy.

5. Layout & Contrast
- Keep the quote in a single, well-defined text block.
- Strong contrast between text and background.

6. Negative Requirements
- Avoid misspellings, broken or merged letters.
- Avoid fisheye distortion, extreme warping.
`;

export const RELATABLE_SCENES = `
MANDATORY: RELATABLE, EVERYDAY SCENES (STRICT)

The scene MUST be something people encounter in daily life. NO abstract, confusing, or surreal imagery.

✅ ALLOWED SCENES:
- Natural landscapes (mountains, beaches, forests, deserts, lakes, waterfalls, parks)
- Urban settings (cafes, streets, buildings, subway, bookstores, libraries, offices)
- Personal items (letters, postcards, journals, books, phones, notebooks)
- Everyday objects (mugs, bags, posters, signs, benches, pillows, bottles)
- Common surfaces (wood, paper, glass, metal, fabric, stone, ceramic, sand)

❌ ABSOLUTELY FORBIDDEN:
- Abstract geometric shapes or hollow circular objects
- Surreal imagery (floating objects, impossible geometry, dreamscapes)
- Confusing 3D structures (strange vessels, alien landscapes)
- Otherworldly scenes that people would not recognize
- Anything that makes people ask "What am I looking at?"
- Complex abstract art installations

GOLDEN RULE: If a 10-year-old child cannot immediately identify what they are looking at, the scene is TOO ABSTRACT. Choose something simple and familiar.

EXAMPLES OF GOOD SCENES:
- A wooden sign on a mountain trail with clouds drifting by
- Text carved on a coffee shop window with steam condensation
- A letter on a wooden desk with morning sunlight
- Quote painted on a brick wall in an urban alley
- Text written in sand on a beach with waves approaching
- A framed poster on a wall with afternoon light
- An open book on a library desk with soft lamp light
- Text on a subway station tile wall
`;

export const VIDEO_READY_ELEMENTS = `
MANDATORY: VIDEO-READY ANIMATED ELEMENTS (STRICT)

Every scene MUST include elements that can be naturally animated for smooth video conversion.

ABSOLUTELY REQUIRED (NOT OPTIONAL):
1. Include at least 5-6 animated elements total
2. AT LEAST ONE element MUST be a LIVING/MOVING element from the LIVELY ELEMENTS list below

LIVELY ELEMENTS (MUST INCLUDE AT LEAST ONE):
- Plants swaying, leaves rustling, grass moving, flowers bobbing
- Persons in background (walking, sitting, moving - distant and subtle)
- Animals in scene (birds flying, butterflies, fish swimming, insects)
- Vehicles passing by (cars, bikes, trains - distant and blurred)
- People's clothing or hair moving (if person is in scene)
- Living organisms creating movement (trees, vegetation, wildlife)

NATURAL MOVEMENTS (Include 3-4 of these):
- Leaves falling or blowing in wind
- Water flowing, waves lapping, ripples expanding
- Clouds drifting slowly across sky
- Rain falling, snow falling
- Smoke or steam rising
- Mist or fog drifting
- Grass or plants swaying
- Sand blowing or shifting

LIGHT & ATMOSPHERIC (Include 2-3 of these):
- Shadows moving gradually (sun angle changing)
- Sunlight shifting through windows or trees
- Lamp flickering subtly
- Reflections changing on glass or water
- Light rays (god rays, volumetric light)
- Bokeh lights in background
- Heat shimmer effect
- Lens flare moving

ENVIRONMENTAL EFFECTS (Include 1-2 of these):
- Dust particles floating in light beams
- Condensation forming or clearing on glass
- Candle flame flickering
- Curtains swaying gently
- Flags or fabric waving
- Papers fluttering slightly
- Flower petals falling
- Birds flying in background (distant, blurred)

SUBTLE OBJECT MOTION (Optional, add if relevant):
- Coffee cup steam rising
- Book pages turning slightly
- Pen rolling on desk
- Doors slowly opening
- Elevator numbers changing
- Clock hands moving (timelapse)

CAMERA MOTION FOR VIDEO (Choose ONE):
- Slow dolly forward TOWARDS the quote (5-10cm over 6 seconds) - PREFERRED
- Static camera with only element motion (if many lively elements present)
- Gentle pan that KEEPS quote centered (2-3 degrees over 6 seconds)
- Subtle tilt that MAINTAINS quote visibility (1-2 degrees over 6 seconds)

CRITICAL RULES:
- NEVER pan or move camera AWAY from the quote
- Quote and watermark MUST remain fully visible in frame at all times
- Moving elements should draw attention TO the quote, not distract from it
- Still frames with multiple moving elements are BETTER than camera pans with no element motion

GOAL: The static image should feel alive with natural movement, ready to resume with lively, cinematic motion that enhances the quote.
`;

export const SCENARIO_EXAMPLES = `
50 RELATABLE SCENARIO EXAMPLES (Use these for inspiration)

NATURE & OUTDOOR (10):
1. Mountain Peak Sign - Wooden trail marker on summit, clouds drifting
2. Beach in Sand - Text written in wet sand, waves approaching
3. Forest Trail Marker - Carved wooden sign, leaves falling
4. Ocean Pier Railing - Metal plaque on pier, seagulls flying
5. Desert Road Sign - Weathered sign post, heat shimmer
6. Waterfall Rock - Text on cliff, water misting
7. Garden Stone Path - Engraved stepping stone, petals falling
8. Lake Dock Sign - Wooden post at dock, water rippling
9. Autumn Leaf Pile - Text with colorful leaves, wind blowing
10. Snow-Covered Bench - Carved bench, snowflakes falling

URBAN & ARCHITECTURE (10):
11. Subway Station Wall - Tiled wall, people passing (blurred)
12. Coffee Shop Window - Etched glass, steam condensation
13. City Billboard - Large outdoor ad, city lights twinkling
14. Bookstore Shelf - Book spine with quote, camera dolly
15. Street Lamp Post - Metal plaque, light flickering
16. Brick Wall Graffiti - Painted text, shadow moving
17. Library Desk - Open book on wood, pages flutter
18. Office Lobby - Text on marble, elevator lights
19. Cafe Chalkboard - Menu board, chalk dust settling
20. Art Gallery Wall - Framed text, lighting shift

PERSONAL & INTIMATE (10):
21. Handwritten Letter - Paper on table, shadow moving
22. Journal Page - Open notebook, coffee steaming
23. Postcard - Card on table, morning light shifting
24. Sticky Note on Mirror - Bathroom mirror, steam clearing
25. Desk Calendar - Date page, pen rolling
26. Recipe Card - Kitchen counter, ingredients nearby
27. Bookmark in Book - Visible bookmark, pages turning
28. Greeting Card - Card propped open, flowers nearby
29. Notepad on Bedside - Nightstand, lamp dimming
30. Phone Lock Screen - Phone on desk, notifications

OBJECTS & PRODUCTS (10):
31. Coffee Mug - Quote on ceramic, steam rising
32. T-Shirt Design - Text on fabric, slight movement
33. Tote Bag - Canvas bag, hanging and swaying
34. Water Bottle - Text on bottle, condensation forming
35. Notebook Cover - Hardcover journal, ribbon moving
36. Poster on Wall - Framed poster, curtain shadow
37. Pillow - Embroidered text, on couch
38. Phone Case - Quote on case, screen glow changing
39. Canvas Print - Gallery wrap, lighting change
40. Laptop Sticker - Lid sticker, screen glow

SIGNAGE & DISPLAYS (10):
41. Office Motivational Poster - Corporate wall art
42. Gym Wall Sign - Text on gym wall, equipment visible
43. Yoga Studio Sign - Wooden sign, incense smoke
44. Classroom Chalkboard - Quote on board, chalk tray
45. Restaurant Menu Board - Wooden sign, candlelight
46. Hotel Welcome Card - Card on bed, curtains blowing
47. Car Dashboard Note - Note on dash, trees passing
48. Park Bench Plaque - Memorial bench, park background
49. Airport Departure Style - Digital display, letters flipping
50. Theater Marquee - Cinema letters, lights chasing
`;

export const WATERMARK_POSITIONING = `
WATERMARK INTEGRATION RULE (CRITICAL - EXACT FORMAT MATCHING)

The watermark "@mantra.wayfinding" MUST be created using the IDENTICAL technique, format, and material as the quote text.

❌ ABSOLUTELY FORBIDDEN:
- White generic text floating anywhere
- Different format than the quote (e.g., flat white text when quote is engraved)
- Watermark at screen bottom-right corner (absolute positioning)
- Semi-transparent overlay style
- Any treatment that looks "added later" or "pasted on"

✅ MANDATORY REQUIREMENTS:
1. IDENTICAL TECHNIQUE: If quote is engraved 5mm deep, watermark is engraved 5mm deep
2. IDENTICAL MATERIAL: If quote is gold paint, watermark is gold paint
3. IDENTICAL SURFACE: Watermark must be on the SAME physical object (stone, wood, glass, metal, etc.)
4. IDENTICAL PHYSICS: Same lighting interaction, same shadows, same depth, same texture
5. IDENTICAL WEATHERING: If quote shows age/wear, watermark shows same age/wear
6. RELATIVE POSITIONING: Positioned 2% margin from the QUOTE'S bottom-right edge (NOT screen edge)

INTEGRATION EXAMPLES:
- If quote is carved into stone → watermark is carved into SAME stone with SAME depth and SAME tool marks
- If quote is painted on brick wall → watermark is painted on SAME wall with SAME paint and SAME brush strokes
- If quote is etched on glass → watermark is etched on SAME glass with SAME frosted effect
- If quote is embossed on metal → watermark is embossed on SAME metal with SAME raised depth
- If quote is written in sand → watermark is written in SAME sand with SAME finger/stick width

VISUAL VERIFICATION TEST:
"If someone covered the text content, would they be able to tell quote from watermark based on technique alone?"
Answer must be NO - they should be indistinguishable in format.

POSITIONING RULE:
- Calculate the quote text bounding box
- Position watermark at quote's bottom-right corner with 2% margin
- Both quote and watermark must appear as ONE unified inscription created by the same artist at the same time

SIZE:
- Watermark should be approximately 10-15% the size of the main quote text
- Small enough to not distract, large enough to be readable

THE WATERMARK MUST LOOK LIKE IT WAS CREATED BY THE SAME ARTIST, WITH THE SAME TOOLS, ON THE SAME SURFACE, AT THE SAME TIME AS THE QUOTE.
`;

export const VIDEO_LOGIC = `
VIDEO LOGIC (CRITICAL CAMERA DIRECTION RULES)

CORE PRINCIPLE: The video must enhance quote visibility, NEVER diminish it.

CAMERA DIRECTION RULES:
- If camera moves, it MUST move TOWARDS the quote (slow dolly forward)
- NEVER pan or move camera AWAY from the quote
- NEVER move camera in a direction that loses focus on the text
- Quote and watermark MUST remain fully visible and centered in frame at ALL times
- If unsure about camera movement, use STATIC camera with moving elements instead

PREFERRED VIDEO APPROACHES (in order):
1. STATIC camera with 5-6 lively moving elements (plants, persons, shadows, animals, vehicles, atmospheric effects)
2. SLOW DOLLY FORWARD towards the quote (5-10cm over 6 seconds) with 3-4 moving elements
3. MINIMAL pan that keeps quote centered (only if it enhances composition)

FORBIDDEN CAMERA MOVEMENTS:
- Panning away from quote
- Dollying backward away from text
- Any movement that causes quote to exit frame
- Any movement that reduces text readability
- Fast or jarring camera movements

MOTION PRIORITY:
- Element motion (leaves, steam, persons, animals) is MORE IMPORTANT than camera motion
- A still frame with rich moving elements is BETTER than a moving camera with static elements
- Motion should draw the viewer's eye TO the quote, not away from it

FRAME RULES:
- First frame: Quote clearly visible and readable
- Middle frames: Quote remains clearly visible and readable
- Last frame: Quote remains clearly visible and readable
- The quote is the star - everything else supports it
`;

export const CAMERA_ANGLES = `
CAMERA ANGLE RESTRICTIONS (STRICT)
- **VIEWING ANGLE**: The camera MUST be positioned FRONTAL / PARALLEL to the text surface.
- **PROHIBITED**:
  - NO LOW ANGLES.
  - NO WORM'S EYE VIEW.
  - NO EXTREME GRAZING ANGLES (text disappearing into distance).
  - NO OBLIQUE ANGLES > 30 degrees.
- **GOAL**: The text should look like a flat scan or a direct poster shot, even if the environment is 3D.
`;
