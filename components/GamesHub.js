export function GamesHub(books, onNavigate, onStartGame) {
    const container = document.createElement('div');
    container.className = 'games-hub-container fade-in';
    
    // Função auxiliar para voltar para a tela inicial do Hub de Games
    const renderOriginalHub = () => {
        container.innerHTML = `
<!-- HERO -->
<div class="hero gh-hero">
  <div class="hero-badge"><span>🎮</span> ÁREA DE AVENTURAS</div>
  <h1>Mundo dos<br><em>Games</em></h1>
  <p class="hero-sub">Jogue, aprenda e ganhe XP enquanto mergulha nas histórias!</p>
  <div class="xp-strip">
    <div class="dot"></div> Ganhe XP em cada desafio e desbloqueie novos aventureiros
  </div>
</div>

<!-- TROPHY BANNER -->
<div class="trophy-banner">
  <div class="trophy-icon">🏆</div>
  <div class="trophy-text">
    <h3>Suas conquistas desbloqueiam recompensas!</h3>
    <p>Jogue mais para ganhar XP, subir de nível e revelar novos personagens.</p>
  </div>
  <div class="trophy-pills">
    <span class="trophy-pill">+20 XP por rodada</span>
    <span class="trophy-pill">🔓 Avatares especiais</span>
    <span class="trophy-pill">🎖️ Medalhas</span>
  </div>
</div>

<!-- GAMES GRID -->
<section class="games-section">
  <div class="games-grid">

    <!-- Card 1: Encontre o Objeto -->
    <div class="game-card gold-theme" id="btn-encontre-objeto" tabindex="0">
      <div class="card-art card-art-gold">
        <div class="card-art-glow gold-glow-el"></div>
        <div class="card-xp">+20 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-e">★</span>
        </div>
        <div class="card-emoji">🔍</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-gold">Atenção & Observação</span>
        <div class="card-title">Encontre o Objeto</div>
        <p class="card-desc">Itens mágicos estão escondidos nas ilustrações das histórias. Você consegue achar todos antes do tempo acabar?</p>
        <div class="card-chips">
          <span class="chip">⏱️ Contrarrelógio</span>
          <span class="chip">🖼️ Ilustrações reais</span>
          <span class="chip">🎯 Vários níveis</span>
        </div>
        <button class="btn-play btn-gold">▶ Jogar Agora</button>
      </div>
    </div>

    <!-- Card 2: Montar Cena (com a descrição do Ordenar História) -->
    <div class="game-card green-theme" id="btn-montar-cena" tabindex="0">
      <div class="card-art card-art-green">
        <div class="card-art-glow green-glow-el"></div>
        <div class="card-xp">+35 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span>
        </div>
        <div class="card-emoji">📖</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-green">Sequência & Lógica</span>
        <div class="card-title">Montar Cena</div>
        <p class="card-desc">As cenas da história estão embaralhadas! Arraste-as para a ordem certa e reconte a aventura do jeito correto.</p>
        <div class="card-chips">
          <span class="chip">🔀 Embaralhado</span>
          <span class="chip">🧩 Drag & Drop</span>
          <span class="chip">🖼️ Criatividade</span>
        </div>
        <button class="btn-play btn-green">▶ Jogar Agora</button>
      </div>
    </div>

    <!-- Card 3: Quiz da História -->
    <div class="game-card purple-theme" id="btn-quiz-historia" tabindex="0">
      <div class="card-art card-art-purple">
        <div class="card-art-glow purple-glow-el"></div>
        <div class="card-xp">+30 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span>
        </div>
        <div class="card-emoji">🧠</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-purple">Memória & Quiz</span>
        <div class="card-title">Quiz da História</div>
        <p class="card-desc">Responda perguntas sobre os capítulos que você leu. Prove que você é um verdadeiro Guardião das Histórias!</p>
        <div class="card-chips">
          <span class="chip">❓ Desafio Mental</span>
          <span class="chip">⚡ Conhecimento</span>
          <span class="chip">🏅 Recompensas</span>
        </div>
        <button class="btn-play btn-purple">▶ Jogar Agora</button>
      </div>
    </div>

    <!-- Card 4: Memória Mágica (NOVO) -->
    <div class="game-card blue-theme" id="btn-memoria-magica" tabindex="0">
      <div class="card-art card-art-blue">
        <div class="card-art-glow blue-glow-el"></div>
        <div class="card-xp">+40 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span>
        </div>
        <div class="card-emoji">🎴</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-blue">Foco & Competição</span>
        <div class="card-title">Memória Mágica</div>
        <p class="card-desc">Desafie sua mente ou duele contra um amigo! Encontre os pares revelando os pergaminhos mágicos das nossas fábulas.</p>
        <div class="card-chips">
          <span class="chip">⚔️ 1 ou 2 Jogadores</span>
          <span class="chip">⏱️ Turnos de 10s</span>
          <span class="chip">📜 Estilo RPG</span>
        </div>
        <button class="btn-play btn-blue">▶ Jogar Agora</button>
      </div>
    </div>

  </div>

</section>

<!-- BACK BUTTON -->
<div class="back-area">
  <button class="btn-back" id="gh-back-shelf">← Voltar para Estante</button>
</div>
        `;

        // Eventos
        container.querySelector('#gh-back-shelf').addEventListener('click', () => onNavigate('SHELF'));

        container.querySelector('#btn-encontre-objeto').addEventListener('click', () => {
            _mostrarTutorialEncontreObjeto();
        });

        container.querySelector('#btn-montar-cena').addEventListener('click', () => {
            abrirSelecaoMontarCena();
        });

        container.querySelector('#btn-quiz-historia').addEventListener('click', () => {
            abrirSelecaoQuiz();
        });

        container.querySelector('#btn-memoria-magica').addEventListener('click', () => {
            abrirSelecaoMemoria();
        });

        setTimeout(() => {
            if (window.lucide) {
                window.lucide.createIcons({ root: container });
            }
        }, 0);
    };

    // --- Seleção: Montar Cena ---
    const abrirSelecaoMontarCena = () => {
        const inventory = books || [];

        // Ignora livros de RPG e Animados (não compatíveis com esta mecânica)
        const aplicaveis = inventory.filter(ebook => 
            ebook.tipo !== 'RPG' && 
            ebook.categoria !== 'Fabula RPG' && 
            ebook.categoria !== 'Livros Animados'
        );

        // Filtra livros que têm pelo menos 4 storyPages com imagem e texto
        const disponiveis = aplicaveis.filter(ebook =>
            (ebook.storyPages || []).filter(p => p.image && (p.text || p.title)).length >= 4
        );

        const bloqueados = aplicaveis.filter(ebook =>
            (ebook.storyPages || []).filter(p => p.image && (p.text || p.title)).length < 4
        );

        _renderizarSelecaoLivro(disponiveis, bloqueados, 'Montar a Cena', 'Escolha uma história para jogar:', (ebook) => {
            if (window.BuildSceneGame) {
                window.BuildSceneGame.iniciar(ebook, ({ acertos, total, xpGanho }) => {
                    if (xpGanho > 0 && window.GamificationEngine) {
                        window.GamificationEngine.registrarMontarCena(xpGanho);
                    }
                });
            } else {
                console.error('[GamesHub] Componente BuildSceneGame não carregado.');
            }
        });
    };

    // --- Seleção: Quiz da História ---
    const abrirSelecaoQuiz = () => {
        const inventory = books || [];

        // Livros do tipo RPG são muito ramificados e não participam do Quiz
        const aplicaveis = inventory.filter(ebook => 
            ebook.tipo !== 'RPG' && 
            ebook.categoria !== 'Fabula RPG'
        );

        // Filtra livros que têm o objeto de quiz mapeado vindo do inventory.json
        const disponiveis = aplicaveis.filter(ebook =>
            ebook.quiz && Array.isArray(ebook.quiz.perguntas) && ebook.quiz.perguntas.length > 0
        );

        const bloqueados = aplicaveis.filter(ebook =>
            !ebook.quiz || !Array.isArray(ebook.quiz.perguntas) || ebook.quiz.perguntas.length === 0
        );

        _renderizarSelecaoLivro(disponiveis, bloqueados, 'Quiz da História', 'Escolha um ebook que você já leu para testar sua memória:', (ebook) => {
            if (window.QuizMiniGame) {
                window.QuizMiniGame.iniciar(ebook, ({ acertos, total, xpGanho } = {}) => {
                    // Após a janela do quiz fechar, voltamos à estante automaticamente ou deixamos o user aqui
                });
            } else {
                console.error('[GamesHub] Componente QuizMiniGame não carregado.');
            }
        });
    };

    // --- Seleção: Memória Mágica ---
    const abrirSelecaoMemoria = () => {
        if (window.MemoryGame) {
            // Agora iniciamos o jogo diretamente com o inventário completo
            // O MemoryGame irá lidar com a extração de todas as artes
            window.MemoryGame.iniciar(books, () => {
                // Ao sair do jogo, volta para o GamesHub original
                const appRoot = document.getElementById('app-root');
                appRoot.innerHTML = '';
                appRoot.appendChild(container);
            });
        } else {
            console.error('[GamesHub] Componente MemoryGame não carregado.');
        }
    };

    // --- Componente Reutilizável de Grade de Seleção de Ebooks ---
    const _renderizarSelecaoLivro = (disponiveis, bloqueados, titulo, subTitulo, onEbookSelected) => {
        const gameTheme = titulo.includes('Quiz') 
            ? { color: '#7c3aed', glow: 'rgba(124,58,237,0.4)', emoji: '🧠', tag: 'Memória & Quiz', gradient: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #0f0f1a 100%)' }
            : { color: '#059669', glow: 'rgba(5,150,105,0.4)', emoji: '📖', tag: 'Sequência & Lógica', gradient: 'linear-gradient(135deg, #012a1a 0%, #064e3b 50%, #0f0f1a 100%)' };

        container.innerHTML = `
          <div class="fz-games-selecao fade-in" style="
            min-height: 100vh;
            background: ${gameTheme.gradient};
            padding: 0 0 40px 0;
            font-family: 'Nunito', sans-serif;
          ">
            <!-- HERO BANNER -->
            <div style="
              position: relative;
              padding: 32px 24px 28px;
              text-align: center;
              border-bottom: 1px solid rgba(255,255,255,0.08);
              background: rgba(0,0,0,0.3);
              backdrop-filter: blur(10px);
            ">
              <button id="fz-selecao-voltar" aria-label="Voltar para Games" style="
                position: absolute;
                top: 24px; left: 20px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: #fff;
                width: 40px; height: 40px;
                border-radius: 50%;
                font-size: 1.2rem;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
              ">←</button>

              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 999px;
                padding: 4px 16px;
                font-size: 0.75rem;
                color: rgba(255,255,255,0.7);
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 12px;
              ">${gameTheme.emoji} ${gameTheme.tag}</div>

              <h2 style="
                font-family: 'Cinzel', serif;
                font-size: clamp(1.6rem, 5vw, 2.4rem);
                color: #fff;
                margin: 0 0 8px 0;
                text-shadow: 0 0 30px ${gameTheme.glow};
              ">${titulo}</h2>
              <p style="
                color: rgba(255,255,255,0.6);
                font-size: 0.95rem;
                margin: 0;
              ">${subTitulo}</p>

              <!-- XP Badge -->
              <div style="
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin-top: 16px;
                background: ${gameTheme.color};
                border-radius: 999px;
                padding: 6px 18px;
                font-size: 0.85rem;
                color: #fff;
                font-weight: 700;
                box-shadow: 0 4px 15px ${gameTheme.glow};
              ">⚡ Ganhe XP ao completar</div>
            </div>

            <!-- AVAILABLE BOOKS -->
            ${disponiveis.length > 0 ? `
            <div style="padding: 28px 20px 0;">
              <p style="
                color: rgba(255,255,255,0.5);
                font-size: 0.7rem;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-bottom: 16px;
              ">▼ Prontos para jogar</p>
              <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 16px;
              ">
                ${disponiveis.map(ebook => `
                  <div class="fz-games-livro-card" data-id="${ebook.id}" tabindex="0" style="
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid rgba(255,255,255,0.1);
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                    background: #000;
                  " onmouseover="this.style.transform='translateY(-6px) scale(1.03)';this.style.boxShadow='0 16px 40px ${gameTheme.glow}';this.style.borderColor='${gameTheme.color}'"
                     onmouseout="this.style.transform='';this.style.boxShadow='';this.style.borderColor='rgba(255,255,255,0.1)'">
                    <img src="${ebook.capaUrl || ebook.coverImage}" alt="${ebook.titulo}" loading="lazy" style="
                      width: 100%;
                      aspect-ratio: 3/4;
                      object-fit: cover;
                      display: block;
                      opacity: 0.9;
                    "/>
                    <!-- Play overlay on hover -->
                    <div style="
                      position: absolute; inset: 0;
                      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%);
                      display: flex; flex-direction: column;
                      justify-content: flex-end;
                      padding: 10px;
                    ">
                      <span style="
                        color: #fff;
                        font-size: 0.78rem;
                        font-weight: 700;
                        line-height: 1.3;
                        text-shadow: 0 1px 4px rgba(0,0,0,0.8);
                      ">${ebook.titulo}</span>
                      <div style="
                        margin-top: 6px;
                        background: ${gameTheme.color};
                        color: #fff;
                        font-size: 0.65rem;
                        font-weight: 800;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        padding: 3px 8px;
                        border-radius: 4px;
                        display: inline-block;
                        width: fit-content;
                      ">▶ Jogar</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}

            <!-- LOCKED BOOKS -->
            ${bloqueados.length > 0 ? `
            <div style="padding: 28px 20px 0;">
              <p style="
                color: rgba(255,255,255,0.3);
                font-size: 0.7rem;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-bottom: 16px;
              ">🔒 Indisponíveis para este jogo</p>
              <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                gap: 12px;
                opacity: 0.45;
              ">
                ${bloqueados.map(ebook => `
                  <div class="fz-games-livro-card bloqueado" title="Jogo indisponível para este livro" style="
                    position: relative;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.08);
                    filter: grayscale(60%);
                    cursor: not-allowed;
                  ">
                    <img src="${ebook.capaUrl || ebook.coverImage}" alt="${ebook.titulo}" loading="lazy" style="
                      width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block;
                    "/>
                    <div style="
                      position: absolute; inset: 0;
                      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%);
                      display: flex; flex-direction: column; justify-content: flex-end; padding: 8px;
                    ">
                      <div style="font-size: 1.2rem; text-align:center; margin-bottom: 4px;">🔒</div>
                      <span style="color: rgba(255,255,255,0.7); font-size: 0.7rem; line-height: 1.2;">${ebook.titulo}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}

          </div>`;

        // Voltar para Mundo dos Games
        container.querySelector('#fz-selecao-voltar').addEventListener('click', () => {
            renderOriginalHub();
        });

        // Clicar num livro disponível para iniciar
        container.querySelectorAll('.fz-games-livro-card:not(.bloqueado)').forEach(card => {
            const iniciarJogo = () => {
                const ebookId = card.dataset.id;
                const ebook = disponiveis.find(e => e.id === ebookId);
                if (!ebook) return;
                
                onEbookSelected(ebook);
            };

            card.addEventListener('click', iniciarJogo);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') iniciarJogo();
            });
        });
    };

    // --- Modal Explicativo/Tutorial Encontre o Objeto ---
    const _mostrarTutorialEncontreObjeto = () => {
        const overlay = document.createElement('div');
        overlay.className = 'gh-tutorial-overlay';
        overlay.innerHTML = `
            <div class="gh-tutorial-modal">
                <button class="gh-tutorial-close">&times;</button>
                <div class="gh-tutorial-icon">🔍</div>
                <h3 class="gh-tutorial-title">Onde jogar?</h3>
                <p class="gh-tutorial-text">
                    O jogo <strong>Encontre o Objeto</strong> começa de surpresa <strong>durante a leitura dos livros!</strong><br><br>
                    Enquanto estiver lendo uma história na estante, preste muita atenção nas ilustrações originais, a qualquer momento o cronômetro pode disparar pedindo para você procurar algo mágico escondido na tela.
                </p>
                <button class="gh-tutorial-btn">Entendi!</button>
            </div>
        `;
        
        container.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visivel'));

        const fechar = () => {
            overlay.classList.remove('visivel');
            setTimeout(() => overlay.remove(), 350);
        };

        overlay.querySelector('.gh-tutorial-close').addEventListener('click', fechar);
        overlay.querySelector('.gh-tutorial-btn').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) fechar();
        });
    };

    // Renderiza a parte inicial (Hub) assim que constrói
    renderOriginalHub();

    return container;
}
