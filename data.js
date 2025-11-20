// data.js

// FUNÇÃO HELPER: Retorna a carta pelo ID
function obterCartaPorId(id) {
    return bancoDeCartas.find(c => c.id === parseInt(id));
}

// --- CONFIGURAÇÃO DAS ZONAS (QUEBRADAS) ---
const bancoZonas = [
    {
        id: 1,
        nome: "O Beco",
        descricao: "Onde tudo começa. Cartas humildes, mas honestas.",
        custoDesbloqueio: 0, // Já começa liberada
        pacoteFoco: "Novos Rostos" // Nome do set principal daqui
    },
    {
        id: 2,
        nome: "O Asfalto",
        descricao: "A coisa ficou séria. O dinheiro gira mais rápido aqui.",
        custoDesbloqueio: 1000, // Precisa pagar pra liberar
        pacoteFoco: "Inusitado"
    }
];

// --- LISTA COMPLETA DE CARTAS ---
const bancoDeCartas = [
    // --- SET: NOVOS ROSTOS (Zona 1) ---
    { id: 101, nome: "Katara", raridade: "Comum", set: "Novos Rostos", zona: 1, imagem: "imagens/katara01.jpg", descricao: "A dominadora de água que tem a visão do jogo.", artista: "A. Sereia" },
    { id: 102, nome: "Sailor Mars", raridade: "Comum", set: "Novos Rostos", zona: 1, imagem: "imagens/sailor mars.jpeg", descricao: "Uma guerreira incansável.", artista: "R. Hino" },
    { id: 103, nome: "Toph", raridade: "Comum", set: "Novos Rostos", zona: 1, imagem: "imagens/toph.jpeg", descricao: "Mestra no domínio de terra.", artista: "O. Terroso" },
    { id: 104, nome: "Katara (V2)", raridade: "Raro", set: "Novos Rostos", zona: 1, imagem: "imagens/katara02.jpg", descricao: "Versão aprimorada.", artista: "A. Sereia" },
    { id: 105, nome: "Nami", raridade: "Raro", set: "Novos Rostos", zona: 1, imagem: "imagens/nami01.jpeg", descricao: "Gênio da navegação e finanças.", artista: "E. Oda" },
    { id: 106, nome: "Evelyn Chevalier", raridade: "Épico", set: "Novos Rostos", zona: 1, imagem: "imagens/evelynchevalier.jpeg", descricao: "Uma amazona lendária.", artista: "J. Cavaleiro" },
    { id: 107, nome: "Kasumi", raridade: "Épico", set: "Novos Rostos", zona: 1, imagem: "imagens/kasumi01.jpeg", descricao: "A ninja fantasma.", artista: "T. Fantasma" },
    { id: 108, nome: "Tsunade", raridade: "Lendário", set: "Novos Rostos", zona: 1, imagem: "imagens/tsunade01.jpg", descricao: "O poder do dragão adormecido.", artista: "D. Zard" },
    { id: 109, nome: "Goldship", raridade: "Mítico", set: "Novos Rostos", zona: 1, imagem: "imagens/goldship.jpeg", descricao: "A personificação da sorte bruta.", artista: "M. Zilla" },
    { id: 110, nome: "Mabel & Pacifica", raridade: "Secreto", set: "Novos Rostos", zona: 1, imagem: "imagens/mabel01.jpg", descricao: "Extremamente rara.", artista: "O. Oculto" },

    // --- SET: INUSITADO (Zona 2) ---
    { id: 201, nome: "Ningguang", raridade: "Comum", set: "Inusitado", zona: 2, imagem: "imagens/ningguangv1.jpg", descricao: "A carta base.", artista: "Time B" },
    { id: 202, nome: "Mihonda", raridade: "Comum", set: "Inusitado", zona: 2, imagem: "imagens/mihonda.jpg", descricao: "Lutador de rua.", artista: "Time B" },
    { id: 203, nome: "Cerestia", raridade: "Comum", set: "Inusitado", zona: 2, imagem: "imagens/cerestia.jpg", descricao: "O olheiro.", artista: "Time B" },
    { id: 204, nome: "Furina", raridade: "Raro", set: "Inusitado", zona: 2, imagem: "imagens/furina.jpg", descricao: "O negociador.", artista: "Time B" },
    { id: 205, nome: "Eula", raridade: "Raro", set: "Inusitado", zona: 2, imagem: "imagens/eula.jpg", descricao: "O investidor de baixo risco.", artista: "Time B" },
    { id: 206, nome: "Merinda", raridade: "Épico", set: "Inusitado", zona: 2, imagem: "imagens/merinda.jpg", descricao: "Um hacker.", artista: "Time B" },
    { id: 207, nome: "Furina (V2)", raridade: "Épico", set: "Inusitado", zona: 2, imagem: "imagens/furina01.jpg", descricao: "O estrategista.", artista: "Time B" },
    { id: 208, nome: "Melia", raridade: "Lendário", set: "Inusitado", zona: 2, imagem: "imagens/melia.jpg", descricao: "O chefão do crime.", artista: "Time B" },
    { id: 209, nome: "Ikumi Unagiya", raridade: "Mítico", set: "Inusitado", zona: 2, imagem: "imagens/Ikumiunagiya.jpeg", descricao: "Mestre da alquimia.", artista: "Time B" },
    { id: 210, nome: "Oosuki", raridade: "Secreto", set: "Inusitado", zona: 2, imagem: "imagens/Oosuki.jpeg", descricao: "A lenda urbana.", artista: "O. Oculto" },

    // --- MERCADO NEGRO (Global) ---
    { id: 901, nome: "O Agiota", raridade: "Raro", set: "Mercado Negro", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Agiota", descricao: "Empresta dinheiro a juros altos.", artista: "Submundo" },
    { id: 902, nome: "Dona da Quebrada", raridade: "Épico", set: "Mercado Negro", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dona", descricao: "Ninguém mexe com ela.", artista: "Submundo" },
    { id: 903, nome: "Komi Shouku", raridade: "Lendário", set: "Mercado Negro", imagem: "imagens/KomiShouko.jpeg", descricao: "Agrega valor ao camarote.", artista: "Submundo" },
    { id: 904, nome: "O Hacker", raridade: "Mítico", set: "Mercado Negro", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hacker", descricao: "Invade o sistema.", artista: "Submundo" },
    { id: 905, nome: "Fantasma do Asfalto", raridade: "Secreto", set: "Mercado Negro", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost", descricao: "Quem vê enriquece.", artista: "Submundo" }
];

// --- METAS (CONQUISTAS) ---
const bancoConquistas = [
    { id: 1, nome: "Primeiro Passo", desc: "Junte 500 de Grana", icone: "🪙", condicao: () => window.estadoJogo.grana >= 500, recompensa: () => { window.estadoJogo.grana += 100; window.mostrarNotificacao("Prêmio: +100 Grana!", "sucesso"); } },
    { id: 2, nome: "Barão", desc: "Junte 5.000 de Grana", icone: "💰", condicao: () => window.estadoJogo.grana >= 5000, recompensa: () => { window.estadoJogo.grana += 500; window.mostrarNotificacao("Prêmio: +500 Grana!", "sucesso"); } },
    { id: 3, nome: "Colecionador Brabo", desc: "Tenha 10 cartas diferentes", icone: "🃏", condicao: () => Object.keys(window.estadoJogo.inventario).length >= 10, recompensa: () => { window.estadoJogo.pacotes["Novos Rostos"] = (window.estadoJogo.pacotes["Novos Rostos"] || 0) + 1; window.salvar(); window.mostrarNotificacao("Prêmio: +1 Pacote Novos Rostos!", "sucesso"); } },
    { id: 4, nome: "Chefe de Equipe", desc: "Tenha 5 cartas na equipe", icone: "👥", condicao: () => window.estadoJogo.equipe.length >= 5, recompensa: () => window.mostrarNotificacao("Prêmio: Equipe completa! Moral em alta.", "info") },
    { id: 5, nome: "Abre-Pacotes", desc: `Abra 2000 cartas.`, icone: "⚡", condicao: () => (window.estadoJogo.pacotes["Novos Rostos_aberto"] || 0) + (window.estadoJogo.pacotes["Inusitado_aberto"] || 0) >= 2000, recompensa: () => { window.estadoJogo.chanceExtra = 33; window.salvar(); window.mostrarNotificacao("Prêmio: BÔNUS RNG! Carta extra (33%) DESBLOQUEADA!", "sucesso"); } }
];