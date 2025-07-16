let currentStep = 0;
let currentQuestion = null;
let selectedPokemons = [];
const totalQuestions = 3;

const questions = [
    {
        text: "Which of these are Dragon-type Pokémon?",
        validate: (poke) => poke.types.includes("Dragon")
    },
    {
        text: "Pick all Pokémon from Generation 3 (Hoenn).",
        validate: (poke) => poke.generation === 3
    },
    {
        text: "Select all Legendary Pokémon.",
        validate: (poke) => poke.isLegendary
    },
    {
        text: "Which Pokémon are dual-type Ghost?",
        validate: (poke) => poke.types.includes("Ghost") && poke.types.length === 2
    },
    {
        text: "Choose only Steel-type Pokémon.",
        validate: (poke) => poke.types.includes("Steel")
    },
    {
        text: "Pick Pokémon introduced in Generation 5.",
        validate: (poke) => poke.generation === 5
    }
];

// Shuffle utility
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startQuiz() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz-screen").style.display = "block";
    currentStep = 0;
    loadQuestion();
}

function loadQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("captcha-container").innerHTML = "";

    currentQuestion = shuffle(questions)[0];
    selectedPokemons = shuffle(pokedex).slice(0, 6);

    document.getElementById("question-text").textContent = `Q${currentStep + 1}: ${currentQuestion.text}`;

    selectedPokemons.forEach((poke, index) => {
        const img = document.createElement("img");
        img.src = poke.img;
        img.alt = poke.name;
        img.title = poke.name;
        img.dataset.index = index;

        img.addEventListener("click", () => {
            img.classList.toggle("selected");
        });

        document.getElementById("captcha-container").appendChild(img);
    });
}

function submitAnswer() {
    const selected = document.querySelectorAll("img.selected");
    const correctIndexes = selectedPokemons
        .map((poke, i) => currentQuestion.validate(poke) ? i : -1)
        .filter(i => i !== -1);
    const selectedIndexes = [...selected].map(img => parseInt(img.dataset.index));

    const isCorrect = selectedIndexes.length === correctIndexes.length &&
        selectedIndexes.every(i => correctIndexes.includes(i));

    if (!isCorrect) {
        denyAccess();
        return;
    }

    currentStep++;
    if (currentStep < totalQuestions) {
        loadQuestion();
    } else {
        grantAccess();
    }
}

function denyAccess() {
    document.getElementById("quiz-screen").style.display = "none";
    document.getElementById("final-screen").style.display = "block";
    document.getElementById("final-message").textContent = "🛑 Access Denied!";
    document.getElementById("final-detail").textContent = "You answered incorrectly. Real Trainers don’t guess!";
    document.getElementById("captcha-try-again-button").style.display = "inline-block"; // Show try again button
    document.getElementById("begin-journey-gen-button").style.display = "none"; // Ensure hidden
    document.getElementById("try-again-gen-button").style.display = "none"; // Ensure hidden
}

function grantAccess() {
    document.getElementById("quiz-screen").style.display = "none";
    document.getElementById("final-screen").style.display = "block";
    document.getElementById("final-message").textContent = "🎉 Welcome, Pokémon Trainer!";
    document.getElementById("final-detail").textContent = "You passed all 3 trials. You may now enter the Pokéverse.";
    document.getElementById("captcha-try-again-button").style.display = "none"; // Hide if successful
    // Directly prepare generation selection after passing CAPTCHA
    showGenerationSelection();
}

// --- Tarot Card Feature Functions ---

function showGenerationSelection() {
    document.getElementById("final-screen").style.display = "none"; // Hide final screen
    document.getElementById("generation-select-screen").style.display = "block"; // Show gen selection

    const generationDeck = document.getElementById("generation-card-deck");
    generationDeck.innerHTML = ""; // Clear previous cards

    // Get unique generations from starters data and shuffle them (without sorting!)
    const uniqueGens = shuffle([...new Set(starters.map(s => s.gen))]); 

    // Create cards for all generations
    uniqueGens.forEach(gen => {
        const card = document.createElement("div");
        card.className = "card generation-card";

        const front = document.createElement("div");
        front.className = "front";
        front.innerHTML = '✨ <br> Choose a Gen!';

        const back = document.createElement("div");
        back.className = "back";
        const genText = document.createElement("p");
        genText.textContent = `Generation ${gen}`;
        back.appendChild(genText);

        card.appendChild(front);
        card.appendChild(back);
        card.dataset.flipped = "false";

        card.addEventListener("click", () => {
            if (card.dataset.flipped === "true") return;

            document.querySelectorAll(".generation-card").forEach(c => c.style.pointerEvents = "none");
            
            card.classList.add("flipped");
            card.dataset.flipped = "true";

            setTimeout(() => {
                loadStartersByGen(gen);
            }, 600);
        });

        generationDeck.appendChild(card);
    });

    // Show the "Begin Your Journey!" and "Try Again?" buttons
    document.getElementById("begin-journey-gen-button").style.display = "inline-block";
    document.getElementById("try-again-gen-button").style.display = "inline-block";
}

// New function to actually begin generation selection (after clicking "Begin Your Journey!")
function beginGenerationSelection() {
    // Hide buttons once a choice is made (or about to be made)
    document.getElementById("begin-journey-gen-button").style.display = "none";
    document.getElementById("try-again-gen-button").style.display = "none";
    // No additional action needed here, as showGenerationSelection already loaded the cards.
    // This function acts more as a visual confirmation of starting.
}

// New function to allow trying again with generation selection
function tryAgainGenerations() {
    // Re-shuffle and re-display the generation cards
    showGenerationSelection();
    // Ensure cards are clickable again
    document.querySelectorAll(".generation-card").forEach(c => {
        c.classList.remove("flipped"); // Flip them back if any were partially flipped
        c.dataset.flipped = "false";
        c.style.pointerEvents = "auto";
    });
}


function loadStartersByGen(gen) {
    document.getElementById("generation-select-screen").style.display = "none";
    document.getElementById("starter-select-screen").style.display = "block";
    document.getElementById("starter-select-screen").querySelector('h2').textContent = `Pick Your Starter Pokémon from Generation ${gen}!`;
    
    const deck = document.getElementById("card-deck");
    deck.innerHTML = "";

    const startersForGen = starters.filter(s => s.gen === gen);
    const chosenStarters = shuffle(startersForGen).slice(0, 3);

    if (chosenStarters.length === 0) {
        const noStartersMessage = document.createElement("p");
        noStartersMessage.textContent = "No starters available for this generation. Please choose another.";
        deck.appendChild(noStartersMessage);
        return;
    }

    chosenStarters.forEach((poke) => {
        const card = document.createElement("div");
        card.className = "card";

        const front = document.createElement("div");
        front.className = "front";
        front.innerHTML = '✨ <br> Pokémon Card';

        const back = document.createElement("div");
        back.className = "back";
        const img = document.createElement("img");
        img.src = poke.img;
        img.alt = poke.name;
        back.appendChild(img);
        const name = document.createElement("p");
        name.textContent = poke.name;
        back.appendChild(name);

        card.appendChild(front);
        card.appendChild(back);
        card.dataset.flipped = "false";

        card.addEventListener("click", () => {
            if (card.dataset.flipped === "true") return;

            document.querySelectorAll(".card").forEach(c => c.style.pointerEvents = "none");
            
            card.classList.add("flipped");
            card.dataset.flipped = "true";

            setTimeout(() => {
                displayChosenPokemon(poke);
            }, 500);
        });

        deck.appendChild(card);
    });
}

function displayChosenPokemon(pokemon) {
    document.getElementById("starter-select-screen").style.display = "none";
    document.getElementById("your-pokemon-panel").style.display = "block";

    const displayArea = document.getElementById("chosen-pokemon-display");
    displayArea.innerHTML = "";

    const img = document.createElement("img");
    img.src = pokemon.img;
    img.alt = pokemon.name;
    img.className = "final-pokemon-img";
    displayArea.appendChild(img);

    const name = document.createElement("p");
    name.textContent = pokemon.name;
    name.className = "final-pokemon-name";
    displayArea.appendChild(name);

    document.getElementById("journey-message").textContent = `Congratulations, ${pokemon.name} is now your official partner! Your journey truly begins now!`;
}

function endDream() {
    document.getElementById("your-pokemon-panel").style.display = "none";
    document.getElementById("reality-check-panel").style.display = "block";
}

function resetGame() {
    document.getElementById("your-pokemon-panel").style.display = "none";
    document.getElementById("reality-check-panel").style.display = "none";
    document.getElementById("final-screen").style.display = "none"; // Hide final screen on reset
    document.getElementById("generation-select-screen").style.display = "none"; // Ensure gen selection is hidden
    document.getElementById("starter-select-screen").style.display = "none"; // Ensure starter selection is hidden

    document.getElementById("start-screen").style.display = "block";
    
    // Reset any other game state variables if necessary
    currentStep = 0;
    currentQuestion = null;
    selectedPokemons = [];
    document.getElementById("result").textContent = "";
    document.getElementById("final-message").textContent = "";
    document.getElementById("final-detail").textContent = "";

    // Ensure all dynamic buttons are hidden on reset
    document.getElementById("captcha-try-again-button").style.display = "none";
    document.getElementById("begin-journey-gen-button").style.display = "none";
    document.getElementById("try-again-gen-button").style.display = "none";
}