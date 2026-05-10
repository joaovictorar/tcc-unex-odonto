let currentText = "";
let currentOptions = [];
let historyStack = [];
let audioQueue = [];
let isSpeaking = false;
let selectedService = "";

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

function startApp() {
  document.getElementById("start").style.display = "none";
  speechSynthesis.cancel();
  home();
}

function setTitle(t) {
  document.getElementById("title").innerText = t;
}

function normalizeText(text) {
  return String(text)
    .replaceAll("Unex", "Únex")
    .replaceAll("WhatsApp", "Uótizap")
    .replaceAll("16:30", "dezesseis horas e trinta minutos")
    .replaceAll("08:30", "oito horas e trinta minutos")
    .replaceAll("14:00", "quatorze horas")
    .replaceAll("09:00", "nove horas")
    .replaceAll("✅", "")
    .replaceAll("📅", "")
    .replaceAll("🦷", "")
    .replaceAll("💬", "")
    .replaceAll("🟢", "")
    .replaceAll("🔴", "")
    .replaceAll("❌", "")
    .replaceAll("😁", "")
    .replaceAll("😖", "")
    .replaceAll("✨", "")
    .replaceAll("🪥", "")
    .replaceAll("🆕", "")
    .replaceAll("❓", "")
    .replaceAll("🔸", "")
    .replaceAll("🔹", "")
    .replaceAll("🍽️", "")
    .replaceAll("💊", "")
    .replaceAll("🕒", "")
    .replaceAll("🚫☀️", "")
    .replaceAll("🚫🍲", "")
    .replaceAll("🚫💦", "")
    .replaceAll("🥤", "")
    .replaceAll("👩‍⚕️", "")
    .replaceAll("📞", "")
    .replaceAll("📲", "");
}

function getVoice() {
  if (!("speechSynthesis" in window)) return null;

  const voices = speechSynthesis.getVoices();

  return voices.find(v => v.lang.includes("pt") && v.name.toLowerCase().includes("google"))
    || voices.find(v => v.lang.includes("pt") && v.name.toLowerCase().includes("maria"))
    || voices.find(v => v.lang.includes("pt") && v.name.toLowerCase().includes("luciana"))
    || voices.find(v => v.lang.includes("pt"))
    || voices[0]
    || null;
}

function speakQueue(list) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();
  audioQueue = list.filter(Boolean).map(normalizeText);
  isSpeaking = false;

  setTimeout(playNextAudio, 200);
}

function playNextAudio() {
  if (isSpeaking) return;

  if (!audioQueue.length) {
    isSpeaking = false;
    return;
  }

  isSpeaking = true;

  const msg = new SpeechSynthesisUtterance(audioQueue.shift());
  msg.lang = "pt-BR";
  msg.rate = 0.9;
  msg.pitch = 1.04;
  msg.volume = 1;

  const voice = getVoice();
  if (voice) msg.voice = voice;

  msg.onend = () => {
    isSpeaking = false;
    setTimeout(playNextAudio, 450);
  };

  msg.onerror = () => {
    isSpeaking = false;
    setTimeout(playNextAudio, 450);
  };

  speechSynthesis.speak(msg);
}

function setSpeech(text, options = []) {
  currentText = text;
  currentOptions = options;
  document.getElementById("text").innerText = text;

  const audio = [
    text,
    ...options,
    options.length ? "Agora toque na opção desejada." : ""
  ];

  speakQueue(audio);
}

function repeatAudio() {
  speakQueue([currentText, ...currentOptions]);
}

function repeatOptions() {
  if (!currentOptions.length) {
    speakQueue([currentText]);
    return;
  }

  speakQueue([
    "Vou repetir as opções.",
    ...currentOptions,
    "Agora toque na opção desejada."
  ]);
}

function render(html) {
  document.getElementById("buttons").innerHTML = html;
}

function save(screen) {
  historyStack.push(screen);
}

function goBack() {
  const last = historyStack.pop();
  if (last) {
    last();
  } else {
    home();
  }
}

function card(n, i, t, s, c, a) {
  return `
    <button class="card ${c}" onclick="${a}">
      <div class="num">${n}</div>
      <div class="info">
        <span class="title">${i} ${t}</span>
        <span class="sub">${s}</span>
      </div>
    </button>
  `;
}

function home() {
  historyStack = [];
  setTitle("Toque em uma opção abaixo");

  render(`
    ${card("1","✅","Confirmar consulta","Ver se você vai comparecer","green","confirmar()")}
    ${card("2","📅","Marcar consulta","Escolher atendimento e dia","blue","marcar()")}
    ${card("3","🦷","Orientações","Cuidados antes e depois","purple","orientacoes()")}
    ${card("4","💬","Falar com atendimento","Recepção ou aluno","orange","contato()")}
  `);

  setSpeech(
    "Olá. Eu vou te ajudar. Toque em uma opção colorida abaixo.",
    [
      "Opção 1, botão verde: confirmar consulta.",
      "Opção 2, botão azul: marcar consulta.",
      "Opção 3, botão roxo: orientações.",
      "Opção 4, botão laranja: falar com atendimento."
    ]
  );
}

function confirmar() {
  save(home);
  setTitle("Você vai à consulta?");

  render(`
    <div class="box">
      <div class="big">📅</div>
      <h2>Dia 8</h2>
      <p>16:30</p>
    </div>
    ${card("1","🟢","SIM","Confirmar presença","green","confirmada()")}
    ${card("2","🔴","NÃO","Remarcar consulta","red","datas()")}
  `);

  setSpeech(
    "Você tem consulta dia 8, às 16 horas e 30 minutos. Você vai?",
    [
      "Opção 1, botão verde: sim, eu vou.",
      "Opção 2, botão vermelho: não, quero remarcar."
    ]
  );
}

function confirmada() {
  setTitle("Consulta confirmada");

  render(`
    <div class="box">
      <div class="big">✅</div>
      <h2>Confirmado</h2>
      <p>Esperamos você.</p>
    </div>
  `);

  setSpeech("Pronto. Sua consulta foi confirmada. Chegue no horário.");
}

function marcar() {
  save(home);
  setTitle("O que você precisa?");

  render(`
    ${card("1","😁","Arrumar meu dente","Dente quebrado ou com buraco","blue","confirmarTipo('arrumar meu dente')")}
    ${card("2","😖","Dor de dente","Atendimento com prioridade","red","confirmarTipo('dor de dente')")}
    ${card("3","🦷","Tirar um dente","Quando precisa extrair","purple","confirmarTipo('tirar um dente')")}
    ${card("4","✨","Melhorar sorriso","Avaliação estética","yellow","confirmarTipo('melhorar meu sorriso')")}
    ${card("5","🪥","Limpar dentes","Limpeza e prevenção","teal","confirmarTipo('limpar meus dentes')")}
    ${card("6","🆕","Primeira vez aqui","Primeiro atendimento","green","confirmarTipo('primeira vez aqui')")}
    ${card("7","❓","Preciso de ajuda","Falar com atendimento","pink","contato()")}
  `);

  setSpeech(
    "Como posso te ajudar? Toque em uma opção colorida.",
    [
      "Opção 1, botão azul: arrumar meu dente.",
      "Opção 2, botão vermelho: estou com dor de dente.",
      "Opção 3, botão roxo: quero tirar um dente.",
      "Opção 4, botão amarelo: quero melhorar meu sorriso.",
      "Opção 5, botão verde água: quero limpar meus dentes.",
      "Opção 6, botão verde: primeira vez aqui.",
      "Opção 7, botão rosa: não sei, preciso de ajuda."
    ]
  );
}

function confirmarTipo(tipo) {
  selectedService = tipo;
  save(marcar);
  setTitle("Está certo?");

  render(`
    <div class="box">
      <div class="big">🦷</div>
      <h2>${tipo}</h2>
      <p>Confirme para escolher o dia.</p>
    </div>
    ${card("1","🟢","SIM","Escolher o dia","green","datas()")}
    ${card("2","🔴","NÃO","Voltar opções","red","marcar()")}
  `);

  setSpeech(
    "Você escolheu " + tipo + ". Está certo?",
    [
      "Opção 1, botão verde: sim, está certo.",
      "Opção 2, botão vermelho: não, escolher de novo."
    ]
  );
}

function datas() {
  setTitle("Escolha o dia que você pode vir");

  render(`
    ${card("1","📅","Segunda, dia 8","08:30 da manhã","blue","finalizar('Segunda, dia 8','08:30')")}
    ${card("2","📅","Terça, dia 9","14:00 da tarde","green","finalizar('Terça, dia 9','14:00')")}
    ${card("3","📅","Quarta, dia 10","16:30 da tarde","purple","finalizar('Quarta, dia 10','16:30')")}
    ${card("4","📅","Quinta, dia 11","09:00 da manhã","orange","finalizar('Quinta, dia 11','09:00')")}
  `);

  setSpeech(
    "Escolha o dia que você pode vir.",
    [
      "Opção 1, botão azul: segunda, dia 8, às oito horas e trinta minutos da manhã.",
      "Opção 2, botão verde: terça, dia 9, às quatorze horas.",
      "Opção 3, botão roxo: quarta, dia 10, às dezesseis horas e trinta minutos.",
      "Opção 4, botão laranja: quinta, dia 11, às nove horas da manhã."
    ]
  );
}

function finalizar(dia, hora) {
  save(datas);
  setTitle("Confirmar horário");

  render(`
    <div class="box">
      <div class="big">📅</div>
      <h2>${dia}</h2>
      <p>${hora}</p>
    </div>
    ${card("1","✅","CONFIRMAR","Salvar consulta","green","marcada()")}
    ${card("2","❌","CANCELAR","Voltar ao início","red","home()")}
  `);

  setSpeech(
    "Sua consulta ficou para " + dia + ", às " + hora + ". Você confirma?",
    [
      "Opção 1, botão verde: confirmar.",
      "Opção 2, botão vermelho: cancelar."
    ]
  );
}

function marcada() {
  setTitle("Consulta marcada");

  render(`
    <div class="box">
      <div class="big">✅</div>
      <h2>Consulta marcada</h2>
      <p>Chegue no horário.</p>
    </div>
  `);

  setSpeech("Pronto. Sua consulta foi marcada. Chegue no horário.");
}

function orientacoes() {
  save(home);
  setTitle("Orientações");

  render(`
    ${card("1","🔸","Antes","O que fazer antes de ir","blue","pre()")}
    ${card("2","🔹","Depois","Cuidados depois do procedimento","purple","pos()")}
  `);

  setSpeech(
    "Você quer orientação antes ou depois do procedimento?",
    [
      "Opção 1, botão azul: antes do procedimento.",
      "Opção 2, botão roxo: depois do procedimento."
    ]
  );
}

function pre() {
  save(orientacoes);
  setTitle("Antes do procedimento");

  render(`
    ${card("1","🍽️","Se alimentar antes","Não vá sem comer","green","repeatAudio()")}
    ${card("2","💊","Tomar remédio","Se o dentista pediu","blue","repeatAudio()")}
    ${card("3","🕒","Chegar no horário","Evite atrasos","yellow","repeatAudio()")}
  `);

  setSpeech(
    "Antes do atendimento, siga estas orientações.",
    [
      "Opção 1, botão verde: se alimentar antes. Não vá sem comer.",
      "Opção 2, botão azul: tomar remédio, somente se o dentista pediu.",
      "Opção 3, botão amarelo: chegar no horário. Evite atrasos."
    ]
  );
}

function pos() {
  save(orientacoes);
  setTitle("Depois do procedimento");

  render(`
    ${card("1","🚫☀️","Evitar sol","Fique em local fresco","red","repeatAudio()")}
    ${card("2","🚫🍲","Não comer quente","Prefira frio ou gelado","orange","repeatAudio()")}
    ${card("3","🚫💦","Não fazer bochecho","Não mexa no local","red","repeatAudio()")}
    ${card("4","💊","Tomar remédio","Como foi pedido","blue","repeatAudio()")}
    ${card("5","🥤","Tomar gelado","Ajuda na recuperação","teal","repeatAudio()")}
    ${card("6","🪥","Escovar normalmente","Com cuidado","green","repeatAudio()")}
    ${card("7","📅","Voltar em 7 dias","Para retirar os pontos","purple","repeatAudio()")}
  `);

  setSpeech(
    "Depois do procedimento, siga estas orientações.",
    [
      "Opção 1, botão vermelho: evitar sol. Fique em local fresco.",
      "Opção 2, botão laranja: não comer quente. Prefira frio ou gelado.",
      "Opção 3, botão vermelho: não fazer bochecho. Não mexa no local.",
      "Opção 4, botão azul: tomar remédio como foi pedido.",
      "Opção 5, botão verde água: tomar gelado. Ajuda na recuperação.",
      "Opção 6, botão verde: escovar normalmente, com cuidado.",
      "Opção 7, botão roxo: voltar em sete dias para retirar os pontos."
    ]
  );
}

function contato() {
  save(home);
  setTitle("Falar com atendimento");

  render(`
    ${card("1","👩‍⚕️","Aluno responsável","Quem te atendeu","green","aluno()")}
    ${card("2","📞","Recepção","Atendimento da clínica","blue","recepcao()")}
  `);

  setSpeech(
    "Com quem você quer falar?",
    [
      "Opção 1, botão verde: aluno responsável.",
      "Opção 2, botão azul: recepção."
    ]
  );
}

function aluno() {
  save(contato);
  setTitle("Aluno responsável");

  render(`
    <div class="box">
      <div class="big">👩‍⚕️</div>
      <h2>Ana Paula</h2>
      <p>Aluna responsável</p>
    </div>
    ${card("1","📲","Chamar no WhatsApp","Abrir conversa","green","whatsapp('aluno')")}
  `);

  setSpeech(
    "Este é o aluno responsável. Toque no botão verde para chamar no WhatsApp.",
    [
      "Opção 1, botão verde: chamar no WhatsApp."
    ]
  );
}

function recepcao() {
  setSpeech("Vou abrir o WhatsApp da recepção.");
  whatsapp("recepcao");
}

function whatsapp(tipo) {
  const numero = tipo === "aluno" ? "5573999999999" : "5573999999999";
  const texto = encodeURIComponent("Olá, preciso de ajuda com minha consulta na Clínica Escola Odontológica Unex.");
  window.open(`https://wa.me/${numero}?text=${texto}`, "_blank");
}
