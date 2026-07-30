/**
 * LayoutEngine.js — "Zen Typographer" (V2)
 * Motor de tipografia determinístico baseado no Pretext.
 * Elimina Layout Shifts através de medição antecipada via Canvas.
 */

const LayoutEngine = (() => {
    const _canvas = document.createElement('canvas');
    const _ctx = _canvas.getContext('2d');
    const _cache = new Map();

    /**
     * Prepara o contexto de medição.
     */
    function _setFont(fontConfig) {
        // Ex: "bold 16px Inter"
        if (_ctx.font !== fontConfig) {
            _ctx.font = fontConfig;
        }
    }

    /**
     * Mede a largura de uma string.
     */
    function _measureText(text, font) {
        const key = `${text}:${font}`;
        if (_cache.has(key)) return _cache.get(key);
        
        _setFont(font);
        const width = _ctx.measureText(text).width;
        _cache.set(key, width);
        return width;
    }

    /**
     * Algoritmo de Quebra de Linha (Greedy).
     * Retorna um array de strings (linhas).
     */
    function calculateLines(text, maxWidth, font) {
        if (!text) return [];
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + " " + word;
            const width = _measureText(testLine, font);

            if (width < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    /**
     * Previsão de Altura.
     * Útil para "travar" containers e evitar saltos.
     */
    function predictHeight(text, maxWidth, font, lineHeightRem = 1.6) {
        const lines = calculateLines(text, maxWidth, font);
        const fontSize = parseInt(font.match(/\d+/)[0]);
        const lineHeightPx = fontSize * lineHeightRem;
        return lines.length * lineHeightPx;
    }

    /**
     * Balanced Layout.
     * Tenta encontrar a largura ideal para que as linhas tenham comprimentos parecidos.
     */
    function balance(text, maxWidth, font) {
        const originalLines = calculateLines(text, maxWidth, font);
        if (originalLines.length <= 1) return originalLines;

        // Busca o equilíbrio diminuindo levemente a largura até que o número de linhas mude
        let bestLines = originalLines;
        let currentWidth = maxWidth;
        const step = 5;

        for (let w = maxWidth - step; w > maxWidth * 0.7; w -= step) {
            const lines = calculateLines(text, w, font);
            if (lines.length > originalLines.length) break;
            bestLines = lines;
        }

        return bestLines;
    }

    /**
     * Aplica o Zen Wrapping ao redor de um elemento.
     */
    function applyZenWrap(container, shapeElement, text, font = "18px 'Outfit'") {
        shapeElement.style.float = 'left';
        shapeElement.style.shapeMargin = '20px';
        
        const lines = calculateLines(text, container.clientWidth - 50, font);
        
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'zen-typographer-content';
        
        lines.forEach(line => {
            const div = document.createElement('div');
            div.style.whiteSpace = 'nowrap';
            div.innerText = line;
            wrapper.appendChild(div);
        });

        container.appendChild(wrapper);
    }

    /**
     * Renderiza um título balanceado.
     */
    function renderBalancedTitle(text, targetElement, font = "bold 24px 'Cinzel'") {
        const balancedLines = balance(text, targetElement.clientWidth || 300, font);
        targetElement.innerHTML = balancedLines.map(line => `<span style="display:block">${line}</span>`).join('');
    }

    /**
     * Truncação Inteligente.
     * Calcula quantas linhas o texto ocupará e corta no caractere perfeito,
     * adicionando "..." sem estourar o container.
     * Inspirado na técnica de shrink-wrap do Pretext.
     */
    function truncateToFit(text, maxWidth, maxLines, font) {
        if (!text) return '';
        const lines = calculateLines(text, maxWidth, font);
        
        // Se cabe, retorna intacto
        if (lines.length <= maxLines) return text;

        // Pega as linhas que cabem e corta a última com "..."
        const visibleLines = lines.slice(0, maxLines);
        let lastLine = visibleLines[maxLines - 1];

        // Reduz a última linha até caber com o sufixo "..."
        const ellipsis = '…';
        const words = lastLine.split(' ');
        while (words.length > 0) {
            const candidate = words.join(' ') + ellipsis;
            const width = _measureText(candidate, font);
            if (width <= maxWidth) {
                visibleLines[maxLines - 1] = candidate;
                break;
            }
            words.pop();
        }

        return visibleLines.join(' ');
    }

    /**
     * Shrink Wrap.
     * Calcula a largura mínima necessária para conter o texto em N linhas.
     * Usa busca binária para encontrar o "melhor fit" — técnica extraída do Pretext.
     */
    function shrinkWrap(text, font, targetLineCount) {
        if (!text) return 0;
        const words = text.split(' ');
        
        // Largura máxima = tudo em uma linha
        _setFont(font);
        const fullWidth = _ctx.measureText(text).width;
        
        if (!targetLineCount || targetLineCount <= 1) return fullWidth;

        // Busca binária: encontra a menor largura que mantém o targetLineCount
        let lo = _ctx.measureText(words.reduce((a, b) => a.length > b.length ? a : b, '')).width;
        let hi = fullWidth;
        let best = fullWidth;

        for (let i = 0; i < 20; i++) { // 20 iterações = precisão < 1px
            const mid = (lo + hi) / 2;
            const lines = calculateLines(text, mid, font);
            if (lines.length <= targetLineCount) {
                best = mid;
                hi = mid;
            } else {
                lo = mid;
            }
        }

        return Math.ceil(best);
    }

    return {
        calculateLines,
        predictHeight,
        balance,
        applyZenWrap,
        renderBalancedTitle,
        truncateToFit,
        shrinkWrap
    };
})();

window.LayoutEngine = LayoutEngine;

