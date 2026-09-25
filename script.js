/* ============================================================
   COUNTRY EXPLORER, PART 2: ASK THE FIELD GUIDE — script.js
   SOLUTION BRANCH (Steps 1-10 complete)
   ------------------------------------------------------------
   PART 1 PATTERN (GET):
     Request -> Receive -> Parse -> Display

   PART 2 PATTERN (POST):
     User Question + Country Data -> POST to AI -> Generated Answer -> Display

   Everything from Part 1 is kept as-is. Part 2 code is marked
   with "PART 2" banners below.
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
const chatLogEl = document.getElementById("chatLog");        // Step 10
const suggestionsEl = document.getElementById("suggestions"); // Step 9

// Your class worker URL. The worker holds the OpenAI key,
// so the key NEVER appears in this file.
const WORKER_URL = "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/";

askBtn.addEventListener("click", askFieldGuide);

// Bonus: let Enter submit the question too
questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") askFieldGuide();
});

/* ============================================================
   PART 2 — STEP 2: Remember the country the user explored.
   We save it here so the Field Guide can use it later.
   ============================================================ */
let currentCountry = null;

// STRETCH — STEP 8: conversation memory
// Holds every user + assistant message for the current country.
let conversation = [];

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

    // STEP 8: a new country means a fresh conversation
    conversation = [];
    chatLogEl.innerHTML = "";
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
   Read the question and validate it before calling the AI.
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
     system = the rules (guardrails) + the country facts
     user   = what the visitor typed
     ---------------------------------------------------------- */
  const systemPrompt = buildSystemPrompt(currentCountry);

  // STEP 8: add the new question to the running conversation
  conversation.push({ role: "user", content: question });

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversation,
  ];

  /* ----------------------------------------------------------
     STEP 6 (part 1): loading state — show "Thinking..."
     and disable the button so it can't be double-clicked.
     ---------------------------------------------------------- */
  guideResponseEl.textContent = "Consulting the field notes...";
  guideResponseEl.className = "guide-response thinking";
  askBtn.disabled = true;

  // STEP 10: show the question as a bubble right away
  addBubble("user", question);
  questionInput.value = "";

  /* ----------------------------------------------------------
     STEP 6 (part 2): wrap the request in try/catch
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

    // STEP 8: remember what the AI said
    conversation.push({ role: "assistant", content: reply });

    // STEP 10: answer goes into a chat bubble; the status box resets.
    // (Core version, Step 5: guideResponseEl.textContent = reply;)
    addBubble("assistant", reply);
    guideResponseEl.textContent = "Ask a follow-up question.";
    guideResponseEl.className = "guide-response";
  } catch (error) {
    console.error(error);
    // Remove the unanswered question so history stays in sync
    conversation.pop();
    guideResponseEl.textContent =
      "The Field Guide couldn't answer right now. Please try again in a moment.";
    guideResponseEl.className = "guide-response guide-error";
  } finally {
    askBtn.disabled = false;
  }
}

/* ============================================================
   STEP 4 (helper) + STEP 7: the system prompt.
   Grounding: the country facts from Part 1 go in here.
   Guardrails: the client's four requirements go in here.
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

Rules:
1. Only answer questions about ${country.names.common}: its geography, wildlife, culture, food, history, landmarks and people.
2. If the visitor asks about something unrelated, politely steer them back to ${country.names.common}.
3. Sound like National Geographic: curious, warm and family-friendly.
4. Keep every answer under 100 words.
5. Use the verified facts above when they are relevant. If you are not sure about something, say so instead of guessing.`;
}

/* ============================================================
   STRETCH — STEP 9: suggested question chips.
   Event delegation: one listener on the container
   handles every chip button inside it.
   ============================================================ */
suggestionsEl.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  questionInput.value = chip.dataset.question;
  askFieldGuide();
});

/* ============================================================
   STRETCH — STEP 10: chat bubbles.
   textContent (not innerHTML) keeps AI text from being
   treated as HTML. Always treat AI output as untrusted.
   ============================================================ */
function addBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatLogEl.appendChild(bubble);
  bubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --- Part 1 helpers --------------------------------------------
function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  resultCard.classList.add("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}
