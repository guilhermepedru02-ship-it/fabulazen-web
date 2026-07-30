export function FindObjectGame(book, pageData, onBack, onComplete) {
    const container = document.createElement('div');
    container.className = 'find-object-container fade-in';
    
    // Fallback if no pageData passed (e.g., from Games Hub)
    if (!pageData || !pageData.findObjects) {
        container.innerHTML = `
            <div style="text-align: center; color: white; margin-top: 100px;">
                <h2>Selecione uma imagem para jogar.</h2>
                <p>Abra um livro e clique no botão "🔍" na página.</p>
                <button class="btn-premium" style="margin-top:20px;">Voltar</button>
            </div>
        `;
        container.querySelector('.btn-premium').addEventListener('click', onBack);
        return container;
    }

    const { image, findObjects } = pageData;
    
    // Encontra o objeto correto (alvo) - assume que existe apenas um
    const targetObject = findObjects.find(obj => obj.correct) || findObjects[0];
    
    let isGameOver = false;
    
    container.innerHTML = `
        <div class="find-object-header">
            <button class="btn-back-game"><i data-lucide="arrow-left"></i></button>
            <h2 class="find-object-title">Encontre o Objeto</h2>
        </div>
        
        <div class="find-object-layout">
            <div class="find-object-image-area">
                <img src="${_getImageUrl(book, image)}" alt="Cena do Jogo" class="game-image" />
                <div class="hit-areas-container"></div>
            </div>
            <div class="find-object-sidebar">
                <h3>O que procurar:</h3>
                <div class="target-card zoom-in">
                    <span class="target-label">${targetObject ? targetObject.label : "Objeto Escondido"}</span>
                </div>
                <p class="target-hint">Clique na imagem onde você acha que está o objeto!</p>
            </div>
        </div>
    `;

    const btnBack = container.querySelector('.btn-back-game');
    btnBack.addEventListener('click', onBack);

    const imageElement = container.querySelector('.game-image');
    const hitContainer = container.querySelector('.hit-areas-container');

    imageElement.onload = () => {
        const imgWidth = imageElement.naturalWidth;
        const imgHeight = imageElement.naturalHeight;

        /* Visual debug desativado para produção. 
           Ativar apenas durante a criação de novos games para visualizar áreas mapeadas.
        findObjects.forEach((obj, index) => {
            const hitArea = document.createElement('div');
            hitArea.className = 'hit-area';
            
            const leftPerc = (obj.x / imgWidth) * 100;
            const topPerc = (obj.y / imgHeight) * 100;
            const radiusPercX = (obj.raio / imgWidth) * 100;
            const radiusPercY = (obj.raio / imgHeight) * 100;
            
            hitArea.style.left = `${leftPerc}%`;
            hitArea.style.top = `${topPerc}%`;
            hitArea.style.width = `${radiusPercX * 2}%`;
            hitArea.style.height = `${radiusPercY * 2}%`;
            hitArea.style.transform = 'translate(-50%, -50%)'; 
            
            hitArea.dataset.index = index;
            hitContainer.appendChild(hitArea);
        });
        */
    };

    // Click handler for the image
    container.querySelector('.find-object-image-area').addEventListener('click', (e) => {
        if (isGameOver) return; // Ignore clicks if already finished
        
        const rect = imageElement.getBoundingClientRect();
        
        // Ensure click is within the actual image bounds
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            return;
        }

        const scaleX = imageElement.naturalWidth / rect.width;
        const scaleY = imageElement.naturalHeight / rect.height;

        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // Log para ajudar a encontrar as coordenadas corretas!
        console.log(`🧭 [FindObject Debug] Clique em: X: ${Math.round(clickX)}, Y: ${Math.round(clickY)}`);

        let hitCorrect = false;

        // Check distance to all defined objects
        for (let i = 0; i < findObjects.length; i++) {
            const obj = findObjects[i];
            const dist = Math.sqrt(Math.pow(clickX - obj.x, 2) + Math.pow(clickY - obj.y, 2));
            
            if (dist <= obj.raio) {
                if (obj.correct) {
                    hitCorrect = true;
                }
                break; 
            }
        }

        if (hitCorrect) {
            isGameOver = true;
            showFeedback({ x: relativeX, y: relativeY }, 'success');
            setTimeout(() => handleVictory(), 1200);
        } else {
            showFeedback({ x: relativeX, y: relativeY }, 'error');
        }
    });

    function showFeedback(relativeRect, type) {
        if (type === 'error') {
            const feedback = document.createElement('div');
            feedback.className = `hit-feedback pulse-animation error`;
            
            // Posicionamento absoluto baseado no rect da imagem
            feedback.style.left = `${relativeRect.x}px`;
            feedback.style.top = `${relativeRect.y}px`;
            
            feedback.innerHTML = '<i data-lucide="x" style="color:red; width:30px; height:30px; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-shadow: 0 0 10px red;"></i>';
            setTimeout(() => feedback.remove(), 1000); 
            
            hitContainer.appendChild(feedback);
            if (window.lucide) window.lucide.createIcons({ root: feedback });
        } else {
            // Em caso de acerto, aplicamos o efeito visual sobre TODA a imagem 
            // e NÃO adicionamos o marcador no local do clique.
            _startPixiParticles();
        }
    }

    function _startPixiParticles() {
        if (typeof PIXI === 'undefined') return;

        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10'; // Garante que a explosão mágica fique por cima
        hitContainer.appendChild(canvas);

        const app = new PIXI.Application({
            view: canvas,
            backgroundAlpha: 0,
            width: hitContainer.clientWidth,
            height: hitContainer.clientHeight
        });

        const particles = [];
        // Cores zen: dourado, branco e um tom suave
        const colors = [0xFFD700, 0xFFFFFF, 0xFFE5B4]; 

        // Cria partículas espalhadas por toda a imagem
        for (let i = 0; i < 150; i++) {
            const p = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.beginFill(color);
            p.drawCircle(0, 0, Math.random() * 4 + 2);
            p.endFill();
            
            // Espalha sobre a largura e altura completa do canvas
            p.x = Math.random() * app.screen.width;
            p.y = Math.random() * app.screen.height;
            
            // Movimento: flutuação lenta e zen para cima
            p.vx = (Math.random() - 0.5) * 1.5;
            p.vy = -(Math.random() * 2 + 1);
            p.alpha = Math.random() * 0.8 + 0.2;
            p.baseAlpha = p.alpha;
            p.phase = Math.random() * Math.PI * 2; // Fase para piscar a estrela
            
            app.stage.addChild(p);
            particles.push(p);
        }

        // Camada de brilho (flash) que pega a tela toda por um instante
        const flash = new PIXI.Graphics();
        flash.beginFill(0xFFD700);
        flash.drawRect(0, 0, app.screen.width, app.screen.height);
        flash.endFill();
        flash.alpha = 0.5;
        // Blend add nativo Pixi para brilho intenso e de luz
        flash.blendMode = PIXI.BLEND_MODES.ADD;
        app.stage.addChild(flash);

        app.ticker.add((delta) => {
            // Desvanece o flash dourado cobrindo tudo
            if (flash.alpha > 0) flash.alpha -= 0.02 * delta;

            particles.forEach(p => {
                p.x += p.vx * delta;
                p.y += p.vy * delta;
                
                // Efeito twinkling ("piscar" magicamente)
                p.phase += 0.1 * delta;
                p.alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.phase));

                // Se subir além da imagem, some
                if (p.y < -20) {
                    p.alpha = 0;
                }
            });
        });

        setTimeout(() => {
            app.destroy(true, { children: true, texture: true, baseTexture: true });
            canvas.remove();
        }, 2000);
    }

    function handleVictory() {
        if (window.GamificationEngine) {
            GamificationEngine.registrarEncontreObjeto();
        }
        
        container.innerHTML = `
            <div class="victory-screen fade-in">
                <i data-lucide="award" style="width: 80px; height: 80px; color: var(--accent-gold);"></i>
                <h2>Parabéns!</h2>
                <p>Você encontrou o objeto e ganhou XP!</p>
                <div class="victory-buttons">
                    <button class="btn-premium" id="btn-victory-back">Continuando História...</button>
                </div>
            </div>
        `;
        
        if (window.lucide) window.lucide.createIcons({ root: container });
        
        const autoAdvanceTimer = setTimeout(() => {
             if (onComplete) onComplete();
             else onBack();
        }, 2500);

        container.querySelector('#btn-victory-back').addEventListener('click', () => {
             clearTimeout(autoAdvanceTimer);
             if (onComplete) onComplete();
             else onBack();
        });
    }


    function _getImageUrl(book, url) {
        if (!url) return '';
        // Se já for local ou assets, retornar direto
        if (url.startsWith('assets/') || url.startsWith('http')) {
            return url;
        }

        // Se for apenas o nome do arquivo, descobre o diretório do livro
        if (book?.arquivoUrl) {
           const baseUrl = book.arquivoUrl.substring(0, book.arquivoUrl.lastIndexOf('/') + 1);
           return baseUrl + url;
        }
        return url;
    }

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons({ root: container });
    }, 0);

    return container;
}
