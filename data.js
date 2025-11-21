// data.js

function obterCartaPorId(id) {
    return bancoDeCartas.find(c => c.id === parseInt(id));
}

// --- CONFIGURAÇÃO DE ZONAS ---
const bancoZonas = [
    {
        id: 1,
        nome: "Zona 1",
        descricao: "Onde tudo começa.",
        custoDesbloqueio: 0,
        pacotes: [
            // Estrutura padronizada, o que muda é o "peso" da sorte
            { nome: "Pacote A", custo: 50, set: "Novos Rostos", id_interno: "z1_p1" },
            { nome: "Pacote B", custo: 200, set: "Novos Rostos", id_interno: "z1_p2" },
            { nome: "Pacote C", custo: 1000, set: "Novos Rostos", id_interno: "z1_p3" }
        ]
    },
    {
        id: 2,
        nome: "O Asfalto",
        descricao: "Onde o dinheiro gira.",
        custoDesbloqueio: 50000, 
        pacotes: [
            { nome: "Pacote A", custo: 5000, set: "Inusitado", id_interno: "z2_p1" },
            { nome: "Pacote B", custo: 20000, set: "Inusitado", id_interno: "z2_p2" },
            { nome: "Pacote C", custo: 100000, set: "Inusitado", id_interno: "z2_p3" }
        ]
    }
];

// --- TAXAS DE DROP (BALANCEADAS) ---
// Agora temos: Comum, Incomum, Raro, Épico, Lendário, Mítico, Secreto
const bancoTaxasDrop = {
    // PACOTE 1 (O Barato): Muita carta lixo, mas uma chance honesta de brilhar
    "z1_p1": { "Comum": 50, "Incomum": 30, "Raro": 15, "Épico": 4, "Lendário": 0.8, "Mítico": 0.19, "Secreto": 0.01 },
    "z2_p1": { "Comum": 50, "Incomum": 30, "Raro": 15, "Épico": 4, "Lendário": 0.8, "Mítico": 0.19, "Secreto": 0.01 },

    // PACOTE 2 (O Médio): Mais equilibrado
    "z1_p2": { "Comum": 40, "Incomum": 35, "Raro": 18, "Épico": 5, "Lendário": 1.5, "Mítico": 0.4, "Secreto": 0.1 },
    "z2_p2": { "Comum": 40, "Incomum": 35, "Raro": 18, "Épico": 5, "Lendário": 1.5, "Mítico": 0.4, "Secreto": 0.1 },

    // PACOTE 3 (O Caro/Elite): Menos lixo, drops raros garantidos com mais frequência
    // Ajustei pra não ser "impossível". É difícil, mas pagando caro tem que vir coisa boa.
    "z1_p3": { "Comum": 30, "Incomum": 25, "Raro": 30, "Épico": 10, "Lendário": 3, "Mítico": 1.5, "Secreto": 0.5 },
    "z2_p3": { "Comum": 30, "Incomum": 25, "Raro": 30, "Épico": 10, "Lendário": 3, "Mítico": 1.5, "Secreto": 0.5 },

    "Padrao": { "Comum": 50, "Incomum": 25, "Raro": 15, "Épico": 8, "Lendário": 1.5, "Mítico": 0.4, "Secreto": 0.1 }
};

// --- CARTAS (COM TAGS E NOVA ESTRUTURA) ---
// Estrutura pedida: 2 Comuns, 1 Incomum, 1 Rara, 1 Épica, 1 Lendária, 1 Mítica, 1 Secreta por pacote.
const bancoDeCartas = [
    // --- ZONA 1: PACOTE 1 (Saco de Lixo) ---
    { id: 101, nome: "Katara (Treino)", raridade: "Comum", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Katara", imagem: "imagens/katara01.jpg", descricao: "O início.", artista: "A. Sereia" },
    { id: 102, nome: "Sokka (Piadista)", raridade: "Comum", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Sokka", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sokka", descricao: "Sempre com fome.", artista: "Tribo" },
    { id: 103, nome: "Soldado do Fogo", raridade: "Incomum", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Soldado", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fire", descricao: "Apenas um peão.", artista: "Nação Fogo" },
    { id: 104, nome: "Sailor (Civil)", raridade: "Raro", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Sailor Mars", imagem: "imagens/sailor mars.jpeg", descricao: "Dia de folga.", artista: "R. Hino" },
    { id: 105, nome: "Toph (Termas)", raridade: "Épico", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Toph", imagem: "imagens/toph.jpeg", descricao: "Pequena perigosa.", artista: "O. Terroso" },
    { id: 106, nome: "Evelyn (Treino)", raridade: "Lendário", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Evelyn", imagem: "imagens/evelynchevalier.jpeg", descricao: "Aquecimento.", artista: "J. Cavaleiro" },
    { id: 107, nome: "Goldship (Corrida)", raridade: "Mítico", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Goldship", imagem: "imagens/goldship.jpeg", descricao: "Sorte pura.", artista: "M. Zilla" },
    { id: 108, nome: "Avatar State", raridade: "Secreto", set: "Novos Rostos", pacote: "z1_p1", zona: 1, personagem: "Aang", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aang", descricao: "Poder divino.", artista: "Lenda" },

    // --- ZONA 1: PACOTE 2 (Básico) - Mesma lógica de estrutura ---
    { id: 111, nome: "Nami (Navegadora)", raridade: "Comum", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Nami", imagem: "imagens/nami01.jpeg", descricao: "Rotas.", artista: "E. Oda" },
    { id: 112, nome: "Usopp (Mentiroso)", raridade: "Comum", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Usopp", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Usopp", descricao: "Histórias.", artista: "E. Oda" },
    { id: 113, nome: "Zoro (Espadachim)", raridade: "Incomum", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Zoro", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoro", descricao: "Perdido.", artista: "E. Oda" },
    { id: 114, nome: "Katara (Mestra)", raridade: "Raro", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Katara", imagem: "imagens/katara02.jpg", descricao: "Dominadora.", artista: "A. Sereia" },
    { id: 115, nome: "Kasumi (Furtiva)", raridade: "Épico", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Kasumi", imagem: "imagens/kasumi01.jpeg", descricao: "Sombra.", artista: "T. Fantasma" },
    { id: 116, nome: "Tsunade (Aposta)", raridade: "Lendário", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Tsunade", imagem: "imagens/tsunade01.jpg", descricao: "Azar no jogo.", artista: "D. Zard" },
    { id: 117, nome: "Mabel (Festa)", raridade: "Mítico", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Mabel", imagem: "imagens/mabel01.jpg", descricao: "Alegria.", artista: "O. Oculto" },
    { id: 118, nome: "Dipper (Mistério)", raridade: "Secreto", set: "Novos Rostos", pacote: "z1_p2", zona: 1, personagem: "Dipper", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dipper", descricao: "O livro.", artista: "G. Falls" },

    // --- ZONA 1: PACOTE 3 (Maleta) ---
    { id: 121, nome: "Nami (Ladra)", raridade: "Comum", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Nami", imagem: "imagens/nami01.jpeg", descricao: "Carteira cheia.", artista: "E. Oda" },
    { id: 122, nome: "Sanji (Cozinheiro)", raridade: "Comum", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Sanji", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanji", descricao: "Prato feito.", artista: "E. Oda" },
    { id: 123, nome: "Chopper (Médico)", raridade: "Incomum", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Chopper", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chopper", descricao: "Cura.", artista: "E. Oda" },
    { id: 124, nome: "Evelyn (Armadura)", raridade: "Raro", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Evelyn", imagem: "imagens/evelynchevalier.jpeg", descricao: "Guerra.", artista: "J. Cavaleiro" },
    { id: 125, nome: "Tsunade (Hokage)", raridade: "Épico", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Tsunade", imagem: "imagens/tsunade01.jpg", descricao: "Líder.", artista: "D. Zard" },
    { id: 126, nome: "Goldship (Vencedora)", raridade: "Lendário", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Goldship", imagem: "imagens/goldship.jpeg", descricao: "Vitória.", artista: "M. Zilla" },
    { id: 127, nome: "Mabel & Pacifica", raridade: "Mítico", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Mabel", imagem: "imagens/mabel01.jpg", descricao: "Duo.", artista: "O. Oculto" },
    { id: 128, nome: "Bill Cipher", raridade: "Secreto", set: "Novos Rostos", pacote: "z1_p3", zona: 1, personagem: "Bill", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bill", descricao: "Caos.", artista: "G. Falls" },

    // --- MERCADO NEGRO (Global) ---
    { id: 901, nome: "O Agiota", raridade: "Raro", set: "Mercado Negro", zona: 1, personagem: "Agiota", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Agiota", descricao: "Juros.", artista: "Submundo" },
    { id: 902, nome: "Dona da Quebrada", raridade: "Épico", set: "Mercado Negro", zona: 1, personagem: "Dona", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dona", descricao: "Chefe.", artista: "Submundo" },
    { id: 903, nome: "Komi Shouko", raridade: "Lendário", set: "Mercado Negro", zona: 1, personagem: "Komi", imagem: "imagens/KomiShouko.jpeg", descricao: "Silêncio.", artista: "Submundo" },
    { id: 904, nome: "O Hacker", raridade: "Mítico", set: "Mercado Negro", zona: 1, personagem: "Hacker", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hacker", descricao: "Acesso.", artista: "Submundo" },
    { id: 905, nome: "Fantasma", raridade: "Secreto", set: "Mercado Negro", zona: 1, personagem: "Fantasma", imagem: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost", descricao: "Vulto.", artista: "Submundo" }
];

const bancoUpgrades = [
    { id: "upg_renda_1", nome: "Corrente de Ouro", desc: "Aumenta Renda em 10%.", custo: 5000, efeito: "renda_multiplicador", valor: 0.10, icone: "⛓️" },
    { id: "upg_sorte_1", nome: "Amuleto da Sorte", desc: "Aumenta sua Sorte em +2.", custo: 2000, efeito: "sorte_add", valor: 2, icone: "🍀" },
    { id: "upg_sorte_2", nome: "Pé de Coelho", desc: "Sorte +5. Drops melhores.", custo: 15000, efeito: "sorte_add", valor: 5, icone: "🐇" }
];

const bancoConquistas = [
    { id: 1, nome: "Primeiro Passo", desc: "Junte 500 de Grana", icone: "🪙", condicao: () => window.estadoJogo.grana >= 500, recompensa: () => { window.estadoJogo.grana += 100; window.mostrarNotificacao("Prêmio: +100 Grana!", "sucesso"); } },
    { id: 2, nome: "Colecionador de Kataras", desc: "Tenha 2 cartas da Katara", icone: "🌊", condicao: () => Object.values(window.estadoJogo.inventario).filter(c => c.personagem === 'Katara').length >= 2, recompensa: () => { window.estadoJogo.sorte += 1; window.salvar(); window.mostrarNotificacao("Prêmio: +1 Sorte (Kataras)!", "sucesso"); } },
    { id: 3, nome: "Sortudo", desc: "Abra 10 pacotes", icone: "🤞", condicao: () => Object.values(window.estadoJogo.pacotes).filter(k => k.toString().includes('_aberto')).length >= 10, recompensa: () => { window.estadoJogo.sorte += 1; window.salvar(); window.mostrarNotificacao("Prêmio: +1 Sorte Permanente!", "sucesso"); } }
];