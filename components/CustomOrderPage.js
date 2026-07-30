import { supabase } from '../scripts/supabase.js';

export const CustomOrderPage = (onComplete) => {
    const mainContainer = document.createElement('div');
    mainContainer.className = 'custom-order-container';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'w-full max-w-3xl';
    
    // 'book-page' aplica o gradiente de pergaminho definido no CSS
    const innerContainer = document.createElement('div');
    innerContainer.className = 'book-page fade-in rounded-3xl p-8 sm:p-12 text-[#2d261b] relative overflow-hidden border border-[#d4af37]/30';

    innerContainer.innerHTML = `
        <!-- Elemento decorativo: Cantoneiras mágicas -->
        <div class="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#d4af37]/40 rounded-tl-3xl opacity-50 m-2"></div>
        <div class="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#d4af37]/40 rounded-tr-3xl opacity-50 m-2"></div>

        <header class="text-center mb-8 relative z-10">
            <span class="inline-block bg-gradient-to-r from-[#d4af37] to-[#eebb4d] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm mb-3">
                ✦ Serviço Premium ✦
            </span>
            <h1 class="font-serif text-3xl sm:text-4xl text-[#1a140b] mb-2" style="font-family: 'Cinzel', serif;">Crie a sua própria Fábula</h1>
            <p class="text-[#5c5039] text-sm sm:text-base max-w-lg mx-auto">
                Transforme seu pequeno aventureiro no protagonista de uma jornada inesquecível, ilustrada com magia.
            </p>
        </header>

        <form id="custom-story-form" class="space-y-6 relative z-10">
            
            <!-- Nome do Herói -->
            <div class="flex flex-col gap-2">
                <label for="hero-name" class="font-bold text-[#4a3f2d] flex items-center gap-2">
                    <span class="text-[#d4af37] text-lg">✎</span> Nome do Pequeno Herói(ína)
                </label>
                <input type="text" id="hero-name" name="hero-name" placeholder="Ex: Arthur, O Valente" required
                    class="magic-input w-full px-4 py-3 rounded-xl text-[#2d261b] placeholder-[#a39882]">
            </div>

            <!-- Seletor de Temas (Gamificado) -->
            <div class="flex flex-col gap-2">
                <label class="font-bold text-[#4a3f2d] flex items-center gap-2">
                    <span class="text-[#d4af37] text-lg">🗺️</span> Escolha o Formato da Jornada
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                    
                    <!-- Card: Aventura / Hora de Dormir -->
                    <label class="cursor-pointer relative">
                        <input type="radio" name="theme" value="hora-de-dormir-aventura" checked class="theme-card-input peer sr-only">
                        <div class="theme-card-content h-full bg-white/60 border-2 border-transparent rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/90">
                            <span class="text-3xl mb-2 filter drop-shadow-sm">🧸</span>
                            <span class="font-bold text-[#2d261b] text-sm">Hora de dormir / Aventura</span>
                            <span class="text-xs text-[#7a6b52] mt-1">Ebooks com imagens mágicas</span>
                            <span class="text-xs font-bold text-[#d4af37] mt-2 bg-[#d4af37]/10 px-3 py-1 rounded-full">R$ 10,99</span>
                        </div>
                        <div class="absolute top-2 right-2 w-5 h-5 bg-[#d4af37] rounded-full text-white flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity shadow-md">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </label>

                    <!-- Card: Livros Animados -->
                    <label class="cursor-pointer relative">
                        <input type="radio" name="theme" value="livros-animados" class="theme-card-input peer sr-only">
                        <div class="theme-card-content h-full bg-white/60 border-2 border-transparent rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/90">
                            <span class="text-3xl mb-2 filter drop-shadow-sm">🎬</span>
                            <span class="font-bold text-[#2d261b] text-sm">Livros Animados</span>
                            <span class="text-xs text-[#7a6b52] mt-1">Ebook com Vídeos</span>
                            <span class="text-xs font-bold text-[#d4af37] mt-2 bg-[#d4af37]/10 px-3 py-1 rounded-full">R$ 15,99</span>
                        </div>
                        <div class="absolute top-2 right-2 w-5 h-5 bg-[#d4af37] rounded-full text-white flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity shadow-md">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </label>

                    <!-- Card: Fabula RPG -->
                    <label class="cursor-pointer relative">
                        <input type="radio" name="theme" value="fabula-rpg" class="theme-card-input peer sr-only">
                        <div class="theme-card-content h-full bg-white/60 border-2 border-transparent rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/90">
                            <span class="text-3xl mb-2 filter drop-shadow-sm">🎮</span>
                            <span class="font-bold text-[#2d261b] text-sm">Fabula RPG</span>
                            <span class="text-xs text-[#7a6b52] mt-1">Aventura Imersiva</span>
                            <span class="text-xs font-bold text-[#d4af37] mt-2 bg-[#d4af37]/10 px-3 py-1 rounded-full">R$ 20,00</span>
                        </div>
                        <div class="absolute top-2 right-2 w-5 h-5 bg-[#d4af37] rounded-full text-white flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity shadow-md">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </label>

                </div>
            </div>

            <!-- Upload de Foto -->
            <div class="flex flex-col gap-2">
                <label class="font-bold text-[#4a3f2d] flex items-center gap-2">
                    <span class="text-[#d4af37] text-lg">📸</span> Retrato Mágico (Upload)
                </label>
                <div id="drop-zone" class="drop-zone relative cursor-pointer bg-white/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[120px] overflow-hidden group">
                    
                    <!-- Estado Vazio -->
                    <div id="drop-content" class="text-center flex flex-col items-center transition-opacity duration-300">
                        <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-2xl group-hover:scale-110 transition-transform">🖼️</div>
                        <span class="font-bold text-[#4a3f2d]">Clique ou arraste a foto aqui</span>
                        <span class="text-xs text-[#7a6b52] mt-1 max-w-[200px]">Formatos aceitos: JPG, PNG.</span>
                    </div>

                    <!-- Preview da Imagem -->
                    <div id="file-preview" class="absolute inset-0 bg-[#fbf8f1] flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
                    </div>

                    <input type="file" id="hero-photo" name="hero-photo" accept="image/*" class="hidden">
                </div>
                <p class="text-[11px] text-[#8a7f6a] flex items-center gap-1 mt-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    A foto será apagada em 72h conforme Política de Privacidade.
                </p>
            </div>

            <!-- Detalhes Extras -->
            <div class="flex flex-col gap-2">
                <label for="extra-details" class="font-bold text-[#4a3f2d] flex items-center gap-2">
                    <span class="text-[#d4af37] text-lg">✨</span> Detalhes Mágicos (conte-nos mais)
                </label>
                <textarea id="extra-details" name="extra-details" rows="3" placeholder="Ex: Ama dinossauros, tem um gatinho..."
                    class="magic-input w-full px-4 py-3 rounded-xl text-[#2d261b] placeholder-[#a39882] resize-none"></textarea>
            </div>

            <!-- Consentimento e Botão -->
            <div class="pt-4 border-t border-[#d4af37]/20 flex flex-col gap-6">
                
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" name="consent" required class="magic-checkbox mt-0.5 shrink-0">
                    <span class="text-sm text-[#5c5039] leading-tight">
                        Eu autorizo o uso da imagem e concordo com a 
                        <a href="politica-ebook-magico.html" target="_blank" class="text-[#d4af37] font-bold hover:underline">Política de Consentimento Parental</a>.
                    </span>
                </label>

                <button type="submit" class="relative overflow-hidden bg-[#111] text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-[#222] transform hover:-translate-y-1 transition-all w-full sm:w-auto self-end flex items-center justify-center gap-2">
                    <span class="btn-text">Continuar para o Pagamento</span>
                    <span class="btn-icon">→</span>
                    <div class="btn-shine"></div>
                </button>
            </div>
        </form>
    `;

    // ---- LÓGICA DE INTERAÇÃO ----
    
    const fileInput = innerContainer.querySelector('#hero-photo');
    const dropZone = innerContainer.querySelector('#drop-zone');
    const dropContent = innerContainer.querySelector('#drop-content');
    const preview = innerContainer.querySelector('#file-preview');

    dropZone.addEventListener('click', () => fileInput.click());

    ['dragover', 'dragenter'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover', 'scale-[1.02]');
        });
    });

    ['dragleave', 'dragend', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover', 'scale-[1.02]');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFilePreview(fileInput.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFilePreview(e.target.files[0]);
        }
    });

    function handleFilePreview(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dropContent.style.opacity = '0';
                preview.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover opacity-90 rounded-xl" alt="Preview">
                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                        <span class="bg-white text-[#2d261b] px-4 py-2 rounded-full font-bold text-sm shadow-md">Trocar Foto</span>
                    </div>
                `;
                preview.style.opacity = '1';
                preview.style.pointerEvents = 'auto';
            };
            reader.readAsDataURL(file);
        }
    }

    const form = innerContainer.querySelector('#custom-story-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.querySelector('.btn-text');
        const btnIcon = btn.querySelector('.btn-icon');
        
        const originalText = btnText.innerText;
        btnText.innerText = 'Enviando Magia...';
        btnIcon.innerHTML = '🪄';
        btn.classList.add('pointer-events-none', 'opacity-90');

        try {
            // 1. Verificar Autenticação
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert('Por favor, faça login para encomendar sua fábula personalizada.');
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'LOGIN' }));
                return;
            }

            // 2. Preparar dados do formulário
            const formData = new FormData(form);
            const file = fileInput.files[0];
            let photoUrl = null;

            // 3. Upload da Foto para o Storage (se houver)
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('custom-orders')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;
                photoUrl = fileName;
            }

            // 4. Salvar Pedido na Tabela 'custom_story_orders'
            const { data: orderData, error: orderError } = await supabase
                .from('custom_story_orders')
                .insert([{
                    profile_id: user.id,
                    child_name: formData.get('hero-name'),
                    theme: formData.get('theme'),
                    child_photo_url: photoUrl || 'pending_upload',
                    extra_details: formData.get('extra-details'),
                    parental_consent_given: formData.get('consent') === 'on',
                    status: 'pending'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Sucesso! Prosseguir para o Pagamento
            onComplete(orderData);

        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            alert('Ops! Houve um problema ao enviar seu pedido. Tente novamente em instantes.');
            btnText.innerText = originalText;
            btnIcon.innerHTML = '→';
            btn.classList.remove('pointer-events-none', 'opacity-90');
        }
    });

    contentWrapper.appendChild(innerContainer);
    mainContainer.appendChild(contentWrapper);

    return mainContainer;
};
