import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(cors());

const PORT = 3000;
const CACHE_FILE = "./cache.json";
const cors = require('cors');
const corsOptions = {
  origin: 'https://henzo-padua.github.io',
  optionsSuccessStatus: 200
};



// Lista de livros possíveis para escolher versículos aleatórios (respeitando a tradução usada)
const books = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
  "psalms", "proverbs", "isaiah", "jeremiah", "matthew",
  "mark", "luke", "john", "acts", "romans"
];

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Gera um número "pseudo-aleatório" baseado na data
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function fetchVerseAndChapter() {
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Escolhe aleatoriamente um livro e versículo
  const randomBookIndex = Math.floor(seededRandom(daySeed) * books.length);
  const randomBook = books[randomBookIndex];
  const randomChapter = Math.floor(seededRandom(daySeed + 1) * 10) + 1;
  const randomVerse = Math.floor(seededRandom(daySeed + 2) * 10) + 1;

  const verseQuery = `${randomBook} ${randomChapter}:${randomVerse}`;
  const chapterNum = Math.floor(seededRandom(daySeed + 3) * 150) + 1; // Salmos 1-150

  const responseVerse = await fetch(`https://bible-api.com/${encodeURIComponent(verseQuery)}?translation=almeida`);
  const verseData = await responseVerse.json();

  const responseChapter = await fetch(`https://bible-api.com/psalms${chapterNum}?translation=almeida`);
  const chapterData = await responseChapter.json();

  return {
    date: getTodayKey(),
    verse: {
      text: verseData.text || "Versículo não encontrado.",
      reference: verseData.reference || verseQuery
    },
    chapter: {
      text: chapterData.text || "Capítulo não encontrado.",
      reference: chapterData.reference || `Salmos ${chapterNum}`
    }
  };
}

app.get("/api/devotional", async (req, res) => {
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  }

  const today = getTodayKey();
  if (cache[today]) {
    return res.json(cache[today]);
  }

  try {
    const devotional = await fetchVerseAndChapter();
    cache[today] = devotional;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    res.json(devotional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar conteúdo bíblico." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
app.use(cors(corsOptions));