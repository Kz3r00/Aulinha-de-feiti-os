const FEITICOS = {
  Accio: {
    texto: "Você me chamou? Eu vim correndo! 💨",
    classe: "voar",
    particula: "💨",
    duracao: 1500,
  },
  Lumos: {
    texto: "Que luz bonita... você ilumina meu dia ✨",
    classe: "brilhar",
    particula: "✨",
    duracao: 2000,
  },
  "Expecto Patronum": {
    texto: "Meu Patronus veio te fazer companhia! 🦌",
    classe: "acompanhar",
    particula: "💙",
    duracao: 3000,
  },
  "Wingardium Leviosa": {
    texto: "Estou nas nuvens... literalmente! ☁️",
    classe: "flutuar",
    particula: "💗",
    duracao: 2500,
  },
  Aguamenti: {
    texto: "Chuva de pétalas pra você! 🌸",
    classe: "sacudir",
    particula: "🌸",
    duracao: 2000,
  },
  Incendio: {
    texto: "Ai... você me deixou corado 🔥",
    classe: "corado",
    particula: "❤️‍🔥",
    duracao: 1800,
  },
  Avis: {
    texto: "Mandei um recado pro seu coração 💌",
    classe: "enviar-aves",
    particula: "🐦",
    duracao: 2500,
  },
  Riddikulus: {
    texto: "Hahaha, você me pegou! 😜",
    classe: "tremer",
    particula: "😂",
    duracao: 1500,
  },
  Nox: {
    texto: "Boa noite... sonha comigo 🌙",
    classe: "escurecer",
    particula: "🌙",
    duracao: 2000,
  },
  Alohomora: {
    texto: "Você abriu meu coração 🔓🎵",
    classe: "abrir-musica",
    particula: "🎵",
    duracao: 2200,
  },
};

const owl = document.querySelector(".owl");
const scene = document.querySelector(".owl-scene");
const room = document.querySelector(".room");
const bubble = document.querySelector(".speech-bubble");
const activeTimers = new Set();
const activeElements = new Set();
const STORAGE_KEY = "feiticosLancados";
const secretLetterBackdrop = document.querySelector(".secret-letter-backdrop");
const secretLetter = document.querySelector(".secret-letter");
const secretLetterClose = document.querySelector(".secret-letter__close");
let activeSpell = null;
let letterHideTimer = null;
const owlOriginalContent = owl.textContent;

function carregarFeiticosLancados() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new TypeError(`O valor salvo em "${STORAGE_KEY}" deve ser uma lista.`);
    }
    return [...new Set(parsed.filter((name) =>
      typeof name === "string" &&
      Object.prototype.hasOwnProperty.call(FEITICOS, name),
    ))];
  } catch (error) {
    console.error("Não foi possível carregar o progresso dos feitiços.", error);
    return [];
  }
}

const feiticosLancados = new Set(carregarFeiticosLancados());
const spellButtons = new Map(
  [...document.querySelectorAll(".spell[data-spell]")].map((button) => [
    button.dataset.spell,
    button,
  ]),
);

feiticosLancados.forEach((name) => {
  spellButtons.get(name)?.classList.add("spell--cast");
});

function mostrarCarta() {
  if (letterHideTimer !== null) {
    window.clearTimeout(letterHideTimer);
    letterHideTimer = null;
  }
  secretLetterBackdrop.hidden = false;
  requestAnimationFrame(() => {
    secretLetter.classList.add("is-visible");
    secretLetterClose.focus();
  });
}

function fecharCarta() {
  if (secretLetterBackdrop.hidden) {
    return;
  }
  secretLetter.classList.remove("is-visible");
  letterHideTimer = window.setTimeout(() => {
    secretLetterBackdrop.hidden = true;
    letterHideTimer = null;
    spellButtons.get([...feiticosLancados].at(-1))?.focus();
  }, 350);
}

function registrarFeitico(nomeDoFeitico) {
  const isNew = !feiticosLancados.has(nomeDoFeitico);
  if (isNew) {
    feiticosLancados.add(nomeDoFeitico);
    spellButtons.get(nomeDoFeitico)?.classList.add("spell--cast");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...feiticosLancados]));
    } catch (error) {
      console.error("Não foi possível salvar o progresso dos feitiços.", error);
    }
  }

  const ultimoFeitico = [...feiticosLancados].at(-1);
  if (
    feiticosLancados.size === Object.keys(FEITICOS).length &&
    (isNew || nomeDoFeitico === ultimoFeitico)
  ) {
    mostrarCarta();
  }
}

secretLetterClose.addEventListener("click", fecharCarta);
secretLetterBackdrop.addEventListener("click", (event) => {
  if (event.target === secretLetterBackdrop) {
    fecharCarta();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    fecharCarta();
  }
});

function agendar(callback, delay) {
  const timer = window.setTimeout(() => {
    activeTimers.delete(timer);
    callback();
  }, delay);
  activeTimers.add(timer);
  return timer;
}

function limparReacao() {
  activeTimers.forEach(window.clearTimeout);
  activeTimers.clear();
  activeElements.forEach((element) => element.remove());
  activeElements.clear();
  owl.classList.remove(
    "voar",
    "brilhar",
    "acompanhar",
    "flutuar",
    "sacudir",
    "corado",
    "enviar-aves",
    "tremer",
    "escurecer",
    "abrir-musica",
  );
  owl.textContent = owlOriginalContent;
  bubble.classList.remove("is-visible");
  bubble.textContent = "";
  activeSpell = null;
}

function criarParticulas(emoji, quantidade = 10) {
  const brilhoMagico = activeSpell === "Lumos" || activeSpell === "Expecto Patronum";

  for (let index = 0; index < quantidade; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particula";
    particle.textContent = emoji;
    particle.setAttribute("aria-hidden", "true");
    particle.style.setProperty("--particle-x", `${Math.random() * 100}vw`);
    particle.style.setProperty("--particle-size", `${18 + Math.random() * 18}px`);
    particle.style.setProperty("--particle-sway", `${24 + Math.random() * 42}px`);
    particle.style.setProperty("--particle-rotation", `${120 + Math.random() * 480}deg`);
    particle.style.setProperty(
      "--particle-duration",
      `${brilhoMagico ? 3.8 + Math.random() * 1.7 : 2.2 + Math.random() * 1.5}s`,
    );
    if (brilhoMagico) {
      particle.classList.add("particula--brilhante");
    }
    document.body.append(particle);
    activeElements.add(particle);

    agendar(() => {
      particle.remove();
      activeElements.delete(particle);
    }, brilhoMagico ? 5600 : 3800);
  }
}

function criarPatronus() {
  const patronus = document.createElement("span");
  patronus.className = "patronus";
  patronus.textContent = "🦌";
  patronus.setAttribute("aria-hidden", "true");
  scene.append(patronus);
  activeElements.add(patronus);
}

function criarAves() {
  const positions = [
    [-34, -67], [-18, -88], [0, -98], [18, -88], [34, -67],
    [-25, -49], [-12, -60], [12, -60], [25, -49], [0, -34],
  ];

  positions.forEach(([x, y], index) => {
    const bird = document.createElement("span");
    bird.className = "passaro";
    bird.textContent = "🐦";
    bird.setAttribute("aria-hidden", "true");
    bird.style.setProperty("--bird-x", `${x}px`);
    bird.style.setProperty("--bird-y", `${y}px`);
    bird.style.animationDelay = `${index * 35}ms`;
    scene.append(bird);
    activeElements.add(bird);
  });
}

function criarCaixinhaMusica() {
  const musicBox = document.createElement("span");
  musicBox.className = "caixinha-musica is-open";
  musicBox.textContent = "🎁";
  musicBox.setAttribute("aria-hidden", "true");

  const note = document.createElement("span");
  note.className = "caixinha-musica__nota";
  note.textContent = "♪";
  musicBox.append(note);
  scene.append(musicBox);
  activeElements.add(musicBox);
}

function lancarFeitico(nomeDoFeitico) {
  const feitico = FEITICOS[nomeDoFeitico];
  if (!feitico) {
    return;
  }

  registrarFeitico(nomeDoFeitico);
  limparReacao();
  activeSpell = nomeDoFeitico;
  owl.classList.add(feitico.classe);
  if (nomeDoFeitico === "Riddikulus") {
    owl.textContent = "😜";
  }
  bubble.textContent = feitico.texto;
  bubble.classList.add("is-visible");
  criarParticulas(feitico.particula);

  if (nomeDoFeitico === "Expecto Patronum") {
    criarPatronus();
  } else if (nomeDoFeitico === "Avis") {
    criarAves();
  } else if (nomeDoFeitico === "Alohomora") {
    criarCaixinhaMusica();
  } else if (nomeDoFeitico === "Nox") {
    const overlay = document.createElement("div");
    overlay.className = "nox-overlay";
    overlay.setAttribute("aria-hidden", "true");
    room.append(overlay);
    activeElements.add(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
  }

  agendar(() => {
    owl.classList.remove(feitico.classe);
    if (nomeDoFeitico === "Riddikulus") {
      owl.textContent = owlOriginalContent;
    }
    const overlay = nomeDoFeitico === "Nox"
      ? room.querySelector(".nox-overlay")
      : null;
    if (nomeDoFeitico === "Nox") {
      overlay?.classList.remove("is-visible");
    }
    activeElements.forEach((element) => {
      if (
        !element.classList.contains("particula") &&
        !element.classList.contains("nox-overlay")
      ) {
        element.remove();
        activeElements.delete(element);
      }
    });
    if (overlay) {
      agendar(() => {
        overlay.remove();
        activeElements.delete(overlay);
      }, 300);
    }
    bubble.classList.remove("is-visible");
    activeSpell = null;
    agendar(() => {
      if (activeSpell === null) {
        bubble.textContent = "";
      }
    }, 300);
  }, feitico.duracao);
}
