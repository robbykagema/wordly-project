// Select the search button by its ID
const btn = document.getElementById("btn");

// Select the text input field by its ID
const input = document.getElementById("input");

// Create a new div element to hold the word definition results
const resultContainer = document.createElement("div");

// Assign an ID to the result container for CSS styling
resultContainer.id = "result-container";

// Append the result container to the body so it shows on the page
document.body.appendChild(resultContainer);

// Listen for a click on the search button
btn.addEventListener("click", () => {

  // Grab the current value from the input field and remove extra spaces
  const word = input.value.trim();

  // If the input is empty, show a message and stop the function
  if (!word) {
    resultContainer.innerHTML = `<p class="error">⚠️ Please enter a word first!</p>`;
    return;
  }

  // Call the function to fetch the word definition from the API
  fetchWord(word);
});

// Allow the user to press Enter key to trigger a search
input.addEventListener("keydown", (e) => {

  // Check if the key pressed was the Enter key
  if (e.key === "Enter") {

    // Simulate a click on the search button
    btn.click();
  }
});

// Async function to fetch word data from the Free Dictionary API
async function fetchWord(word) {

  // Show a loading message while the API call is in progress
  resultContainer.innerHTML = `<p class="loading">🔍 Searching for "<strong>${word}</strong>"...</p>`;

  // Use try/catch to handle any errors during the fetch
  try {

    // Make a GET request to the Free Dictionary API with the searched word
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    // If the response is not OK (e.g. word not found), show an error message
    if (!response.ok) {
      resultContainer.innerHTML = `<p class="error">❌ No definition found for "<strong>${word}</strong>". Try a different word!</p>`;
      return;
    }

    // Parse the JSON response body into a JavaScript object
    const data = await response.json();

    // Pass the first result entry to the display function
    displayDefinition(data[0]);

  } catch (error) {

    // Show a network or unexpected error message to the user
    resultContainer.innerHTML = `<p class="error">⚠️ Something went wrong. Check your internet and try again.</p>`;
  }
}

// Function to build and display the word definition inside the result container
function displayDefinition(entry) {

  // Get the word from the API response
  const word = entry.word;

  // Get the phonetic pronunciation text, checking multiple possible locations
  const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || "";

  // Get the audio URL for pronunciation if available
  const audioUrl = entry.phonetics?.find(p => p.audio)?.audio || "";

  // Start building the HTML string for the result card
  let html = `
    <div class="word-card">

      <div class="word-title-row">
        <h2 class="word-heading">${word}</h2>
        ${phonetic ? `<span class="phonetic">${phonetic}</span>` : ""}
        ${audioUrl ? `<button class="audio-btn" onclick="playAudio('${audioUrl}')">🔊 Hear it</button>` : ""}
      </div>
  `;

  // Loop through each meaning (noun, verb, adjective, etc.)
  entry.meanings.forEach((meaning) => {

    // Add a section for this part of speech
    html += `
      <div class="meaning-section">
        <span class="pos-tag">${meaning.partOfSpeech}</span>
    `;

    // Show up to 3 definitions to keep the card clean
    meaning.definitions.slice(0, 3).forEach((def, index) => {

      // Add each definition with its number, text, and optional usage example
      html += `
        <div class="def-row">
          <span class="def-index">${index + 1}.</span>
          <div class="def-body">
            <p class="def-text">${def.definition}</p>
            ${def.example ? `<p class="def-example">"${def.example}"</p>` : ""}
          </div>
        </div>
      `;
    });

    // If synonyms exist, display up to 5 of them below the definitions
    if (meaning.synonyms && meaning.synonyms.length > 0) {
      html += `<p class="synonyms"><strong>Synonyms:</strong> ${meaning.synonyms.slice(0, 5).join(", ")}</p>`;
    }

    // Close the meaning section div
    html += `</div>`;
  });

  // Close the word card div
  html += `</div>`;

  // Inject the fully built HTML into the result container on the page
  resultContainer.innerHTML = html;
}

// Function to play the pronunciation audio from the given URL
function playAudio(url) {

  // Create a new Audio object with the provided URL
  const audio = new Audio(url);

  // Play the audio file so the user can hear the pronunciation
  audio.play();
}