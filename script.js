let poems = [];

async function loadPoems() {
    try {
        const response = await fetch('poems.json');
        poems = await response.json();
        document.getElementById('poem-count').textContent = `${poems.length} poems available`;
    } catch (error) {
        console.error('Error loading poems:', error);
        document.getElementById('poem-title').textContent = 'Error loading poems';
    }
}

function displayRandomPoem() {
    if (poems.length === 0) return;

    const randomIndex = Math.floor(Math.random() * poems.length);
    const poem = poems[randomIndex];

    document.getElementById('poem-title').textContent = poem.title;

    const contentDiv = document.getElementById('poem-content');
    if (Array.isArray(poem.lines)) {
        contentDiv.innerHTML = poem.lines
            .map(stanza => `<div class="stanza">${stanza.join('<br>')}</div>`)
            .join('');
    } else {
        contentDiv.textContent = poem.content;
    }

    document.getElementById('poem-author').textContent = poem.author ? `— ${poem.author}` : '';
}

document.getElementById('random-btn').addEventListener('click', displayRandomPoem);

loadPoems();
