// SEU URL da API já está configurado.
const apiUrl = 'https://script.google.com/macros/s/AKfycbzWoD0BMg83Egcd4OZ-SLpSaa7TO0uo8U5TYVKjtYLiZHYu3KVO6YoZvuGAm-XhX7Q/exec';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayCategories(categories) {
    const container = document.getElementById('container');
    container.innerHTML = '';
    if (categories.error) { showError({ message: categories.error }); return; }
    const sortedKeys = Object.keys(categories).sort();
    if (sortedKeys.length === 0) { container.innerHTML = '<h2>Nenhum atleta encontrado para as categorias definidas.</h2>'; return; }
    
    sortedKeys.forEach(key => {
        const athletes = categories[key];
        const numAthletes = athletes.length;

        // --- MUDANÇA IMPORTANTE AQUI ---
        // Se tiver apenas 1 atleta, mostra um card especial.
        if (numAthletes === 1) {
            const athlete = athletes[0];
            const singleAthleteHTML = `
                <div class="single-athlete-container">
                    <h2>${key} (${numAthletes} atleta)</h2>
                    <div class="single-athlete-card">
                        <div class="name">${athlete.nome}</div>
                        <div class="team">${athlete.equipe}</div>
                        <div class="status">Único atleta na categoria.</div>
                    </div>
                </div>`;
            container.innerHTML += singleAthleteHTML;
            return; // Pula para a próxima categoria
        }

        // Se tiver 2 ou mais atletas, continua com a lógica normal do chaveamento.
        shuffleArray(athletes);
        
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(numAthletes)));
        const numRounds = Math.log2(bracketSize);
        
        let matches = [];
        let byes = bracketSize - numAthletes;
        let currentAthletes = [...athletes];

        for (let i = 0; i < bracketSize / 2; i++) {
            let player1 = null, player2 = null;
            if (byes > 0 && (i % 2 !== 0 || currentAthletes.length < 2)) {
                player1 = currentAthletes.shift();
                player2 = null;
                byes--;
            } else {
                player1 = currentAthletes.shift();
                player2 = currentAthletes.shift();
            }
            matches.push({ p1: player1, p2: player2 });
        }

        let bracketHTML = `<div class="bracket-container"><h2>${key} (${numAthletes} atletas)</h2><div class="bracket">`;
        let lastRoundMatches = matches;

        for (let i = 0; i < numRounds; i++) {
            bracketHTML += `<div class="round">`;
            
            let currentRoundMatches = [];
            if (i === 0) {
                currentRoundMatches = lastRoundMatches;
            } else {
                for (let j = 0; j < lastRoundMatches.length / 2; j++) {
                   currentRoundMatches.push({p1: null, p2: null});
                }
            }

            currentRoundMatches.forEach(match => {
                 const p1_name = match.p1 ? match.p1.nome : 'Aguardando...';
                 const p1_team = match.p1 ? match.p1.equipe : '';
                 const p2_name = match.p2 ? match.p2.nome : 'Aguardando...';
                 const p2_team = match.p2 ? match.p2.equipe : '';
                 const p2_class = match.p2 ? '' : 'bye';

                 bracketHTML += `
                     <div class="match ${i === 0 ? 'is-first-round' : ''}">
                         <div class="player">
                             <div class="details"><span class="name">${p1_name}</span><br><span class="team">${p1_team}</span></div>
                         </div>
                         <div class="player ${p2_class}">
                              <div class="details"><span class="name">${p2_name}</span><br><span class="team">${p2_team}</span></div>
                         </div>
                     </div>
                  `;
            });
            
            if (i < numRounds - 1) {
                bracketHTML += '</div><div class="match-connector">'.repeat(currentRoundMatches.length / 2);
            } else {
                 bracketHTML += '</div>';
            }
             
            lastRoundMatches = currentRoundMatches;
        }
        bracketHTML += '</div></div>';
        container.innerHTML += bracketHTML;
    });
}

function showError(error) {
    const container = document.getElementById('container');
    container.innerHTML = '';
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = 'Ocorreu um erro ao carregar os dados: ' + error.message;
}

document.addEventListener("DOMContentLoaded", function() {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) { throw new Error('Erro na rede ou na API: ' + response.statusText); }
            return response.json();
        })
        .then(data => { displayCategories(data); })
        .catch(error => { showError(error); });
});