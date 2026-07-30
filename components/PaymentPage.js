/**
 * PaymentPage.js — Fabula-Zen (VERSÃO ARTE & PERGAMINHO)
 * Central de Assinaturas e Pagamentos com design mágico.
 */

export const PaymentPage = (orderData = null, onComplete) => {
    const container = document.createElement('div');
    // Container principal com a textura de livro/pergaminho
    container.className = 'book-page fade-in rounded-3xl p-6 sm:p-10 text-[#2d261b] relative overflow-hidden border border-[#d4af37]/30';

    const isCustomOrder = !!orderData && !orderData.trialExpired && !orderData.isSubscription;
    const isTrialExpired = !!(orderData && orderData.trialExpired);

    // Mapa de preços e nomes por categoria de ebook personalizado
    const THEME_CONFIG = {
        'hora-de-dormir-aventura': { name: 'Fábula Personalizada — Hora de Dormir / Aventura', price: '10,99' },
        'livros-animados':        { name: 'Fábula Personalizada — Livro Animado (MP4)',       price: '15,99' },
        'fabula-rpg':             { name: 'Fábula Personalizada — Fabula RPG',                price: '20,00' },
    };

    const selectedTheme = (orderData && orderData.theme) ? orderData.theme : null;
    const themeConfig = selectedTheme && THEME_CONFIG[selectedTheme] 
        ? THEME_CONFIG[selectedTheme] 
        : { name: 'Fábula Personalizada', price: '10,99' };

    // Dados dinâmicos baseados no tipo de compra
    const title = isCustomOrder ? 'Finalizar Pedido Mágico' : 'Portal de Assinatura';
    const subtitle = isCustomOrder ? 'Sua jornada personalizada está pronta para ganhar vida.' : 'Liberte o poder da biblioteca Fabula-Zen para seu pequeno herói.';
    const productName = isCustomOrder ? themeConfig.name : 'Passe Mágico Premium (Mensal)';
    const productPrice = isCustomOrder ? themeConfig.price : '14,99';

    container.innerHTML = `
        <!-- Elementos decorativos de cantoneira -->
        <div class="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#d4af37]/30 rounded-tl-3xl opacity-60 m-3 pointer-events-none"></div>
        <div class="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#d4af37]/30 rounded-tr-3xl opacity-60 m-3 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#d4af37]/30 rounded-bl-3xl opacity-60 m-3 pointer-events-none"></div>
        <div class="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#d4af37]/30 rounded-br-3xl opacity-60 m-3 pointer-events-none"></div>

        ${isTrialExpired ? `
        <div class="bg-red-500/10 border border-red-500/30 text-red-700 rounded-xl p-4 mb-6 relative z-10 text-center animate-pulse">
            <span class="text-xl block mb-1">⚠️</span>
            <strong class="font-bold">Atenção, Herói!</strong> Seu período de teste de 7 dias chegou ao fim.<br>
            Adquira o Passe Mágico Premium para continuar a ler e jogar.
        </div>
        ` : ''}

        <header class="text-center mb-8 relative z-10 pt-4">
            <span class="inline-block bg-[#1a140b] text-[#d4af37] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md mb-4 border border-[#d4af37]/30">
                ✦ Tesouraria Zen ✦
            </span>
            <h1 class="font-serif text-3xl sm:text-4xl text-[#1a140b] mb-2" style="font-family: 'Cinzel', serif;">${title}</h1>
            <p class="text-[#5c5039] text-sm sm:text-base max-w-md mx-auto">
                ${subtitle}
            </p>
        </header>

        <!-- Área do Resumo / "Recibo" -->
        <div class="magic-receipt rounded-2xl p-6 mb-8 relative z-10 border-x border-y-2 border-[#d4af37]/40 shadow-inner flex flex-col gap-4">
            <div class="flex justify-between items-center text-[#4a3f2d] border-b border-[#c8b99c]/50 pb-3">
                <span class="font-bold flex items-center gap-2 text-sm sm:text-base">
                    <span class="text-lg">📜</span> O Tesouro Escolhido:
                </span>
                <span class="font-serif text-right text-[#1a140b] font-bold text-sm sm:text-base">${productName}</span>
            </div>
            <div class="flex justify-between items-end pt-2">
                <span class="font-serif text-lg sm:text-xl text-[#2d261b]">Tributo de Ouro:</span>
                <div class="text-right">
                    <span class="block text-xs text-[#7a6b52] mb-1">Total a pagar</span>
                    <span class="font-serif text-3xl sm:text-4xl text-[#1a140b] font-bold drop-shadow-[0_2px_2px_rgba(212,175,55,0.3)]">
                        R$ <span class="text-[#d4af37]">${productPrice}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Botões de Checkout Dinâmico -->
        ${isCustomOrder ? `
        <div class="space-y-4 relative z-10">
            <h3 class="font-bold text-[#4a3f2d] flex items-center gap-2 mb-3 px-2 text-sm sm:text-base">
                <span class="text-[#d4af37] text-xl">🗝️</span> Finalizar Pedido
            </h3>
            <button class="payment-card-btn payment-action w-full flex items-center p-4 sm:p-5 rounded-2xl relative overflow-hidden group text-left" data-type="custom_order">
                <div class="btn-shine-effect"></div>
                <div class="w-12 h-12 sm:w-14 sm:h-14 bg-[#f4f0fa] rounded-full flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform shadow-sm border border-[#8a56ac]/20">
                    🪄
                </div>
                <div class="flex-1">
                    <div class="font-bold text-[#1a140b] text-base sm:text-lg mb-0.5 group-hover:text-[#8a56ac] transition-colors">Ir para Pagamento Seguro</div>
                    <div class="text-xs sm:text-sm text-[#7a6b52]">PIX, Cartão e Carteiras Digitais via Stripe</div>
                </div>
                <div class="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </button>
        </div>
        ` : `
        <div class="space-y-4 relative z-10">
            <h3 class="font-bold text-[#4a3f2d] flex items-center gap-2 mb-3 px-2 text-sm sm:text-base">
                <span class="text-[#d4af37] text-xl">🗝️</span> Escolha o seu Plano
            </h3>
            
            <!-- Plano Anual -->
            <button class="payment-card-btn payment-action w-full flex items-center p-4 sm:p-5 rounded-2xl relative overflow-hidden group text-left border-2 border-[#d4af37]" data-type="subscription" data-plan="anual">
                <div class="btn-shine-effect"></div>
                <div class="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full transform rotate-12 shadow-md">
                    2 MESES GRÁTIS!
                </div>
                <div class="w-12 h-12 sm:w-14 sm:h-14 bg-[#fff9e6] rounded-full flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform shadow-sm border border-[#d4af37]/30">
                    👑
                </div>
                <div class="flex-1">
                    <div class="font-bold text-[#1a140b] text-base sm:text-lg mb-0.5 group-hover:text-[#d4af37] transition-colors">Plano Anual</div>
                    <div class="text-xs sm:text-sm text-[#7a6b52]">R$ 149,90 / ano — O melhor valor</div>
                </div>
                <div class="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </button>

            <!-- Plano Mensal -->
            <button class="payment-card-btn payment-action w-full flex items-center p-4 sm:p-5 rounded-2xl relative overflow-hidden group text-left" data-type="subscription" data-plan="mensal">
                <div class="btn-shine-effect"></div>
                <div class="w-12 h-12 sm:w-14 sm:h-14 bg-[#f4f0fa] rounded-full flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform shadow-sm border border-[#8a56ac]/20">
                    ✨
                </div>
                <div class="flex-1">
                    <div class="font-bold text-[#1a140b] text-base sm:text-lg mb-0.5 group-hover:text-[#8a56ac] transition-colors">Plano Mensal</div>
                    <div class="text-xs sm:text-sm text-[#7a6b52]">R$ 14,99 / mês — Flexibilidade total</div>
                </div>
                <div class="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </button>
        </div>
        `}

        <!-- Rodapé de Segurança e Cancelamento -->
        <div class="mt-8 pt-6 border-t border-[#d4af37]/20 flex flex-col items-center gap-4 relative z-10">
            <div class="flex items-center gap-2 text-[10px] sm:text-xs text-[#5c5039] bg-[#e8dcb8]/40 px-4 py-2 rounded-full border border-[#c8b99c]/50">
                <span>🛡️</span>
                <span>Selo Zen: Ambiente Seguro e Criptografado</span>
                <span>🔒</span>
            </div>

            <button id="btn-cancel-payment" class="text-[#8a7f6a] font-bold text-sm hover:text-[#d4af37] transition-colors py-2 px-4 rounded-full hover:bg-[#d4af37]/10 mt-2">
                ← Voltar para a Biblioteca
            </button>
        </div>
    `;

    // ---- Lógica de Interação ----
    
    // Lidar com o clique em cada opção
    container.querySelectorAll('.payment-action').forEach(btn => {
        btn.addEventListener('click', async () => {
            // Efeito visual de clique
            btn.style.transform = 'scale(0.98)';
            setTimeout(() => btn.style.transform = '', 150);
            
            // Estado visual de "Carregando"
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<div class="flex items-center justify-center w-full py-2"><div class="w-6 h-6 border-2 border-t-[#d4af37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div><span class="ml-3 font-bold text-[#4a3f2d]">Preparando portal mágico...</span></div>`;
            btn.disabled = true;

            try {
                let payload = {};
                
                if (isCustomOrder) {
                    payload = {
                        type: 'custom_order',
                        theme: selectedTheme,
                        orderId: orderData.id
                    };
                } else {
                    const plan = btn.getAttribute('data-plan') || 'mensal';
                    const profileId = (orderData && orderData.profileId) || "";
                    
                    payload = {
                        type: 'subscription',
                        plan: plan,
                        profileId: profileId
                    };
                }

                // Faz a chamada para o webhook do n8n que cria a Checkout Session dinamicamente
                const currentHost = window.location.hostname || 'localhost';
                const response = await fetch(`http://${currentHost}:5678/webhook/create-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (data.url) {
                    // Redireciona para a Checkout Session gerada
                    window.location.href = data.url;
                } else {
                    throw new Error('URL de pagamento não retornada pelo servidor mágico.');
                }
            } catch (err) {
                console.error('Erro ao gerar link de pagamento:', err);
                
                // Mensagem de erro estilo Fabula Zen
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mt-3 bg-[#fff0f0] border border-[#ffb3b3] text-[#d32f2f] text-sm p-3 rounded-xl flex items-center gap-2 fade-in';
                errorDiv.innerHTML = `<span>🛑</span> <strong>Ops!</strong> Os goblins bloquearam nosso sinal mágico! Tente novamente em instantes.`;
                
                // Remove existing error se houver
                const existingError = btn.parentElement.querySelector('.magic-error');
                if (existingError) existingError.remove();
                
                errorDiv.classList.add('magic-error');
                btn.parentElement.appendChild(errorDiv);

                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });
    });

    // Lidar com o cancelamento
    container.querySelector('#btn-cancel-payment').addEventListener('click', () => {
        if(onComplete) onComplete('CANCEL');
    });

    return container;
};
