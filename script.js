/* ============================================================
   COUNTRY EXPLORER, PART 2: ASK THE FIELD GUIDE — script.js
   STUDENT STARTER
   ------------------------------------------------------------
   Last week (Part 1) you used a GET request:
     Request -> Receive -> Parse -> Display

   Today you'll use a POST request to talk to an AI:
     User Question + Country Data -> POST to AI -> Generated Answer -> Display

   The Part 1 Country Explorer is already finished below.
   Your job: Steps 1-6. If you finish, try Steps 7-10.
   ============================================================ */

// --- Element references (Part 1 — already done) --------------
const searchBtn = document.getElementById("searchBtn");
const countryInput = document.getElementById("countryInput");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("errorMessage");
const resultCard = document.getElementById("resultCard");
const flagImg = document.getElementById("flagImg");
const countryNameEl = document.getElementById("countryName");
const capitalEl = document.getElementById("capitalValue");
const regionEl = document.getElementById("regionValue");
const populationEl = document.getElementById("populationValue");
const languagesEl = document.getElementById("languagesValue");

// Part 2 elements that are already selected for you
const fieldGuideEl = document.getElementById("fieldGuide");
const guideCountryNameEl = document.getElementById("guideCountryName");

// Your class worker URL. The worker holds the OpenAI key,
// so the key NEVER goes in this file.
const WORKER_URL = "PASTE-YOUR-WORKER-URL-HERE";

/* ============================================================
   STEP 1: Select the Field Guide elements and connect
   the Ask button.
   ------------------------------------------------------------
   Look in index.html for these ids:
     questionInput, askBtn, guideResponse
   Then add a click event listener to the Ask button that
   calls askFieldGuide.
   ============================================================ */
// TODO: const questionInput = ...
// TODO: const askBtn = ...
// TODO: const guideResponseEl = ...
// TODO: askBtn.addEventListener(...)


/* ============================================================
   STEP 2 (part 1): Create a variable to remember the country.
   Start it as null (nothing explored yet).
   ============================================================ */
// TODO: let currentCountry = ...


// --- Part 1: connect the Explore button (already done) --------
searchBtn.addEventListener("click", fetchCountry);

async function fetchCountry() {
  const countryName = countryInput.value.trim();
  if (!countryName) return;

  showLoading();

  try {
    const API_KEY = ""; // REST Countries v5 key (same as Part 1)
    const url =
      `https://api.restcountries.com/countries/v5?q=${encodeURIComponent(countryName)}` +
      `&response_fields=names.common,capitals,region,population,languages,flag.url_png,flag.description`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      throw new Error("Country not found");
    }

    const data = await response.json();
    const objects = data.data.objects;

    if (!objects || objects.length === 0) {
      throw new Error("Country not found");
    }

    const country = objects[0];

    countryNameEl.textContent = country.names.common;
    flagImg.src = country.flag.url_png;
    flagImg.alt = country.flag.description || `Flag of ${country.names.common}`;
    capitalEl.textContent = country.capitals[0].name;
    regionEl.textContent = country.region;
    populationEl.textContent = country.population.toLocaleString();
    languagesEl.textContent = country.languages
      .map((lang) => lang.name)
      .join(", ");

    hideLoading();
    resultCard.classList.remove("hidden");
    errorEl.classList.add("hidden");

    /* ----------------------------------------------------------
       STEP 2 (part 2): Save the country and show the Field Guide.
       1. Store `country` in currentCountry
       2. Put the country's name in guideCountryNameEl
       3. Remove the "hidden" class from fieldGuideEl
       ---------------------------------------------------------- */
    // TODO


  } catch (error) {
    hideLoading();
    resultCard.classList.add("hidden");
    fieldGuideEl.classList.add("hidden");
    errorEl.textContent = `We couldn't find "${countryName}". Check the spelling and try again.`;
    errorEl.classList.remove("hidden");
    console.error(error);
  }
}

/* ============================================================
   STEP 3: Create askFieldGuide()
   ------------------------------------------------------------
   Inside it:
   - Read the question from questionInput (use .trim())
   - If there is no currentCountry, show
     "Explore a country first" in guideResponseEl and return
   - If the question is empty, show "Type a question first"
     and return
   ============================================================ */
async function askFieldGuide() {
  // TODO: read and validate the question


  /* ----------------------------------------------------------
     STEP 4: Build the messages array.
     ----------------------------------------------------------
     AI chat APIs expect an array of { role, content } objects:
       - role "system" -> the rules. Use buildSystemPrompt(currentCountry)
       - role "user"   -> the visitor's question
     ---------------------------------------------------------- */
  // TODO: const messages = [ ... ];


  /* ----------------------------------------------------------
     STEP 6 (part 1): Loading state.
     Show "Consulting the field notes..." in guideResponseEl
     BEFORE you send the request.
     ---------------------------------------------------------- */
  // TODO


  /* ----------------------------------------------------------
     STEP 6 (part 2): Wrap Step 5 in try { } catch (error) { }
     In the catch, show a friendly error in guideResponseEl
     and console.error the real error.
     ---------------------------------------------------------- */

  /* ----------------------------------------------------------
     STEP 5: Send the POST request, parse, and display.
     ----------------------------------------------------------
     const response = await fetch(WORKER_URL, {
       method: ...,                                  // "POST"
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ messages: messages })
     });

     - If !response.ok, throw a new Error
     - Convert the response with await response.json()
     - console.log it and look at the shape!
     - The AI's text lives at: data.choices[0].message.content
     - Put that text into guideResponseEl.textContent
     ---------------------------------------------------------- */
  // TODO

}

/* ============================================================
   STEP 4 (helper — already built): the system prompt.
   Read it! This is where the AI gets its rules and facts.
   ============================================================ */
function buildSystemPrompt(country) {
  const facts = [
    `Country: ${country.names.common}`,
    `Capital: ${country.capitals[0].name}`,
    `Region: ${country.region}`,
    `Population: ${country.population.toLocaleString()}`,
    `Languages: ${country.languages.map((lang) => lang.name).join(", ")}`,
  ].join("\n");

  return `You are the National Geographic Field Guide, a friendly expert who helps visitors learn about countries.

Here are verified facts about the country the visitor is exploring:
${facts}

Only answer questions about ${country.names.common}. Keep answers short, warm and family-friendly.`;
}

/* ============================================================
   STRETCH GOALS (Steps 7-10)
   ------------------------------------------------------------
   STEP 7: Tighten the guardrails in buildSystemPrompt().
     Add rules for: staying on topic (and steering back politely),
     the Nat Geo voice, a 100-word limit, and saying "I'm not
     sure" instead of guessing. Test it with an off-topic question.

   STEP 8: Give the Field Guide a memory.
     Create a `conversation` array. Push each user question and
     each AI reply ({ role: "assistant", content: reply }) into it,
     and send [system, ...conversation] as your messages.
     Reset it when a new country is explored.

   STEP 9: Make the suggestion chips work.
     Add ONE click listener on #suggestions. When a .chip is
     clicked, put its data-question into the input and call
     askFieldGuide().

   STEP 10: Show the conversation as chat bubbles.
     Write addBubble(role, text) that creates a div with the
     classes "bubble user" or "bubble assistant", sets its
     textContent, and appends it to #chatLog.
   ============================================================ */

// --- Part 1 helpers (already done) -----------------------------
function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  resultCard.classList.add("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}
