let gameState = null;

async function loadGame() {
    try {
        const response = await fetch('data.json');
        gameState = await response.json();
        
        // Načtení z localStorage pokud existuje
        const saved = localStorage.getItem('stellar_save_v17');
        if (saved) {
            const parsed = JSON.parse(saved);
            gameState = { ...gameState, ...parsed };
        }
        
        initGame();
    } catch (e) {
        console.error("Chyba při načítání dat:", e);
    }
}

function saveGame() {
    localStorage.setItem('stellar_save_v17', JSON.stringify(gameState));
}

function initGame() {
    setInterval(gameLoop, 1000);
    renderAll();
}

function gameLoop() {
    // Základní produkce
    gameState.resources.naquadah += (gameState.buildings.mineNaquadah.level * 2);
    gameState.resources.trinium += (gameState.buildings.mineTrinium.level * 1);
    
    saveGame();
    renderResources();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById('tab-' + tabId).style.display = 'block';
    renderAll();
}

function renderAll() {
    renderResources();
    renderOverview();
    renderBase();
    renderGalaxy();
    renderFleet();
    renderAnomalies();
    renderLogs();
}

function renderResources() {
    document.getElementById('res-naquadah').innerText = Math.floor(gameState.resources.naquadah);
    document.getElementById('res-trinium').innerText = Math.floor(gameState.resources.trinium);
    document.getElementById('res-energy').innerText = gameState.resources.energy;
    document.getElementById('res-max-energy').innerText = gameState.resources.maxEnergy;
    document.getElementById('res-fragments').innerText = gameState.techFragments || 0;
}

function renderOverview() {
    const container = document.getElementById('overview-content');
    container.innerHTML = `
        <div class="card">
            <h3>Stav Impéria</h3>
            <p>Aktivní verze: <strong>${gameState.version}</strong></p>
            <p>Získané technologické fragmenty: <strong>${gameState.techFragments || 0}</strong></p>
            <p>Uložená bojová hlášení: <strong>${gameState.battleLogs.length}</strong></p>
        </div>
    `;
}

function renderBase() {
    const container = document.getElementById('base-content');
    container.innerHTML = `
        <div class="card">
            <h3>Budovy</h3>
            <p>Těžba Naquadahu (Úroveň ${gameState.buildings.mineNaquadah.level}): <button onclick="upgradeBuilding('mineNaquadah')">Vylepšit (60N/20T)</button></p>
            <p>Těžba Trinia (Úroveň ${gameState.buildings.mineTrinium.level}): <button onclick="upgradeBuilding('mineTrinium')">Vylepšit (80N/40T)</button></p>
        </div>
    `;
}

function upgradeBuilding(buildingKey) {
    const b = gameState.buildings[buildingKey];
    if (gameState.resources.naquadah >= b.costNaquadah && gameState.resources.trinium >= b.costTrinium) {
        gameState.resources.naquadah -= b.costNaquadah;
        gameState.resources.trinium -= b.costTrinium;
        b.level++;
        b.costNaquadah = Math.floor(b.costNaquadah * 1.5);
        b.costTrinium = Math.floor(b.costTrinium * 1.5);
        renderAll();
    } else {
        alert("Nedostatek surovin!");
    }
}

function renderGalaxy() {
    const container = document.getElementById('galaxy-content');
    container.innerHTML = `
        <div class="card">
            <h3>Sektory Galaxie</h3>
            <p>Země (Domovský svět) - <button onclick="simulateBattle('Země', 120)">Zaútočit vybranou flotilou</button></p>
            <p>Mars (Bohatý na naquadah) - <button onclick="simulateBattle('Mars', 180)">Zaútočit vybranou flotilou</button></p>
        </div>
    `;
}

// Simulace bitvy s podporou taktik, válečných kořistí a battle logu
function simulateBattle(targetName, enemyPower) {
    // Vybereme první flotilu jako útočící (nebo výchozí)
    const fleet = gameState.fleets[0];
    let fleetPower = (fleet.units.drone * 10) + (fleet.units.cruiser * 35) + (fleet.units.battleship * 100);
    
    if (fleetPower <= 0) {
        alert("Flotila nemá žádné jednotky k útoku!");
        return;
    }

    // Aplikace taktiky
    if (fleet.tactic === 'aggressive') {
        fleetPower *= 1.25; // Vyšší útok
    } else if (fleet.tactic === 'retreat' && fleetPower < enemyPower) {
        alert("Taktika ústupu zachránila flotilu před porážkou!");
        return;
    }

    let resultText = "";
    let won = fleetPower >= enemyPower;

    if (won) {
        const rewardN = 200;
        const rewardT = 100;
        const rewardFrag = 2; // Válečná kořist
        gameState.resources.naquadah += rewardN;
        gameState.resources.trinium += rewardT;
        gameState.techFragments = (gameState.techFragments || 0) + rewardFrag;
        
        resultText = `Vítězství nad ${targetName}! Získáno ${rewardN} Naquadahu, ${rewardT} Trinia a ${rewardFrag} technologické fragmenty.`;
    } else {
        resultText = `Porážka v sektoru ${targetName}. Síla nepřítele (${enemyPower}) převýšila vaši flotilu (${Math.floor(fleetPower)}).`;
    }

    // Zápis do bojového hlášení
    gameState.battleLogs.unshift({
        time: new Date().toLocaleTimeString(),
        target: targetName,
        result: resultText,
        fleetPower: Math.floor(fleetPower),
        enemyPower: enemyPower
    });

    // Omezení logu na posledních 10 záznamů
    if (gameState.battleLogs.length > 10) gameState.battleLogs.pop();

    saveGame();
    renderAll();
    alert(resultText);
}

function renderFleet() {
    const container = document.getElementById('fleet-content');
    container.innerHTML = `
        <div class="card">
            <h3>Správa flotil & Taktika</h3>
            <p>Aktivní flotila: <strong>${gameState.fleets[0].name}</strong></p>
            <p>Taktika chování: 
                <select id="fleet-tactic" onchange="changeTactic(this.value)">
                    <option value="standard" ${gameState.fleets[0].tactic === 'standard' ? 'selected' : ''}>Standardní</option>
                    <option value="aggressive" ${gameState.fleets[0].tactic === 'aggressive' ? 'selected' : ''}>Agresivní drcení (+25% síla)</option>
                    <option value="retreat" ${gameState.fleets[0].tactic === 'retreat' ? 'selected' : ''}>Ochranný ústup (Bezpečná flotila)</option>
                </select>
            </p>
            <p>Jednotky v rezervě - Drony: ${gameState.reserveUnits.drone} | Křižníky: ${gameState.reserveUnits.cruiser}</p>
            <button onclick="addTestUnits()">Přidat testovací drony (+5)</button>
        </div>
    `;
}

function changeTactic(val) {
    gameState.fleets[0].tactic = val;
    saveGame();
}

function addTestUnits() {
    gameState.reserveUnits.drone += 5;
    // Automatické přiřazení do hlavní flotily pro test
    gameState.fleets[0].units.drone += 5;
    saveGame();
    renderAll();
}

function renderAnomalies() {
    const container = document.getElementById('anomalies-content');
    let html = `<div class="card"><h3>Dostupné anomálie k průzkumu</h3>`;
    gameState.anomalies.forEach(anom => {
        html += `
            <div style="background:#111; padding:8px; margin:5px 0; border-radius:4px;">
                <strong>${anom.name}</strong><br><small>${anom.desc}</small><br>
                <button onclick="exploreAnomaly(${anom.id})">Prozkoumat</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function exploreAnomaly(anomId) {
    const anom = gameState.anomalies.find(a => a.id === anomId);
    if (!anom) return;

    if (anom.rewardType === 'techFragments') {
        gameState.techFragments = (gameState.techFragments || 0) + anom.rewardValue;
        alert(`Průzkum uspěl! Získal jsi ${anom.rewardValue} technologických fragmentů.`);
    } else if (anom.rewardType === 'naquadah') {
        gameState.resources.naquadah += anom.rewardValue;
        alert(`Průzkum uspěl! Nalezen volný naquadah: +${anom.rewardValue}.`);
    } else {
        alert(`Průzkum dokončen: Posádka získala cenné zkušenosti.`);
    }

    // Odstranění prozkoumané anomálie
    gameState.anomalies = gameState.anomalies.filter(a => a.id !== anomId);
    saveGame();
    renderAll();
}

function renderLogs() {
    const container = document.getElementById('logs-content');
    if (!gameState.battleLogs || gameState.battleLogs.length === 0) {
        container.innerHTML = `<p>Zatím žádná bojová hlášení v archivu.</p>`;
        return;
    }

    let html = `<div class="card"><h3>Historie střetnutí</h3>`;
    gameState.battleLogs.forEach(log => {
        html += `
            <div class="log-entry">
                <small>[${log.time}] Sektor: <strong>${log.target}</strong></small><br>
                <span>${log.result}</span><br>
                <small>Síla flotily: ${log.fleetPower} vs Nepřítel: ${log.enemyPower}</small>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

window.onload = loadGame;
