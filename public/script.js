async function loadDevotional() {
    try {
        const response = await fetch("http://localhost:3000/api/devotional");
        const data = await response.json();

        document.getElementById("verse-text").textContent = data.verse.text;
        document.getElementById("verse-ref").textContent = data.verse.reference;

        document.getElementById("chapter-text").textContent = data.chapter.text;
        document.getElementById("chapter-ref").textContent = data.chapter.reference;
    } catch (err) {
        console.error("Erro ao carregar devocional:", err);
    }
}

loadDevotional();
