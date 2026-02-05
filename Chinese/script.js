let allData = [];
let currentDeck = [];
let currentIndex = 0;
let score = 0;
let currentMode = 'flashcard'; // 'flashcard' or 'quiz'

// DOM Elements
const menuScreen = document.getElementById('menu-screen');
const flashcardScreen = document.getElementById('flashcard-screen');
const quizScreen = document.getElementById('quiz-screen');
const categorySelect = document.getElementById('category-select');

// Load Data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allData = data;
        console.log("Loaded " + allData.length + " characters.");
    })
    .catch(err => console.error("Could not load data.json", err));

// Mode Selection
function selectMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });
}

// Start Game Logic
function startGame() {
    const category = categorySelect.value;
    
    // Filter Data
    if (category === 'all') {
        currentDeck = [...allData];
    } else if (category === 'random10') {
        currentDeck = [...allData].sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
        currentDeck = allData.filter(item => item.category.includes(category));
    }

    if (currentDeck.length === 0) {
        alert("No characters found for this category!");
        return;
    }

    // Reset State
    currentIndex = 0;
    score = 0;

    // Switch Screens
    menuScreen.classList.remove('active');
    
    if (currentMode === 'flashcard') {
        flashcardScreen.classList.add('active');
        loadFlashcard();
    } else {
        quizScreen.classList.add('active');
        loadQuizQuestion();
    }
}

function showMenu() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    menuScreen.classList.add('active');
}

// --- FLASHCARD LOGIC ---

function loadFlashcard() {
    const item = currentDeck[currentIndex];
    const card = document.getElementById('flashcard');
    
    // Reset flip
    card.classList.remove('flipped');
    
    // Populate content
    setTimeout(() => {
        document.getElementById('fc-char').textContent = item.char;
        document.getElementById('fc-pinyin').textContent = item.pinyin;
        document.getElementById('fc-meaning').textContent = item.meaning;
        document.getElementById('fc-category').textContent = item.category;
        document.getElementById('fc-progress').textContent = `${currentIndex + 1} / ${currentDeck.length}`;
    }, 200); // Small delay to allow flip reset if moving fast
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function nextCard() {
    if (currentIndex < currentDeck.length - 1) {
        currentIndex++;
        loadFlashcard();
    } else {
        alert("End of deck!");
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        loadFlashcard();
    }
}

// --- QUIZ LOGIC ---

function loadQuizQuestion() {
    const item = currentDeck[currentIndex];
    document.getElementById('quiz-progress').textContent = `${currentIndex + 1} / ${currentDeck.length}`;
    document.getElementById('quiz-score').textContent = `Score: ${score}`;
    document.getElementById('quiz-question').textContent = item.meaning;
    document.getElementById('quiz-feedback').textContent = "";
    document.getElementById('quiz-next-btn').classList.add('hidden');

    // Generate Options (1 correct + 3 wrong)
    let options = [item];
    let distractors = allData.filter(d => d.char !== item.char);
    
    // Shuffle distractors and pick 3
    distractors.sort(() => 0.5 - Math.random());
    options = options.concat(distractors.slice(0, 3));
    
    // Shuffle options for display
    options.sort(() => 0.5 - Math.random());

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = ''; // Clear previous

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.char;
        btn.onclick = () => handleAnswer(btn, opt, item);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(btn, selected, correct) {
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selected.char === correct.char) {
        btn.classList.add('correct');
        document.getElementById('quiz-feedback').textContent = "Correct! " + correct.pinyin;
        document.getElementById('quiz-feedback').style.color = "var(--correct)";
        score++;
    } else {
        btn.classList.add('wrong');
        document.getElementById('quiz-feedback').textContent = "Wrong! It was " + correct.char;
        document.getElementById('quiz-feedback').style.color = "var(--wrong)";
        
        // Highlight correct one
        buttons.forEach(b => {
            if (b.textContent === correct.char) b.classList.add('correct');
        });
    }

    document.getElementById('quiz-score').textContent = `Score: ${score}`;
    document.getElementById('quiz-next-btn').classList.remove('hidden');
}

function nextQuizQuestion() {
    if (currentIndex < currentDeck.length - 1) {
        currentIndex++;
        loadQuizQuestion();
    } else {
        alert(`Quiz finished! Score: ${score} / ${currentDeck.length}`);
        showMenu();
    }
}
