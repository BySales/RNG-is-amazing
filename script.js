window.addEventListener('DOMContentLoaded', () => {

    // --- 1. ACHAR AS PEÇAS ---
    const telaLoja = document.getElementById('tela-loja');
    const telaInventario = document.getElementById('tela-inventario');
    const telaAlbum = document.getElementById('tela-album');
    const modalPerfil = document.getElementById('modal-perfil');
    const telaMetas = document.getElementById('tela-metas'); 
    
    // MODAL DETALHE
    const modalCartaDetalhe = document.getElementById('modal-carta-detalhe');
    const fecharCartaDetalheBtn = document.getElementById('fechar-carta-detalhe');
    const conteudoCartaDetalhe = document.getElementById('conteudo-carta-detalhe');
    
    const navLoja = document.getElementById('nav-loja');
    const navInventario = document.getElementById('nav-inventario');
    const navAlbum = document.getElementById('nav-album');
    const navMetas = document.getElementById('nav-metas'); 
    
    const navButtons = document.querySelectorAll('.nav-button');
    
    const botaoComprarPacoteA = document.getElementById('comprar-pacote-a');
    const botaoComprarPacoteB = document.getElementById('comprar-pacote-b');
    
    const btnLimparInventario = document.getElementById('btn-limpar-inventario');
    const btnVenderDuplicatas = document.getElementById('btn-vender-duplicatas'); 
    
    const mostradorGranaSpan = document.getElementById('valor-grana');
    const mostradorRendaSpan = document.getElementById('valor-renda');
    const contadorEquipeSpan = document.getElementById('contador-equipe');
    
    const areaResultado = document.getElementById('resultado');
    const areaInventario = document.getElementById('area-inventario');
    const areaAlbum = document.getElementById('area-album');
    const areaPacotes = document.getElementById('area-pacotes');
    const areaEquipe = document.getElementById('area-equipe');
    const containerNotificacoes = document.getElementById('container-notificacoes');

    // PEÇAS NOVAS DO PERFIL E METAS
    const perfilResumo = document.getElementById('perfil-resumo');
    const fecharPerfilBtn = document.getElementById('fechar-perfil');
    const editarPerfilBtn = document.getElementById('btn-editar-perfil');
    const areaMetas = document.getElementById('area-metas'); 

    // AUTO-ABRIR
    const autoAbrirBtn = document.getElementById('auto-abrir-pacote');
    const stopAutoAbrirBtn = document.getElementById('stop-auto-abrir');
    const qtdAutoAbrirSelect = document.getElementById('quantidade-auto-abrir');
    const tipoAutoAbrirSelect = document.getElementById('tipo-auto-abrir');

    // --- 2. DADOS & CONFIGURAÇÕES ---
    const CHAVE_INVENTARIO = 'meuInventarioRNG';
    const CHAVE_GRANA = 'minhaGranaRNG';
    const CHAVE_PACOTES = 'meusPacotesRNG';
    const CHAVE_PRIMEIRA_COMPRA = 'minhaPrimeiraCompraRNG';
    const CHAVE_EQUIPE = 'minhaEquipeRNG';
    const CHAVE_PERFIL = 'meuPerfilRNG'; 
    const CHAVE_CONQUISTAS = 'minhasConquistasRNG'; 
    
    // Configs da Loja Diária
    const CHAVE_LOJA_DIARIA = 'minhaLojaDiariaRNG';
    const TEMPO_REFRESH = 15 * 60 * 1000; // 15 minutos
    let dadosLoja = { ofertas: [], proximoRefresh: 0 };
    
    let inventario = {}; 
    let inventarioPacotes = {};
    let equipe = []; 
    let grana = 0;
    let rendaPorSegundo = 0;
    let primeiraCompra = true;

    // ESTADO DO PERFIL 
    let perfil = { nome: "Visitante", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mandrake" };
    let conquistasDesbloqueadas = []; 
    let chancePacoteExtra = 0; 
    
    let autoAbrirInterval = null; 
    let contagemRestante = 0;    
    
    const CUSTO_NORMAL = 100;
    const CUSTO_DESCONTO = 35;
    const TAMANHO_MAX_EQUIPE = 5; 
    
    const CUSTOS_UPGRADE = { 1: 2, 2: 4, 3: 8, 4: 10 };
    const NIVEL_MAXIMO = 5;
    const PRECOS_VENDA = { 'comum': 1, 'raro': 5, 'épico': 20, 'lendário': 50, 'mítico': 100, 'secreto': 250 };
    
    // Preços para o Mercado Negro
    const PRECOS_LOJA = { 'comum': 500, 'raro': 2500, 'épico': 10000, 'lendário': 75000, 'mítico': 500000, 'secreto': 2000000 };

    const RENDAS_BASE = {
        'comum': 1, 'raro': 5, 'épico': 15,
        'lendário': 50, 'mítico': 150, 'secreto': 500
    };

    // FUNÇÃO HELPER: Retorna o texto da recompensa
    function obterRecompensaTexto(id) {
        if (id === 1) return "Recompensa: +100 Grana";
        if (id === 2) return "Recompensa: +500 Grana";
        if (id === 3) return "Recompensa: +1 Pacote Novos Rostos";
        if (id === 4) return "Recompensa: Moral elevado";
        if (id === 5) return "Bônus RNG: +33% chance de carta extra!";
        return "Nenhuma recompensa ativa";
    }

    // --- NOTIFICAÇÕES ---
    function mostrarNotificacao(msg, tipo='sucesso') {
        const n = document.createElement('div');
        n.className = `notificacao ${tipo}`;
        n.innerText = msg;
        containerNotificacoes.appendChild(n);
        setTimeout(()=>n.remove(), 3000);
    }

    // --- PERSISTÊNCIA ---
    function salvarTudo() {
        localStorage.setItem(CHAVE_GRANA, Math.floor(grana).toString());
        localStorage.setItem(CHAVE_INVENTARIO, JSON.stringify(inventario));
        localStorage.setItem(CHAVE_PACOTES, JSON.stringify(inventarioPacotes));
        localStorage.setItem(CHAVE_PRIMEIRA_COMPRA, JSON.stringify(primeiraCompra));
        localStorage.setItem(CHAVE_EQUIPE, JSON.stringify(equipe));
        salvarPerfil(); 
        localStorage.setItem('chanceExtraRNG', chancePacoteExtra.toString()); 
        salvarLoja(); // Salva o estado da loja também
    }
    
    function carregarTudo() {
        grana = parseInt(localStorage.getItem(CHAVE_GRANA) || '0');
        inventario = JSON.parse(localStorage.getItem(CHAVE_INVENTARIO) || '{}');
        inventarioPacotes = JSON.parse(localStorage.getItem(CHAVE_PACOTES) || '{}');
        equipe = JSON.parse(localStorage.getItem(CHAVE_EQUIPE) || '[]');
        
        const pcSalvo = localStorage.getItem(CHAVE_PRIMEIRA_COMPRA);
        primeiraCompra = pcSalvo !== null ? JSON.parse(pcSalvo) : true;
        for(let id in inventario) if(!inventario[id].nivel) inventario[id].nivel=1;

        carregarPerfil(); 
        chancePacoteExtra = parseInt(localStorage.getItem('chanceExtraRNG') || '0'); 
    }

    // --- SISTEMA DE PERFIL E METAS ---
    function carregarPerfil() {
        const dadosSalvos = localStorage.getItem(CHAVE_PERFIL);
        const conquistasSalvas = localStorage.getItem(CHAVE_CONQUISTAS);
        
        if (dadosSalvos) perfil = JSON.parse(dadosSalvos);
        if (conquistasSalvas) conquistasDesbloqueadas = JSON.parse(conquistasSalvas);
        
        atualizarDisplayPerfil();
    }

    function salvarPerfil() {
        localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
        localStorage.setItem(CHAVE_CONQUISTAS, JSON.stringify(conquistasDesbloqueadas));
    }

    function atualizarDisplayPerfil() {
        document.getElementById('nome-jogador').innerText = perfil.nome;
        document.getElementById('img-avatar-mini').src = perfil.avatar;
        document.getElementById('nome-jogador-modal').innerText = perfil.nome;
        document.getElementById('img-avatar-grande').src = perfil.avatar;
        document.getElementById('conquistas-modal').innerText = conquistasDesbloqueadas.length; 
        
        const total = conquistasDesbloqueadas.length;
        let titulo = "Novato";
        if(total >= 1) titulo = "Apostador";
        if(total >= 3) titulo = "Magnata";
        if(total >= 5) titulo = "Colecionador Brabo";
        document.getElementById('titulo-jogador').innerText = titulo;
        document.getElementById('titulo-jogador-modal').innerText = titulo;
    }

    function abrirEditorPerfil() {
        const novoNome = prompt("Qual é o seu vulgo (nome)?", perfil.nome);
        if (novoNome) perfil.nome = novoNome;

        const novaFoto = prompt("Cole o ENDEREÇO da sua foto de perfil (URL completa):", perfil.avatar);
        if (novaFoto) {
            if (novaFoto.startsWith('http')) perfil.avatar = novaFoto;
            else {
                mostrarNotificacao("URL inválida, usando avatar padrão.", "erro");
                perfil.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${perfil.nome}`; 
            }
        } else if (novoNome) {
             perfil.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${novoNome}`; 
        }

        salvarPerfil();
        atualizarDisplayPerfil();
        mostrarNotificacao("Perfil atualizado!", "sucesso");
    }

    // LÓGICA DE CHECAGEM DE METAS 
    function checarConquistas() {
        let houveMudanca = false;
        
        bancoConquistas.forEach(cq => {
            if (cq.id === 5) {
                const abertos = (inventarioPacotes["Novos Rostos_aberto"] || 0) + (inventarioPacotes["Inusitado_aberto"] || 0);
                cq.desc = `Abra 2000 cartas. (Progresso: ${abertos}/2000)`;
            }

            if (!conquistasDesbloqueadas.includes(cq.id) && cq.condicao()) {
                conquistasDesbloqueadas.push(cq.id);
                cq.recompensa(); 
                mostrarNotificacao(`🏆 META BATIDA: ${cq.nome}!`, "sucesso");
                houveMudanca = true;
            }
        });
        
        if (houveMudanca) {
            salvarPerfil(); 
            if (document.getElementById('tela-metas').classList.contains('tela-ativa')) {
                 renderizarMetas();
            }
            atualizarDisplayPerfil();
        }
    }

    function renderizarMetas() {
        areaMetas.innerHTML = ''; 
        bancoConquistas.forEach(cq => {
            const tem = conquistasDesbloqueadas.includes(cq.id);
            const statusClass = tem ? 'desbloqueada' : '';
            const tagClass = tem ? 'tag-concluida' : 'tag-pendente';
            const statusText = tem ? 'CONCLUÍDA' : 'PENDENTE';
            const recompensaText = obterRecompensaTexto(cq.id);

            const div = document.createElement('div');
            div.className = `meta-card ${statusClass}`;
            div.title = cq.desc; 
            div.innerHTML = `
                <div class="meta-icone-container">${tem ? cq.icone : '🔒'}</div>
                <div class="meta-info">
                    <span class="meta-titulo">${cq.nome}</span>
                    <span class="meta-desc">${cq.desc}</span>
                </div>
                <div class="meta-recompensa">
                    <span class="meta-status-tag ${tagClass}">${statusText}</span>
                    <span class="meta-desc" style="color: #00ff00; font-weight:700;">${recompensaText}</span>
                </div>
            `;
            areaMetas.appendChild(div);
        });
    }

    // --- LÓGICA DO MODAL DE DETALHES DA CARTA ---
    function abrirDetalheCarta(id) {
        const carta = obterCartaPorId(id);
        
        if (!carta) {
            if(document.getElementById('tela-album').classList.contains('tela-ativa')) {
                 mostrarNotificacao("Carta não obtida. ???", "info");
                 return;
            }
            mostrarNotificacao("Carta não encontrada!", "erro");
            return;
        }

        const i = inventario[id];
        const nivel = i ? `Nvl. ${i.nivel}` : 'Nvl. 1'; 
        const status = i ? `Em posse (x${i.quantidade})` : 'Não obtida';
        const raridadeClass = carta.raridade.toLowerCase().replace('é', 'e');

        conteudoCartaDetalhe.innerHTML = `
            <img id="detalhe-imagem" class="${raridadeClass}" src="${carta.imagem}" alt="${carta.nome}">
            <span id="detalhe-nome">${carta.nome} (${nivel})</span>
            <span id="detalhe-raridade" class="${raridadeClass}">${carta.raridade.toUpperCase()} - ${status}</span>
            <p id="detalhe-descricao">${carta.descricao}</p>
            <p id="detalhe-artista">Arte por: ${carta.artista}</p>
        `;
        modalCartaDetalhe.classList.remove('tela-escondida');
    }

    // --- LÓGICA DE BOAS-VINDAS ---
    function checarNovoJogador() {
        const temCartas = Object.keys(inventario).length > 0;
        const temPacotes = Object.keys(inventarioPacotes).length > 0;
        if (!temCartas && !temPacotes) {
            const cartaInicial = bancoDeCartas.find(c => c.id === 101); 
            inventario[cartaInicial.id] = { ...cartaInicial, quantidade: 1, nivel: 1 };
            equipe.push(cartaInicial.id.toString());
            salvarTudo();
            mostrarNotificacao(`Bem-vindo! Você ganhou uma ${cartaInicial.nome} para começar!`, "info");
        }
    }

    // --- SISTEMA DE EQUIPE E RENDA ---
    function calcularRendaTotal() {
        let total = 0;
        equipe.forEach(id => {
            const carta = inventario[id];
            if (carta) {
                const rendaBase = RENDAS_BASE[carta.raridade.toLowerCase()] || 0;
                total += rendaBase * carta.nivel;
            }
        });
        rendaPorSegundo = total;
        mostradorRendaSpan.textContent = total;
    }

    function equiparCarta(id) {
        id = id.toString();
        if (equipe.includes(id)) {
            mostrarNotificacao("Esta carta já está na equipe!", "erro");
            return;
        }
        if (equipe.length >= TAMANHO_MAX_EQUIPE) {
            mostrarNotificacao("Sua equipe está cheia! Remova alguém antes.", "erro");
            return;
        }
        equipe.push(id);
        salvarTudo();
        calcularRendaTotal();
        atualizarDisplayInventario();
        atualizarDisplayEquipe();
        mostrarNotificacao("Carta equipada!", "sucesso");
    }

    function removerDaEquipe(id) {
        id = id.toString();
        const index = equipe.indexOf(id);
        if (index > -1) {
            equipe.splice(index, 1);
            salvarTudo();
            calcularRendaTotal();
            atualizarDisplayInventario();
            atualizarDisplayEquipe();
            mostrarNotificacao("Carta removida da equipe.", "info");
        }
    }

    // MOTOR DO IDLE
    setInterval(() => {
        if (rendaPorSegundo > 0) {
            grana += rendaPorSegundo;
            salvarGrana();
            atualizarDisplayGrana();
        }
        checarConquistas();
    }, 1000);
    function salvarGrana() { localStorage.setItem(CHAVE_GRANA, Math.floor(grana).toString()); }
    
    // --- SISTEMA DE LOJA ROTATIVA (MERCADO NEGRO) ---
    function carregarLojaDiaria() {
        const salvo = localStorage.getItem(CHAVE_LOJA_DIARIA);
        const agora = Date.now();

        if (salvo) {
            dadosLoja = JSON.parse(salvo);
        }

        // Se não tiver dados ou o tempo já passou, gera nova loja
        if (!dadosLoja.proximoRefresh || agora >= dadosLoja.proximoRefresh) {
            gerarNovaLoja();
        } else {
            renderizarLojaDiaria();
        }
        
        atualizarTimerLoja();
        setInterval(atualizarTimerLoja, 1000);
    }

    function gerarNovaLoja() {
        const agora = Date.now();
        dadosLoja.proximoRefresh = agora + TEMPO_REFRESH;
        dadosLoja.ofertas = [];

        for (let i = 0; i < 3; i++) {
            let cartaSorteada;
            
            // 30% de chance de vir carta exclusiva do Mercado Negro
            if (Math.random() < 0.3) {
                const exclusivas = bancoDeCartas.filter(c => c.set === "Mercado Negro");
                cartaSorteada = exclusivas[Math.floor(Math.random() * exclusivas.length)];
            } else {
                // Senão pega qualquer uma (menos as exclusivas)
                const normais = bancoDeCartas.filter(c => c.set !== "Mercado Negro");
                cartaSorteada = normais[Math.floor(Math.random() * normais.length)];
            }

            dadosLoja.ofertas.push({ id: cartaSorteada.id, comprado: false });
        }

        salvarLoja();
        renderizarLojaDiaria();
        mostrarNotificacao("🔄 Mercado Negro atualizado! Novas ofertas.", "info");
    }

    function salvarLoja() {
        localStorage.setItem(CHAVE_LOJA_DIARIA, JSON.stringify(dadosLoja));
    }

    function renderizarLojaDiaria() {
        const container = document.getElementById('area-loja-diaria');
        container.innerHTML = '';

        dadosLoja.ofertas.forEach((oferta, index) => {
            const cartaInfo = obterCartaPorId(oferta.id);
            if (!cartaInfo) return; // Segurança

            const preco = PRECOS_LOJA[cartaInfo.raridade.toLowerCase()] || 1000;
            
            const div = document.createElement('div');
            div.className = 'item-loja';
            
            const estilo = oferta.comprado ? 'filter: grayscale(100%); opacity: 0.6;' : '';
            const textoBtn = oferta.comprado ? 'Esgotado' : `Comprar`;
            const disabled = oferta.comprado || grana < preco ? 'disabled' : '';

            div.innerHTML = `
                <div class="carta ${cartaInfo.raridade.toLowerCase()}" style="transform: scale(0.8); margin-bottom: -30px; ${estilo}">
                    <img src="${cartaInfo.imagem}" class="imagem-carta">
                    <div class="area-info-gradiente">
                        <span class="nome-carta-gradiente">${cartaInfo.nome}</span>
                        <span class="raridade-carta-gradiente">[${cartaInfo.raridade}]</span>
                    </div>
                </div>
                <div style="text-align:center; width:100%; z-index:5;">
                    <span class="preco-carta">💰 ${preco}</span>
                    <button class="btn-comprar-carta" ${disabled} onclick="comprarCartaLoja(${index}, ${preco})">
                        ${textoBtn}
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    window.comprarCartaLoja = function(index, preco) {
        if (grana < preco) {
            mostrarNotificacao("Sem grana, parceiro!", "erro");
            return;
        }
        
        const oferta = dadosLoja.ofertas[index];
        if (oferta.comprado) return;

        grana -= preco;
        oferta.comprado = true;
        
        const cartaReal = obterCartaPorId(oferta.id);
        if (inventario[cartaReal.id]) {
            inventario[cartaReal.id].quantidade++;
        } else {
            inventario[cartaReal.id] = { ...cartaReal, quantidade: 1, nivel: 1 };
        }

        salvarLoja();
        salvarTudo();
        atualizarDisplayGrana();
        renderizarLojaDiaria();
        atualizarDisplayInventario();
        mostrarNotificacao(`Negócio fechado! ${cartaReal.nome} obtida.`, "sucesso");
    }

    function atualizarTimerLoja() {
        const agora = Date.now();
        let restante = dadosLoja.proximoRefresh - agora;

        if (restante <= 0) {
            gerarNovaLoja();
            restante = TEMPO_REFRESH;
        }

        const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((restante % (1000 * 60)) / 1000);
        
        document.getElementById('tempo-restante-loja').innerText = 
            `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    // --- LÓGICA DE ABERTURA AUTOMÁTICA ---
    function iniciarAutoAbrir() {
        const quantidadeSelecionada = parseInt(qtdAutoAbrirSelect.value);
        const tipoPacote = tipoAutoAbrirSelect.value; 
        
        let pacotesDisponiveis = inventarioPacotes[tipoPacote] || 0;
        
        contagemRestante = (quantidadeSelecionada === 999) 
            ? pacotesDisponiveis
            : Math.min(quantidadeSelecionada, pacotesDisponiveis);
        
        if (contagemRestante <= 0) {
            mostrarNotificacao(`Você não tem pacotes ${tipoPacote} para abrir!`, "erro");
            return;
        }

        autoAbrirBtn.disabled = true;
        stopAutoAbrirBtn.disabled = false;
        areaResultado.innerHTML = '';
        mostrarNotificacao(`Auto-Abrir ${contagemRestante}x Pacotes ${tipoPacote} iniciado!`, "info");
        
        autoAbrirInterval = setInterval(() => {
            if (contagemRestante > 0) {
                abrirPacote(tipoPacote, true);
                contagemRestante--;
                autoAbrirBtn.textContent = `Abrindo (${contagemRestante} pacotes restantes)`;
            } else {
                pararAutoAbrir("Concluído!");
            }
        }, 500); 
    }

    function pararAutoAbrir(motivo = "Parado pelo usuário.") {
        clearInterval(autoAbrirInterval);
        autoAbrirInterval = null;
        contagemRestante = 0;
        
        autoAbrirBtn.disabled = false;
        stopAutoAbrirBtn.disabled = true;
        autoAbrirBtn.textContent = `Auto-Abrir (x${qtdAutoAbrirSelect.value})`;

        mostrarNotificacao(`Auto-Abrir finalizado. ${motivo}`, "info");
        atualizarDisplayPacotes();
        atualizarDisplayInventario();
    }
    
    // --- DISPLAYS ---
    function atualizarDisplayGrana() {
        mostradorGranaSpan.textContent = Math.floor(grana);
        const custoAtual = primeiraCompra ? CUSTO_DESCONTO : CUSTO_NORMAL;
        const pode = grana >= custoAtual;
        const textoBotao = primeiraCompra ? `Comprar (Promo: ${CUSTO_DESCONTO})` : `Comprar (${CUSTO_NORMAL})`;
        
        botaoComprarPacoteA.innerHTML = `Comprar [Novos Rostos] <br><small>${textoBotao}</small>`;
        botaoComprarPacoteA.disabled = !pode;
        
        botaoComprarPacoteB.innerHTML = `Comprar [Inusitado] <br><small>${textoBotao}</small>`;
        botaoComprarPacoteB.disabled = !pode;
    }

    function atualizarDisplayPacotes() {
        areaPacotes.innerHTML = '';
        const a = inventarioPacotes["Novos Rostos"] || 0;
        const b = inventarioPacotes["Inusitado"] || 0; 
        
        areaPacotes.innerHTML += `<button id="abrir-pacote-a" class="botao-abrir-pacote" ${a===0?'disabled':''}>Abrir [Novos Rostos] <span>(x${a})</span></button>`;
        areaPacotes.innerHTML += `<button id="abrir-pacote-b" class="botao-abrir-pacote" ${b===0?'disabled':''}>Abrir [Inusitado] <span>(x${b})</span></button>`;
    }

    function atualizarDisplayEquipe() {
        areaEquipe.innerHTML = '';
        contadorEquipeSpan.innerText = `(${equipe.length}/${TAMANHO_MAX_EQUIPE})`;
        for (let i = 0; i < TAMANHO_MAX_EQUIPE; i++) {
            const idCarta = equipe[i];
            if (idCarta && inventario[idCarta]) {
                const c = inventario[idCarta];
                const rendaCarta = (RENDAS_BASE[c.raridade.toLowerCase()] || 0) * c.nivel;
                const div = document.createElement('div');
                div.className = `carta ${c.raridade.toLowerCase()} inventario`;
                div.dataset.id = c.id; 
                div.innerHTML = `
                    <img src="${c.imagem}" class="imagem-carta">
                    <span class="nivel-carta">Nvl. ${c.nivel}</span>
                    <div class="area-info-gradiente">
                        <span class="nome-carta-gradiente">${c.nome}</span>
                        <span class="renda-carta">+${rendaCarta}/s</span>
                        <span class="raridade-carta-gradiente">[${c.raridade}]</span>
                        <button class="btn-equipar btn-remover" data-id="${c.id}">Remover</button>
                    </div>
                `;
                areaEquipe.appendChild(div);
            } else {
                const slot = document.createElement('div');
                slot.className = 'slot-vazio';
                slot.innerText = "Vazio";
                areaEquipe.appendChild(slot);
            }
        }
    }

    function atualizarDisplayInventario() {
        areaInventario.innerHTML = ''; 
        const lista = Object.values(inventario);
        lista.sort((a, b) => a.id - b.id); 
        if (lista.length === 0) { areaInventario.innerHTML = '<p style="color:#888">Vazio...</p>'; return; }
        
        lista.forEach(c => {
            const nova = document.createElement('div');
            nova.classList.add('carta', c.raridade.toLowerCase(), 'inventario');
            nova.dataset.id = c.id; 
            const rendaCarta = (RENDAS_BASE[c.raridade.toLowerCase()] || 0) * c.nivel;
            const custo = CUSTOS_UPGRADE[c.nivel];
            const max = (c.nivel >= NIVEL_MAXIMO || !custo);
            const podeUpar = !max && (c.quantidade > custo);
            
            const estaEquipada = equipe.includes(c.id.toString());
            let btnEquiparHTML = '';
            if (estaEquipada) {
                btnEquiparHTML = `<button class="btn-equipar btn-remover" data-id="${c.id}">Remover</button>`;
            } else {
                const cheio = equipe.length >= TAMANHO_MAX_EQUIPE;
                btnEquiparHTML = `<button class="btn-equipar" data-id="${c.id}" ${cheio ? 'disabled' : ''}>Equipar</button>`;
            }

            let btnUparHTML = '';
            if (!max) { 
                btnUparHTML = podeUpar ? 
                    `<button class="btn-upar" data-id="${c.id}">Upar (${custo}/${c.quantidade-1})</button>` : 
                    `<button class="btn-upar" disabled>Falta: ${custo - (c.quantidade-1)}</button>`;
            }
            
            nova.classList.add('com-btn-upar');
            
            nova.innerHTML = `
                <img src="${c.imagem}" class="imagem-carta">
                <span class="nivel-carta">Nvl. ${c.nivel}</span>
                <span class="quantidade-carta">x${c.quantidade}</span>
                <div class="area-info-gradiente">
                    <span class="nome-carta-gradiente">${c.nome}</span>
                    <span class="renda-carta">+${rendaCarta}/s</span>
                    <span class="raridade-carta-gradiente">[${c.raridade}]</span>
                    ${btnEquiparHTML}
                    ${btnUparHTML}
                </div>`;
            areaInventario.appendChild(nova);
        });
    }

    function atualizarDisplayAlbum() {
        areaAlbum.innerHTML = ''; 
        bancoDeCartas.forEach(b => {
            const i = inventario[b.id];
            const descoberto = i !== undefined;
            const nova = document.createElement('div');
            nova.classList.add('carta', 'inventario'); 
            nova.dataset.id = b.id; 
            if (descoberto) {
                nova.classList.add(b.raridade.toLowerCase());
                nova.innerHTML = `
                    <img src="${b.imagem}" alt="${b.nome}" class="imagem-carta">
                    <span class="nivel-carta">Nvl. ${i.nivel}</span>
                    <div class="area-info-gradiente">
                        <span class="nome-carta-gradiente">${b.nome}</span>
                        <span class="raridade-carta-gradiente">[${b.raridade}]</span>
                    </div>`;
            } else {
                nova.classList.add('escondida');
                nova.innerHTML = `
                    <img src="imagens/placeholder.png" alt="???" class="imagem-carta">
                    <div class="area-info-gradiente">
                        <span class="nome-carta-gradiente">??????</span>
                        <span class="raridade-carta-gradiente">[${b.raridade}]</span>
                    </div>`;
            }
            areaAlbum.appendChild(nova);
        });
    }

    // --- AÇÕES ---
    function sortearRaridade() {
        // VOLTAMOS AO MODO ORIGINAL E JUSTO (SEM HACK)
        const r = Math.random() * 100;
        if (r <= 60) return "Comum"; 
        else if (r <= 85) return "Raro"; 
        else if (r <= 95) return "Épico";
        else if (r <= 99) return "Lendário"; 
        else if (r <= 99.9) return "Mítico"; 
        else return "Secreto";
    }
    function pegarCarta(raridade, set) {
        const pool = bancoDeCartas.filter(c => c.raridade === raridade && c.set === set);
        if (pool.length === 0) return pegarCarta("Comum", set);
        return {...pool[Math.floor(Math.random() * pool.length)]};
    }

    function comprarPacote(set) {
        const custoAtual = primeiraCompra ? CUSTO_DESCONTO : CUSTO_NORMAL;
        if (grana < custoAtual) { mostrarNotificacao("Grana insuficiente!", "erro"); return; }
        grana -= custoAtual;
        if (primeiraCompra) { primeiraCompra = false; mostrarNotificacao("Promoção usada!", "info"); }
        inventarioPacotes[set] = (inventarioPacotes[set] || 0) + 1;
        salvarTudo(); atualizarDisplayGrana(); atualizarDisplayPacotes();
        mostrarNotificacao(`Comprou 1 ${set}!`, "sucesso");
    }

    let animando = false;
    function abrirPacote(set, isAuto = false) {
        if (!isAuto && animando) return;
        
        if (!inventarioPacotes[set] || inventarioPacotes[set] <= 0) {
            if (isAuto) {
                pararAutoAbrir("Pacotes esgotados.");
            } else {
                 mostrarNotificacao("Sem pacotes!", "erro");
            }
            return;
        }
        
        animando = !isAuto; 
        inventarioPacotes[set]--;
        
        inventarioPacotes[`${set}_aberto`] = (inventarioPacotes[`${set}_aberto`] || 0) + 1;

        if (!isAuto) {
            botaoComprarPacoteA.disabled = true;
            botaoComprarPacoteB.disabled = true;
        }

        salvarTudo();
        if (!isAuto) atualizarDisplayPacotes();
        areaResultado.innerHTML = '';
        
        const pct = [pegarCarta("Comum",set), pegarCarta("Comum",set), pegarCarta("Comum",set), pegarCarta("Raro",set)];
        pct.push(pegarCarta(sortearRaridade(), set));
        
        if (chancePacoteExtra > 0 && Math.random() * 100 < chancePacoteExtra) {
            pct.push(pegarCarta(sortearRaridade(), set));
            if (!isAuto) mostrarNotificacao(`⭐ BÔNUS! Carta extra (${chancePacoteExtra}%)!`, "info");
        }
        
        pct.forEach(c => {
            const id = c.id;
            if (inventario[id]) inventario[id].quantidade++;
            else { c.quantidade=1; c.nivel=1; inventario[id]=c; }
        });
        salvarTudo();
        calcularRendaTotal(); 

        if (isAuto) {
            mostrarNotificacao(`Inventário atualizado! +${pct.length} Cartas deste pacote.`, "sucesso");
            const maisRara = pct.sort((a,b) => RENDAS_BASE[b.raridade.toLowerCase()] - RENDAS_BASE[a.raridade.toLowerCase()])[0];
            
            const nova = document.createElement('div');
            nova.classList.add('carta', maisRara.raridade.toLowerCase());
            nova.innerHTML = `<img src="${maisRara.imagem}" class="imagem-carta"><div class="area-info-gradiente"><span class="nome-carta-gradiente">${maisRara.nome}</span><span class="raridade-carta-gradiente">[${maisRara.raridade}]</span></div>`;
            areaResultado.appendChild(nova);
            while (areaResultado.children.length > 1) {
                areaResultado.removeChild(areaResultado.firstChild);
            }

        } else {
            pct.forEach((c, i) => {
                const nova = document.createElement('div');
                nova.classList.add('carta', c.raridade.toLowerCase());
                // EFEITO VISUAL: As animações CSS que a gente criou vão ativar aqui
                nova.innerHTML = `<img src="${c.imagem}" class="imagem-carta"><div class="area-info-gradiente"><span class="nome-carta-gradiente">${c.nome}</span><span class="raridade-carta-gradiente">[${c.raridade}]</span></div>`;
                setTimeout(() => areaResultado.appendChild(nova), i * 300);
            });

            setTimeout(() => { 
                animando = false; 
                atualizarDisplayPacotes(); 
                atualizarDisplayGrana(); 
            }, pct.length * 300);
        }
        atualizarDisplayInventario();
    }

    function aprimorarCarta(id) {
        const c = inventario[id];
        if (!c) return;
        const custo = CUSTOS_UPGRADE[c.nivel];
        if (c.nivel < NIVEL_MAXIMO && custo && c.quantidade > custo) {
            c.quantidade -= custo; c.nivel++;
            salvarTudo(); 
            calcularRendaTotal(); 
            atualizarDisplayInventario();
            atualizarDisplayEquipe();
            mostrarNotificacao(`${c.nome} upada para Nvl ${c.nivel}!`, "sucesso");
        }
    }

    // --- VIGIAS ---
    botaoComprarPacoteA.addEventListener('click', () => comprarPacote("Novos Rostos"));
    botaoComprarPacoteB.addEventListener('click', () => comprarPacote("Inusitado"));

    perfilResumo.addEventListener('click', () => {
        modalPerfil.classList.remove('tela-escondida');
    });

    fecharPerfilBtn.addEventListener('click', () => {
        modalPerfil.classList.add('tela-escondida');
    });

    editarPerfilBtn.addEventListener('click', abrirEditorPerfil);
    
    fecharCartaDetalheBtn.addEventListener('click', () => {
        modalCartaDetalhe.classList.add('tela-escondida');
    });
    
    autoAbrirBtn.addEventListener('click', iniciarAutoAbrir);
    stopAutoAbrirBtn.addEventListener('click', () => pararAutoAbrir());
    
    qtdAutoAbrirSelect.addEventListener('change', () => {
        autoAbrirBtn.textContent = `Auto-Abrir (x${qtdAutoAbrirSelect.value})`;
    });

    function irParaTela(id) {
        [telaLoja, telaInventario, telaMetas, telaAlbum].forEach(t => t.classList.add('tela-escondida'));
        [telaLoja, telaInventario, telaMetas, telaAlbum].forEach(t => t.classList.remove('tela-ativa'));
        navButtons.forEach(b => b.classList.remove('active'));
        
        const alvo = document.getElementById(id);
        alvo.classList.remove('tela-escondida'); alvo.classList.add('tela-ativa');

        if (id === 'tela-loja') navLoja.classList.add('active');
        if (id === 'tela-inventario') { navInventario.classList.add('active'); areaResultado.innerHTML=''; }
        if (id === 'tela-metas') { navMetas.classList.add('active'); renderizarMetas(); } 
        if (id === 'tela-album') { navAlbum.classList.add('active'); atualizarDisplayAlbum(); }
    }

    navLoja.addEventListener('click', () => irParaTela('tela-loja'));
    navInventario.addEventListener('click', () => irParaTela('tela-inventario'));
    navMetas.addEventListener('click', () => irParaTela('tela-metas')); 
    navAlbum.addEventListener('click', () => irParaTela('tela-album'));

    btnLimparInventario.addEventListener('click', () => {
        if (confirm("RESETAR TUDO?")) {
            localStorage.clear(); 
            localStorage.setItem(CHAVE_GRANA, '0');
            grana = 0; 
            location.reload();
        }
    });

    btnVenderDuplicatas.addEventListener('click', () => {
        let totalG = 0, totalI = 0;
        for (const id in inventario) {
            const c = inventario[id];
            const custo = CUSTOS_UPGRADE[c.nivel];
            const max = (c.nivel >= NIVEL_MAXIMO || !custo);
            let qtd = 0;
            if (c.quantidade > 1) {
                if (max) qtd = c.quantidade - 1;
                else if (c.quantidade > custo) qtd = c.quantidade - (custo + 1);
            }
            if (qtd > 0) {
                const p = PRECOS_VENDA[c.raridade.toLowerCase()] || 0;
                if (p > 0) { totalG += p*qtd; totalI += qtd; inventario[id].quantidade -= qtd; }
            }
        }
        if (totalI > 0) {
            grana += totalG; salvarTudo(); atualizarDisplayInventario(); atualizarDisplayGrana();
            mostrarNotificacao(`Vendeu ${totalI} cartas por ${totalG}!`, "sucesso");
        } else mostrarNotificacao("Nada para vender.", "info");
    });
    
    function gerenciarCliquesCartas(e) {
        const btnUpar = e.target.closest('.btn-upar');
        const btnEquipar = e.target.closest('.btn-equipar');
        const cartaDiv = e.target.closest('.carta'); 
        
        if (btnUpar && !btnUpar.disabled) {
            aprimorarCarta(btnUpar.dataset.id);
            e.stopPropagation(); 
            return;
        }
        if (btnEquipar && !btnEquipar.disabled) {
            if (btnEquipar.classList.contains('btn-remover')) {
                removerDaEquipe(btnEquipar.dataset.id);
            } else {
                equiparCarta(btnEquipar.dataset.id);
            }
            e.stopPropagation();
            return;
        }
        
        if (cartaDiv && cartaDiv.dataset.id) {
            abrirDetalheCarta(cartaDiv.dataset.id);
        }
    }
    
    areaInventario.addEventListener('click', gerenciarCliquesCartas);
    areaEquipe.addEventListener('click', gerenciarCliquesCartas);
    areaAlbum.addEventListener('click', gerenciarCliquesCartas);

    areaPacotes.addEventListener('click', (e) => {
        const btn = e.target.closest('.botao-abrir-pacote');
        if (btn && !btn.disabled) {
            if (btn.id.includes('pacote-a')) abrirPacote("Novos Rostos");
            if (btn.id.includes('pacote-b')) abrirPacote("Inusitado");
        }
    });

    // INIT
    carregarTudo();
    checarNovoJogador();
    carregarLojaDiaria(); // CARREGA O MERCADO NEGRO
    calcularRendaTotal(); 
    atualizarDisplayInventario(); 
    atualizarDisplayEquipe();
    atualizarDisplayGrana(); 
    atualizarDisplayPacotes();
    atualizarDisplayPerfil(); 
    irParaTela('tela-loja');
});