/* ============================================================
   COUNTRY EXPLORER, PART 2: ASK THE FIELD GUIDE — script.js
   MAIN BRANCH (Steps 1-6 complete — the guided demo)
   ------------------------------------------------------------
   PART 1 PATTERN (GET):
     Request -> Receive -> Parse -> Display

   PART 2 PATTERN (POST):
     User Question + Country Data -> POST to AI -> Generated Answer -> Display

   Steps 7-10 are stretch goals. See the bottom of this file.
   ============================================================ */

// --- Element references (Part 1) ------------------------------
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

/* ============================================================
   PART 2 — STEP 1: Select the Field Guide elements
   and connect the Ask button.
   ============================================================ */
const fieldGuideEl = document.getElementById("fieldGuide");
const guideCountryNameEl = document.getElementById("guideCountryName");
const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");
const guideResponseEl = document.getElementById("guideResponse");

// Your class worker URL. The worker holds the OpenAI key,
// so the key NEVER appears in this file.
const WORKER_URL = "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/";

askBtn.addEventListener("click", askFieldGuide);

/* ============================================================
   PART 2 — STEP 2: Remember the country the user explored.
   ============================================================ */
let currentCountry = null;

// --- Part 1: connect the Explore button ------------------------
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
       PART 2 — STEP 2 (continued): save the country and
       reveal the Field Guide.
       ---------------------------------------------------------- */
    currentCountry = country;
    guideCountryNameEl.textContent = country.names.common;
    guideResponseEl.textContent = `Ask me anything about ${country.names.common}.`;
    guideResponseEl.className = "guide-response";
    fieldGuideEl.classList.remove("hidden");
  } catch (error) {
    hideLoading();
    resultCard.classList.add("hidden");
    fieldGuideEl.classList.add("hidden");
    currentCountry = null;
    errorEl.textContent = `We couldn't find "${countryName}". Check the spelling and try again.`;
    errorEl.classList.remove("hidden");
    console.error(error);
  }
}

/* ============================================================
   PART 2 — STEP 3: Create askFieldGuide()
   ============================================================ */
async function askFieldGuide() {
  const question = questionInput.value.trim();

  if (!currentCountry) {
    guideResponseEl.textContent = "Explore a country first, then ask your question.";
    return;
  }

  if (!question) {
    guideResponseEl.textContent = "Type a question first.";
    return;
  }

  /* ----------------------------------------------------------
     STEP 4: Build the messages array.
     ---------------------------------------------------------- */
  const messages = [
    { role: "system", content: buildSystemPrompt(currentCountry) },
    { role: "user", content: question },
  ];

  /* ----------------------------------------------------------
     STEP 6 (part 1): loading state
     ---------------------------------------------------------- */
  guideResponseEl.textContent = "Consulting the field notes...";
  guideResponseEl.className = "guide-response thinking";
  askBtn.disabled = true;

  /* ----------------------------------------------------------
     STEP 6 (part 2): try/catch
     ---------------------------------------------------------- */
  try {
    /* --------------------------------------------------------
       STEP 5: Send the POST request, parse, and display.
       -------------------------------------------------------- */
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw AI response:", data); // inspect the shape!

    const reply = data.choices[0].message.content;
    guideResponseEl.textContent = reply;
    guideResponseEl.className = "guide-response";
  } catch (error) {
    console.error(error);
    guideResponseEl.textContent =
      "The Field Guide couldn't answer right now. Please try again in a moment.";
    guideResponseEl.className = "guide-response guide-error";
  } finally {
    askBtn.disabled = false;
  }
}

/* ============================================================
   STEP 4 (helper): the system prompt.
   Grounding = the country facts from Part 1.
   Guardrails = the client's requirements.
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
   STRETCH GOALS (Steps 7-10) — try these on your own!
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

// --- Part 1 helpers --------------------------------------------
function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  resultCard.classList.add("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}
