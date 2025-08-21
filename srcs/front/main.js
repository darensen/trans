const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const regEnable2FA = document.getElementById('reg-enable-2fa');
const twofaModal = document.getElementById('twofa-modal');
const twofaTitle = document.getElementById('twofa-title');
const twofaDesc = document.getElementById('twofa-desc');
const twofaQR = document.getElementById('twofa-qr');
const twofaQRWrap = document.getElementById('twofa-qr-wrap');
const twofaCode = document.getElementById('twofa-code');
const twofaCancel = document.getElementById('twofa-cancel');
const twofaConfirm = document.getElementById('twofa-confirm');
const showRegisterBtn = document.getElementById('show-register');
const homeSection = document.getElementById('home-section');
const gameSection = document.getElementById('game-section');
const profileSection = document.getElementById('profile-section');
const goGameBtn = document.getElementById('go-game');
const backHomeBtn = document.getElementById('accueil');
const goProfileBtn = document.getElementById('go-profile');
const backHomeProfileBtn = document.getElementById('back-home-profile');
const profileForm = document.getElementById('profile-form');
const profileEmail = document.getElementById('profile-email');
const profileDisplayName = document.getElementById('profile-displayName');
const profileAvatar = document.getElementById('profile-avatar');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const regAvatar = document.getElementById('reg-avatar');
const searchUserInput = document.getElementById('search-user-input');
const searchUserBtn = document.getElementById('search-user-btn');
const searchUserResult = document.getElementById('search-user-result');
const publicProfileSection = document.getElementById('public-profile-section');
const publicProfileAvatarImg = document.getElementById('public-profile-avatar-img');
const publicProfileEmail = document.getElementById('public-profile-email');
const publicProfileDisplayName = document.getElementById('public-profile-displayName');
const backProfileBtn = document.getElementById('back-profile-btn');
const addFriendBtn = document.getElementById('add-friend-btn');
const profileTabStats = document.getElementById('profile-tab-stats');
const profileStatsPanel = document.getElementById('profile-stats-panel');
const profileTabFriends = document.getElementById('profile-tab-friends');
const profileFriendsPanel = document.getElementById('profile-friends-panel');
const publicProfileTabStats = document.getElementById('public-profile-tab-stats');
const publicProfileStatsPanel = document.getElementById('public-profile-stats-panel');
const anonymizeAccountBtn = document.getElementById('anonymize-account-btn');
const exportDataBtn = document.getElementById('export-data-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const log_page = document.getElementById('c-page');
const page_acc = document.getElementById('page-accueil');
const canvas = document.getElementById('pong');
const pongpage = document.getElementById('pong-game');
const bg_blur = document.getElementById('blur-bg');
const profileHistory = document.getElementById('profile-history');
const tournamentSection = document.getElementById('tournament-section');
const tournamentMatchupPopup = document.getElementById('tournament-matchup-popup');
const tournamentBracketDisplay = document.getElementById('tournament-bracket-display');
const finalSection = document.getElementById('final-section');
const tournamentCountdown = document.getElementById('tournament-countdown');
const countdownTimer = document.getElementById('countdown-timer');
const pongPlayers = document.getElementById('pong-players');
const tournoisBtn = document.getElementById('tournois-button');
const localGameBtn = document.getElementById('local-game-button');
const legalNoticesSection = document.getElementById('legal-notices-section');
const legalNoticesLink = document.getElementById('legal-notices-link');
const homeLegalNoticesLink = document.getElementById('home-legal-notices-link');
const closeLegalNoticesBtn = document.getElementById('close-legal-notices');
const privacyPolicySection = document.getElementById('privacy-policy-section');
const privacyPolicyLink = document.getElementById('privacy-policy-link');
const homePrivacyPolicyLink = document.getElementById('home-privacy-policy-link');
const closePrivacyPolicyBtn = document.getElementById('close-privacy-policy');
let pingInterval;
let currentPublicUserId = null;
// Variable pour tracker si on est en jeu
let isGameActive = false;
// Variable pour tracker la page précédente
let previousView = 'login';
let winLossChart = null;
let matchTypesChart = null;
let publicWinLossChart = null;
let publicMatchTypesChart = null;
// Fonctions pour empêcher la navigation
function preventNavigation(e) {
    if (isGameActive) {
        e.preventDefault();
        e.returnValue = 'Une partie est en cours. Êtes-vous sûr de vouloir quitter ?';
        return e.returnValue;
    }
}
function preventBackNavigation(e) {
    if (isGameActive) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
    }
}
// Fonction pour bloquer la navigation pendant le jeu
function lockNavigation() {
    isGameActive = true;
    // Bloquer tous les boutons de navigation
    const navigationButtons = [
        document.getElementById('accueil'),
        document.getElementById('go-game'),
        document.getElementById('go-profile'),
        document.getElementById('logout-btn'),
        document.getElementById('close-tournament-btn'),
        document.getElementById('tournois-button')
    ];
    navigationButtons.forEach(btn => {
        if (btn) {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    });
    // Bloquer les boutons du profil s'ils sont visibles
    const profileButtons = [
        document.getElementById('back-home-profile'),
        document.getElementById('back-profile-btn')
    ];
    profileButtons.forEach(btn => {
        if (btn) {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    });
    // Empêcher le retour arrière du navigateur
    window.addEventListener('beforeunload', preventNavigation);
    window.addEventListener('popstate', preventBackNavigation);
}
// Fonction pour débloquer la navigation après le jeu
function unlockNavigation() {
    isGameActive = false;
    // Débloquer tous les boutons de navigation
    const navigationButtons = [
        document.getElementById('accueil'),
        document.getElementById('go-game'),
        document.getElementById('go-profile'),
        document.getElementById('logout-btn'),
        document.getElementById('close-tournament-btn'),
        document.getElementById('tournois-button')
    ];
    navigationButtons.forEach(btn => {
        if (btn) {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
    // Débloquer les boutons du profil
    const profileButtons = [
        document.getElementById('back-home-profile'),
        document.getElementById('back-profile-btn')
    ];
    profileButtons.forEach(btn => {
        if (btn) {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
    // Retirer les event listeners
    window.removeEventListener('beforeunload', preventNavigation);
    window.removeEventListener('popstate', preventBackNavigation);
}
pingInterval = window.setInterval(async () => {
    try {
        await fetch('/api/ping', {
            method: 'POST',
            credentials: 'include'
        });
    }
    catch (error) {
        console.error('Ping failed:', error);
    }
}, 10000);
if (tournoisBtn && tournamentSection) {
    tournoisBtn.addEventListener('click', () => {
        showView('tournament');
    });
}
function createWinLossChart(ctx, wins, losses) {
    return new window.Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Victoires', 'Défaites'],
            datasets: [{
                    data: [wins, losses],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderColor: ['#16a34a', '#dc2626'],
                    borderWidth: 2
                }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}
function createMatchTypesChart(ctx, normalMatches, tournamentMatches) {
    return new window.Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Parties normales', 'Parties de tournoi'],
            datasets: [{
                    data: [normalMatches, tournamentMatches],
                    backgroundColor: ['#8b5cf6', '#f59e0b'],
                    borderColor: ['#7c3aed', '#d97706'],
                    borderWidth: 2
                }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}
async function loadUserDataInNavbar() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok)
            return;
        const user = await res.json();
        const avatarImg = document.getElementById('user-avatar');
        if (avatarImg) {
            const src = user?.avatar ? user.avatar : '/avatars/default.png';
            avatarImg.src = src + '?t=' + Date.now();
        }
        const displayNameSpan = document.getElementById('user-displayName');
        if (displayNameSpan) {
            displayNameSpan.textContent = user?.displayName || 'Inconnu';
        }
    }
    catch (error) {
        console.warn('Erreur lors du chargement des données utilisateur pour la navbar:', error);
        const displayNameSpan = document.getElementById('user-displayName');
        if (displayNameSpan)
            displayNameSpan.textContent = 'Inconnu';
    }
}
function showView(view, push = true, publicUser) {
    // Sauvegarder l'état précédent seulement si ce n'est pas une page modale (legal-notices ou privacy-policy)
    if (view !== 'legal-notices' && view !== 'privacy-policy') {
        previousView = view;
    }
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    homeSection.classList.add('hidden');
    gameSection.classList.add('hidden');
    profileSection.classList.add('hidden');
    pongpage?.classList.add('hidden');
    bg_blur?.classList.add('hidden');
    publicProfileSection?.classList.add('hidden');
    tournamentSection?.classList.add('hidden');
    pongPlayers?.classList.add('hidden');
    legalNoticesSection?.classList.add('hidden');
    privacyPolicySection?.classList.add('hidden');
    if (page_acc)
        page_acc.classList.add('hidden');
    if (log_page)
        log_page.classList.add('hidden');
    if (view === 'login') {
        log_page?.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        showRegisterBtn.classList.remove('hidden');
    }
    else if (view === 'register') {
        log_page?.classList.remove('hidden');
        registerForm.classList.remove('hidden');
        showRegisterBtn.classList.add('hidden');
    }
    else if (view === 'home') {
        page_acc?.classList.remove('hidden');
        homeSection.classList.remove('hidden');
        showRegisterBtn.classList.add('hidden');
        log_page?.classList.add('hidden');
        drawHomePong();
        fetch('/api/me', { credentials: 'include' })
            .then(async (res) => (res.ok ? res.json() : null))
            .then((user) => {
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg) {
                const src = user?.avatar ? user.avatar : '/avatars/default.png';
                avatarImg.src = src + '?t=' + Date.now();
            }
            const displayNameSpan = document.getElementById('user-displayName');
            if (displayNameSpan) {
                displayNameSpan.textContent = user?.displayName || 'Inconnu';
            }
        })
            .catch(() => {
            const displayNameSpan = document.getElementById('user-displayName');
            if (displayNameSpan)
                displayNameSpan.textContent = 'Inconnu';
        });
        addLogoutButton();
    }
    else if (view === 'game') {
        let vs_player = document.getElementById('vs-player');
        homeSection.classList.remove('hidden');
        gameSection.classList.remove('hidden');
        showRegisterBtn.classList.add('hidden');
        // Charger les données utilisateur pour la navbar
        loadUserDataInNavbar();
        addLogoutButton();
        vs_player?.addEventListener('click', () => {
            canvas.classList.add('hidden');
            gameSection.classList.add('hidden');
            pongpage?.classList.remove('hidden');
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }
            let blurm_bg = document.getElementById('blurm-bg');
            if (pongpage) {
                const existingButtons = pongpage.querySelectorAll('button');
                existingButtons.forEach(btn => btn.remove());
            }
            const startMatchmakingBtn = document.createElement('button');
            startMatchmakingBtn.textContent = 'Commencer le matchmaking';
            startMatchmakingBtn.classList.add('bg-gray-900', 'text-white', 'px-4', 'py-2', 'rounded', 'border', 'border-gray-700', 'hover:bg-gray-800', 'absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2');
            pongpage?.appendChild(startMatchmakingBtn);
            startMatchmakingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (blurm_bg) {
                    blurm_bg.classList.remove('hidden');
                }
                let ws;
                let playernumber = null;
                let gameState = null;
                let animationId = null;
                let finished = false;
                ws = new WebSocket(`wss://${location.host}/ws/pong`);
                ws.onopen = async () => {
                    const response = await fetch('/api/me', {
                        credentials: 'include'
                    });
                    let userId = null;
                    let displayName = 'Joueur';
                    if (response.ok) {
                        const userData = await response.json();
                        userId = userData.id;
                        displayName = userData.displayName || 'Joueur';
                    }
                    ws.send(JSON.stringify({ type: 'join', userId, displayName }));
                };
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'match_found') {
                        if (blurm_bg) {
                            blurm_bg.classList.add('hidden');
                        }
                        canvas.classList.remove('hidden');
                        pongPlayers?.classList.remove('hidden');
                        playernumber = data.playernumber;
                        // Verrouiller la navigation pendant le match vs joueur
                        lockNavigation();
                        fetch('/api/me', { credentials: 'include' })
                            .then(async (res) => (res.ok ? res.json() : null))
                            .then((user) => {
                            const avatarId = playernumber === 1 ? 'playerL-avatar' : 'playerR-avatar';
                            const nameId = playernumber === 1 ? 'playerL-name' : 'playerR-name';
                            const avatarElement = document.getElementById(avatarId);
                            const nameElement = document.getElementById(nameId);
                            if (avatarElement && user) {
                                avatarElement.src = (user.avatar || '/avatars/default.png') + '?t=' + Date.now();
                                nameElement.textContent = user.displayName || 'Joueur';
                            }
                        });
                        fetch(`/api/user/${encodeURIComponent(data.opponent_name)}`, { credentials: 'include' })
                            .then(async (res) => (res.ok ? res.json() : null))
                            .then((user) => {
                            const avatarId = playernumber === 1 ? 'playerR-avatar' : 'playerL-avatar';
                            const nameId = playernumber === 1 ? 'playerR-name' : 'playerL-name';
                            const avatarElement = document.getElementById(avatarId);
                            const nameElement = document.getElementById(nameId);
                            if (avatarElement && user) {
                                avatarElement.src = (user.avatar || '/avatars/default.png') + '?t=' + Date.now();
                                nameElement.textContent = user.displayName || 'Joueur';
                            }
                        });
                        startPongGame();
                    }
                    else if (data.type === 'game_state') {
                        gameState = data.state;
                    }
                    else if (data.type === 'opponent_left') {
                        // Débloquer la navigation
                        unlockNavigation();
                        alert('Ton adversaire a quitté la partie.');
                        if (animationId)
                            cancelAnimationFrame(animationId);
                        showView('home');
                    }
                    else if (data.type === 'loser') {
                        if (finished)
                            return;
                        finished = true;
                        // Débloquer la navigation
                        unlockNavigation();
                        let loserpopup = document.getElementById('loser-popup');
                        if (loserpopup) {
                            loserpopup.classList.remove('hidden');
                            const loserScore = document.getElementById('loser-score');
                            let btnfermer = document.getElementById('fermer-loser');
                            if (loserScore) {
                                loserScore.textContent = `${data.score1} - ${data.score2}`;
                            }
                            if (btnfermer) {
                                btnfermer.addEventListener('click', () => {
                                    loserpopup.classList.add('hidden');
                                    showView('game');
                                });
                            }
                        }
                        if (animationId)
                            cancelAnimationFrame(animationId);
                        return;
                    }
                    else if (data.type === 'winner') {
                        if (finished)
                            return;
                        finished = true;
                        // Débloquer la navigation
                        unlockNavigation();
                        let winnerpopup = document.getElementById('winner-popup');
                        let btnfermer = document.getElementById('fermer');
                        if (winnerpopup) {
                            winnerpopup.classList.remove('hidden');
                            const winnerScore = document.getElementById('winner-score');
                            if (winnerScore) {
                                winnerScore.textContent = `${data.score1} - ${data.score2}`;
                            }
                            if (btnfermer) {
                                btnfermer.addEventListener('click', () => {
                                    winnerpopup.classList.add('hidden');
                                    showView('game');
                                });
                            }
                        }
                        if (animationId)
                            cancelAnimationFrame(animationId);
                        return;
                    }
                };
                ws.onclose = () => {
                    if (animationId)
                        cancelAnimationFrame(animationId);
                };
                function startPongGame() {
                    if (!canvas)
                        return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx)
                        return;
                    let paddleY = 150;
                    const paddleH = 80;
                    const paddleW = 10;
                    const height = 400;
                    const width = 800;
                    function draw() {
                        if (!gameState || !ctx)
                            return;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#222';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.strokeStyle = '#fff';
                        ctx.beginPath();
                        ctx.setLineDash([10, 10]);
                        ctx.moveTo(canvas.width / 2, 0);
                        ctx.lineTo(canvas.width / 2, canvas.height);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(20, gameState.paddle1.y, paddleW, paddleH);
                        ctx.fillRect(canvas.width - 30, gameState.paddle2.y, paddleW, paddleH);
                        ctx.beginPath();
                        ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.font = '18px Arial';
                        ctx.fillStyle = '#fff';
                        ctx.font = '32px Arial';
                        ctx.fillText(gameState.score1, canvas.width / 2 - 50, 40);
                        ctx.fillText(gameState.score2, canvas.width / 2 + 30, 40);
                    }
                    function gameLoop() {
                        draw();
                        animationId = requestAnimationFrame(gameLoop);
                    }
                    gameLoop();
                    function onKey(e) {
                        if (!playernumber)
                            return;
                        let changed = false;
                        const paddleSpeed = 18;
                        if (playernumber === 1) {
                            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                                paddleY -= 10;
                                changed = true;
                            }
                            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                                paddleY += 10;
                                changed = true;
                            }
                        }
                        else if (playernumber === 2) {
                            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                                paddleY -= 10;
                                changed = true;
                            }
                            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                                paddleY += 10;
                                changed = true;
                            }
                        }
                        paddleY = Math.max(0, Math.min(canvas.height - paddleH, paddleY));
                        if (changed) {
                            ws.send(JSON.stringify({ type: 'paddle_move', y: paddleY }));
                        }
                    }
                    window.addEventListener('keydown', onKey);
                }
            });
        });
        localGameBtn?.addEventListener('click', () => {
            canvas.classList.add('hidden');
            gameSection.classList.add('hidden');
            pongpage?.classList.remove('hidden');
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }
            if (pongpage) {
                const existingButtons = pongpage.querySelectorAll('button');
                existingButtons.forEach(btn => btn.remove());
            }
            const startLocalGameBtn = document.createElement('button');
            startLocalGameBtn.textContent = 'Commencer le jeu local';
            startLocalGameBtn.classList.add('bg-gray-900', 'text-white', 'px-4', 'py-2', 'rounded', 'border', 'border-gray-700', 'hover:bg-gray-800', 'absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2');
            pongpage?.appendChild(startLocalGameBtn);
            startLocalGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let ws;
                let gameState = null;
                let animationId = null;
                let finished = false;
                ws = new WebSocket(`wss://${location.host}/ws/pong`);
                ws.onopen = () => {
                    ws.send(JSON.stringify({ type: 'join_local' }));
                };
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'local_game_started') {
                        canvas.classList.remove('hidden');
                        // Verrouiller la navigation pendant le jeu local
                        lockNavigation();
                        startLocalPongGame();
                    }
                    else if (data.type === 'game_state') {
                        gameState = data.state;
                    }
                    else if (data.type === 'game_over') {
                        if (finished)
                            return;
                        finished = true;
                        // Débloquer la navigation
                        unlockNavigation();
                        alert(`Fin de partie ! Score final: ${data.score1} - ${data.score2}. Gagnant: ${data.winner}`);
                        showView('game');
                    }
                };
                function startLocalPongGame() {
                    if (!canvas)
                        return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx)
                        return;
                    let paddle1Y = 150;
                    let paddle2Y = 150;
                    const paddleH = 80;
                    const paddleW = 10;
                    const paddleSpeed = 18;
                    const height = 400;
                    const width = 800;
                    function draw() {
                        if (!gameState || !ctx)
                            return;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#222';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.strokeStyle = '#fff';
                        ctx.beginPath();
                        ctx.setLineDash([10, 10]);
                        ctx.moveTo(canvas.width / 2, 0);
                        ctx.lineTo(canvas.width / 2, canvas.height);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(20, gameState.paddle1.y, paddleW, paddleH);
                        ctx.fillRect(canvas.width - 30, gameState.paddle2.y, paddleW, paddleH);
                        ctx.beginPath();
                        ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.font = '32px Arial';
                        ctx.fillText(gameState.score1, canvas.width / 2 - 50, 40);
                        ctx.fillText(gameState.score2, canvas.width / 2 + 30, 40);
                        ctx.font = '14px Arial';
                    }
                    function gameLoop() {
                        draw();
                        animationId = requestAnimationFrame(gameLoop);
                    }
                    gameLoop();
                    function onKey(e) {
                        let changed1 = false;
                        let changed2 = false;
                        if (e.key === 'w' || e.key === 'W') {
                            paddle1Y -= paddleSpeed;
                            changed1 = true;
                        }
                        if (e.key === 's' || e.key === 'S') {
                            paddle1Y += paddleSpeed;
                            changed1 = true;
                        }
                        if (e.key === 'ArrowUp') {
                            paddle2Y -= paddleSpeed;
                            changed2 = true;
                        }
                        if (e.key === 'ArrowDown') {
                            paddle2Y += paddleSpeed;
                            changed2 = true;
                        }
                        paddle1Y = Math.max(0, Math.min(canvas.height - paddleH, paddle1Y));
                        paddle2Y = Math.max(0, Math.min(canvas.height - paddleH, paddle2Y));
                        if (changed1) {
                            ws.send(JSON.stringify({ type: 'paddle_move', player: 1, y: paddle1Y }));
                        }
                        if (changed2) {
                            ws.send(JSON.stringify({ type: 'paddle_move', player: 2, y: paddle2Y }));
                        }
                    }
                    window.addEventListener('keydown', onKey);
                }
            });
        });
    }
    else if (view === 'profile') {
        bg_blur?.classList.remove('hidden');
        homeSection.classList.remove('hidden');
        profileSection.classList.remove('hidden');
        showRegisterBtn.classList.add('hidden');
        const tabInfo = document.getElementById('profile-tab-info');
        const tabFriends = document.getElementById('profile-tab-friends');
        const tabHistory = document.getElementById('profile-tab-history');
        const tabStats = document.getElementById('profile-tab-stats');
        const infoPanel = document.getElementById('profile-info-panel');
        const friendsPanel = document.getElementById('profile-friends-panel');
        const historyPanel = document.getElementById('profile-history-panel');
        const statsPanel = document.getElementById('profile-stats-panel');
        if (tabInfo && tabFriends && tabHistory && tabStats && infoPanel && friendsPanel && historyPanel && statsPanel) {
            tabInfo.classList.add('bg-blue-600');
            tabInfo.classList.remove('bg-gray-800');
            tabFriends.classList.remove('bg-blue-600');
            tabFriends.classList.add('bg-gray-800');
            tabHistory.classList.remove('bg-blue-600');
            tabHistory.classList.add('bg-gray-800');
            tabStats.classList.remove('bg-blue-600');
            tabStats.classList.add('bg-gray-800');
            infoPanel.classList.remove('hidden');
            friendsPanel.classList.add('hidden');
            historyPanel.classList.add('hidden');
            statsPanel.classList.add('hidden');
        }
        fetch('/api/me', { credentials: 'include' })
            .then(async (res) => (res.ok ? res.json() : null))
            .then(user => {
            if (profileEmail && profileDisplayName) {
                profileEmail.value = user?.email || '';
                profileDisplayName.value = user?.displayName || '';
                if (profileAvatarImg) {
                    const src = user?.avatar ? user.avatar : '/avatars/default.png';
                    profileAvatarImg.src = src + '?t=' + Date.now();
                }
            }
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg) {
                const src = user?.avatar ? user.avatar : '/avatars/default.png';
                avatarImg.src = src + '?t=' + Date.now();
            }
            const displayNameSpan = document.getElementById('user-displayName');
            if (displayNameSpan) {
                displayNameSpan.textContent = user?.displayName || 'Inconnu';
            }
            addLogoutButton();
        });
    }
    else if (view === 'public-profile' && publicUser) {
        currentPublicUserId = publicUser.id;
        homeSection.classList.remove('hidden');
        bg_blur?.classList.remove('hidden');
        if (publicProfileSection)
            publicProfileSection.classList.remove('hidden');
        if (publicProfileAvatarImg)
            publicProfileAvatarImg.src = (publicUser.avatar || '/avatars/default.png') + '?t=' + Date.now();
        if (publicProfileEmail)
            publicProfileEmail.textContent = publicUser.email;
        if (publicProfileDisplayName)
            publicProfileDisplayName.textContent = publicUser.displayName;
        const publicTabInfo = document.getElementById('public-profile-tab-info');
        const publicTabHistory = document.getElementById('public-profile-tab-history');
        const publicTabStats = document.getElementById('public-profile-tab-stats');
        const publicInfoPanel = document.getElementById('public-profile-info-panel');
        const publicHistoryPanel = document.getElementById('public-profile-history-panel');
        const publicStatsPanel = document.getElementById('public-profile-stats-panel');
        if (publicTabInfo && publicTabHistory && publicTabStats && publicInfoPanel && publicHistoryPanel && publicStatsPanel) {
            publicTabInfo.classList.add('bg-blue-600');
            publicTabInfo.classList.remove('bg-gray-800');
            publicTabHistory.classList.remove('bg-blue-600');
            publicTabHistory.classList.add('bg-gray-800');
            publicTabStats.classList.remove('bg-blue-600');
            publicTabStats.classList.add('bg-gray-800');
            publicInfoPanel.classList.remove('hidden');
            publicHistoryPanel.classList.add('hidden');
            publicStatsPanel.classList.add('hidden');
        }
        let statusDot = document.getElementById('public-profile-status-dot');
        let statusText = document.getElementById('public-profile-status-text');
        if (!statusDot) {
            statusDot = document.createElement('span');
            statusDot.id = 'public-profile-status-dot';
            statusDot.style.display = 'inline-block';
            statusDot.style.width = '12px';
            statusDot.style.height = '12px';
            statusDot.style.borderRadius = '50%';
            statusDot.style.marginLeft = '8px';
            publicProfileAvatarImg?.parentElement?.insertBefore(statusDot, publicProfileAvatarImg.nextSibling);
        }
        if (!statusText) {
            statusText = document.createElement('span');
            statusText.className = 'text-white';
            statusText.id = 'public-profile-status-text';
            statusText.style.marginLeft = '6px';
            statusDot?.parentElement?.insertBefore(statusText, statusDot.nextSibling);
        }
        statusDot.style.backgroundColor = publicUser.online ? '#22c55e' : '#ef4444';
        statusText.textContent = publicUser.online ? 'en ligne' : 'hors ligne';
        fetch('/api/me', { credentials: 'include' })
            .then(async (res) => (res.ok ? res.json() : null))
            .then(async (me) => {
            if (addFriendBtn) {
                if (me && me.displayName && publicUser.displayName && me.displayName !== publicUser.displayName) {
                    const friendsRes = await fetch('/api/friends', { credentials: 'include' });
                    if (friendsRes.ok) {
                        const friends = await friendsRes.json();
                        const isAlreadyFriend = friends.some((friend) => friend.id === publicUser.id);
                        if (isAlreadyFriend) {
                            addFriendBtn.classList.add('hidden');
                            addFriendBtn.removeAttribute('data-userid');
                        }
                        else {
                            addFriendBtn.classList.remove('hidden');
                            addFriendBtn.setAttribute('data-userid', publicUser.id);
                        }
                    }
                    else {
                        addFriendBtn.classList.remove('hidden');
                        addFriendBtn.setAttribute('data-userid', publicUser.id);
                    }
                }
                else {
                    addFriendBtn.classList.add('hidden');
                    addFriendBtn.removeAttribute('data-userid');
                }
            }
        });
    }
    else {
        currentPublicUserId = null;
        if (addFriendBtn) {
            addFriendBtn.classList.add('hidden');
            addFriendBtn.removeAttribute('data-userid');
        }
    }
    if (push) {
        history.pushState({ view }, '', view === 'login' ? '/' : `/${view}`);
    }
    if (view === 'login') {
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = undefined;
        }
        localStorage.removeItem('userId');
    }
    else {
        if (!pingInterval) {
            pingInterval = setInterval(async () => {
                try {
                    await fetch('/api/ping', {
                        method: 'POST',
                        credentials: 'include'
                    });
                }
                catch (error) {
                    console.error('Ping failed:', error);
                }
            }, 10000);
        }
    }
    if (view === 'tournament') {
        homeSection.classList.remove('hidden');
        tournamentSection?.classList.remove('hidden');
        loadUserDataInNavbar();
        addLogoutButton();
        // Réinitialiser les slots du tournoi
        resetTournamentSlots();
        return;
    }
    else if (view === 'legal-notices') {
        legalNoticesSection?.classList.remove('hidden');
        return;
    }
    else if (view === 'privacy-policy') {
        privacyPolicySection?.classList.remove('hidden');
        return;
    }
}
showRegisterBtn.addEventListener('click', () => {
    showView('register');
});
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const displayName = document.getElementById('reg-displayName').value.trim();
    if (!email || !password || !displayName) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erreur lors de la création du compte');
        return;
    }
    if (regEnable2FA && regEnable2FA.checked) {
        const loginRes = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        if (!loginRes.ok) {
            alert('Compte créé. Veuillez vous connecter pour terminer la configuration 2FA.');
            showView('login');
            document.getElementById('email').value = email;
            return;
        }
        const verified = await openTwoFAModal({ mode: 'setup' }, async (code) => {
            const r = await fetch('/api/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code })
            });
            if (!r.ok) {
                alert('Code invalide');
                return false;
            }
            return true;
        });
        try {
            const meRes = await fetch('/api/me', { credentials: 'include' });
            if (meRes.ok) {
                const me = await meRes.json();
                localStorage.setItem('userId', me.id);
            }
        }
        catch { }
        showView('home');
    }
    else {
        alert('Compte créé. Veuillez vous connecter.');
        showView('login');
    }
});
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!email || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    const attempt = async (otp) => {
        return fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, otp })
        });
    };
    let res = await attempt();
    if (res.status === 206) {
        const verified = await openTwoFAModal({ mode: 'enter' }, async (code) => {
            res = await attempt(code);
            if (res.ok)
                return true;
            const data = await res.json().catch(() => ({}));
            alert(data.error || 'Code 2FA invalide');
            return false;
        });
        if (!verified) {
            return;
        }
    }
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erreur de connexion');
        return;
    }
    let me = null;
    try {
        const meRes = await fetch('/api/me', { credentials: 'include' });
        if (meRes.ok) {
            me = await meRes.json();
            localStorage.setItem('userId', me.id);
            console.log('Connexion réussie - l\'historique sera rechargé automatiquement');
        }
    }
    catch { }
    showView('home');
});
if (goGameBtn) {
    goGameBtn.addEventListener('click', () => {
        showView('game');
    });
}
if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
        showView('home');
    });
}
if (goProfileBtn) {
    goProfileBtn.addEventListener('click', () => {
        showView('profile');
    });
}
if (backHomeProfileBtn) {
    backHomeProfileBtn.addEventListener('click', () => {
        showView('home');
    });
}
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!profileEmail || !profileDisplayName)
            return;
        const email = profileEmail.value.trim();
        const displayName = profileDisplayName.value.trim();
        if (profileAvatar && profileAvatar.files && profileAvatar.files[0]) {
            if (profileAvatar.files[0].size > 50 * 1024) {
                alert('Avatar trop volumineux (max 50kb).');
                return;
            }
        }
        const res = await fetch('/api/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, displayName })
        });
        let avatarUrl;
        if (profileAvatar && profileAvatar.files && profileAvatar.files[0]) {
            const userRes = await fetch('/api/me', { credentials: 'include' });
            const user = await userRes.json();
            const formData = new FormData();
            formData.append('file', profileAvatar.files[0]);
            const avatarRes = await fetch('/api/me/avatar', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            if (avatarRes.ok) {
                const data = await avatarRes.json();
                avatarUrl = data.avatar;
            }
        }
        if (res.ok) {
            alert('Profil mis à jour !');
            if (avatarUrl && profileAvatarImg) {
                profileAvatarImg.src = avatarUrl + '?t=' + Date.now();
            }
            showView('profile', false);
        }
        else {
            const data = await res.json();
            alert(data.error || 'Erreur lors de la mise à jour');
        }
    });
}
if (searchUserBtn && searchUserInput && searchUserResult) {
    searchUserBtn.addEventListener('click', async () => {
        const displayName = searchUserInput.value.trim();
        searchUserResult.innerHTML = '';
        if (!displayName) {
            searchUserResult.textContent = 'Veuillez entrer un pseudo.';
            return;
        }
        const res = await fetch(`/api/user/${encodeURIComponent(displayName)}`, {
            credentials: 'include'
        });
        if (res.ok) {
            const user = await res.json();
            searchUserResult.innerHTML = `
        <div class="flex items-center mb-2">
          <img src="${user.avatar || '/avatars/default.png'}?t=${Date.now()}" alt="Avatar" class="w-10 h-10 rounded-full mr-2">
          <span class="font-bold">${user.displayName}</span>
        </div>
        <button id="view-public-profile" class="bg-blue-500 text-white px-4 py-2 rounded w-full">Voir le profil</button>
      `;
            const viewBtn = document.getElementById('view-public-profile');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => {
                    showView('public-profile', true, user);
                });
            }
        }
        else {
            searchUserResult.textContent = 'Utilisateur non trouvé.';
        }
    });
}
if (backProfileBtn) {
    backProfileBtn.addEventListener('click', () => {
        showView('profile');
        renderFriendsList();
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});
function initializeEventListeners() {
    if (showRegisterBtn && !showRegisterBtn.hasAttribute('data-listener-added')) {
        showRegisterBtn.setAttribute('data-listener-added', 'true');
        showRegisterBtn.addEventListener('click', () => {
            showView('register');
        });
    }
    if (goGameBtn && !goGameBtn.hasAttribute('data-listener-added')) {
        goGameBtn.setAttribute('data-listener-added', 'true');
        goGameBtn.addEventListener('click', () => {
            showView('game');
        });
    }
    if (backHomeBtn && !backHomeBtn.hasAttribute('data-listener-added')) {
        backHomeBtn.setAttribute('data-listener-added', 'true');
        backHomeBtn.addEventListener('click', () => {
            showView('home');
        });
    }
    if (goProfileBtn && !goProfileBtn.hasAttribute('data-listener-added')) {
        goProfileBtn.setAttribute('data-listener-added', 'true');
        goProfileBtn.addEventListener('click', () => {
            showView('profile');
        });
    }
    if (backHomeProfileBtn && !backHomeProfileBtn.hasAttribute('data-listener-added')) {
        backHomeProfileBtn.setAttribute('data-listener-added', 'true');
        backHomeProfileBtn.addEventListener('click', () => {
            showView('home');
        });
    }
    if (backProfileBtn && !backProfileBtn.hasAttribute('data-listener-added')) {
        backProfileBtn.setAttribute('data-listener-added', 'true');
        backProfileBtn.addEventListener('click', () => {
            showView('profile');
            renderFriendsList();
        });
    }
    const deleteAvatarBtn = document.getElementById('delete-avatar');
    if (deleteAvatarBtn && !deleteAvatarBtn.hasAttribute('data-listener-added')) {
        deleteAvatarBtn.setAttribute('data-listener-added', 'true');
        deleteAvatarBtn.addEventListener('click', async () => {
            await fetch('/api/me/avatar', { method: 'DELETE', credentials: 'include' });
            showView('profile', false);
        });
    }
    if (anonymizeAccountBtn && !anonymizeAccountBtn.hasAttribute('data-listener-added')) {
        anonymizeAccountBtn.setAttribute('data-listener-added', 'true');
        anonymizeAccountBtn.addEventListener('click', async () => {
            try {
                await anonymizeMe();
                showView('profile', false);
                loadUserDataInNavbar();
            }
            catch (e) {
                alert('Erreur lors de l\'anonymisation');
            }
        });
    }
    if (exportDataBtn && !exportDataBtn.hasAttribute('data-listener-added')) {
        exportDataBtn.setAttribute('data-listener-added', 'true');
        exportDataBtn.addEventListener('click', async () => {
            try {
                await exportMe();
            }
            catch {
                alert('Export impossible');
            }
        });
    }
    if (deleteAccountBtn && !deleteAccountBtn.hasAttribute('data-listener-added')) {
        deleteAccountBtn.setAttribute('data-listener-added', 'true');
        deleteAccountBtn.addEventListener('click', async () => {
            try {
                const deleted = await deleteMe();
                if (deleted) {
                    showView('login');
                }
            }
            catch {
                alert('Suppression impossible');
            }
        });
    }
    if (legalNoticesLink && !legalNoticesLink.hasAttribute('data-listener-added')) {
        legalNoticesLink.setAttribute('data-listener-added', 'true');
        legalNoticesLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView('legal-notices');
        });
    }
    if (homeLegalNoticesLink && !homeLegalNoticesLink.hasAttribute('data-listener-added')) {
        homeLegalNoticesLink.setAttribute('data-listener-added', 'true');
        homeLegalNoticesLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView('legal-notices');
        });
    }
    if (closeLegalNoticesBtn && !closeLegalNoticesBtn.hasAttribute('data-listener-added')) {
        closeLegalNoticesBtn.setAttribute('data-listener-added', 'true');
        closeLegalNoticesBtn.addEventListener('click', () => {
            // Utiliser la page précédente sauvegardée
            showView(previousView);
        });
    }
    if (privacyPolicyLink && !privacyPolicyLink.hasAttribute('data-listener-added')) {
        privacyPolicyLink.setAttribute('data-listener-added', 'true');
        privacyPolicyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView('privacy-policy');
        });
    }
    if (homePrivacyPolicyLink && !homePrivacyPolicyLink.hasAttribute('data-listener-added')) {
        homePrivacyPolicyLink.setAttribute('data-listener-added', 'true');
        homePrivacyPolicyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView('privacy-policy');
        });
    }
    if (closePrivacyPolicyBtn && !closePrivacyPolicyBtn.hasAttribute('data-listener-added')) {
        closePrivacyPolicyBtn.setAttribute('data-listener-added', 'true');
        closePrivacyPolicyBtn.addEventListener('click', () => {
            // Utiliser la page précédente sauvegardée
            showView(previousView);
        });
    }
    setupTabListeners();
    setupPublicTabListeners();
    if (!window.hasOwnProperty('popstateListenerAdded')) {
        window.addEventListener('popstate', async (event) => {
            try {
                const meRes = await fetch('/api/me', { credentials: 'include' });
                const isAuthenticated = meRes.ok;
                let targetView = event.state?.view || 'login';
                if (!isAuthenticated && ['home', 'game', 'profile', 'tournament', 'public-profile'].includes(targetView)) {
                    targetView = 'login';
                    history.replaceState({ view: 'login' }, '', '/');
                }
                else if (isAuthenticated && ['login', 'register'].includes(targetView)) {
                    targetView = 'home';
                    history.replaceState({ view: 'home' }, '', '/home');
                }
                showView(targetView, false);
            }
            catch (error) {
                console.error('Erreur lors de la vérification auth dans popstate:', error);
                showView('login', false);
            }
        });
        window.popstateListenerAdded = true;
    }
    console.log('Event listeners initialisés');
}
function setupTabListeners() {
    const tabInfo = document.getElementById('profile-tab-info');
    const tabFriends = document.getElementById('profile-tab-friends');
    const tabHistory = document.getElementById('profile-tab-history');
    const tabStats = document.getElementById('profile-tab-stats');
    const infoPanel = document.getElementById('profile-info-panel');
    const friendsPanel = document.getElementById('profile-friends-panel');
    const historyPanel = document.getElementById('profile-history-panel');
    const statsPanel = document.getElementById('profile-stats-panel');
    if (tabInfo && tabFriends && tabHistory && tabStats && infoPanel && friendsPanel && historyPanel && statsPanel) {
        if (!tabInfo.hasAttribute('data-listener-added')) {
            tabInfo.setAttribute('data-listener-added', 'true');
            tabInfo.addEventListener('click', () => {
                setActiveTab('info', { tabInfo, tabFriends, tabHistory, tabStats }, { infoPanel, friendsPanel, historyPanel, statsPanel });
            });
        }
        if (!tabFriends.hasAttribute('data-listener-added')) {
            tabFriends.setAttribute('data-listener-added', 'true');
            tabFriends.addEventListener('click', () => {
                setActiveTab('friends', { tabInfo, tabFriends, tabHistory, tabStats }, { infoPanel, friendsPanel, historyPanel, statsPanel });
                renderFriendsList();
                renderFriendRequests();
            });
        }
        if (!tabHistory.hasAttribute('data-listener-added')) {
            tabHistory.setAttribute('data-listener-added', 'true');
            tabHistory.addEventListener('click', () => {
                setActiveTab('history', { tabInfo, tabFriends, tabHistory, tabStats }, { infoPanel, friendsPanel, historyPanel, statsPanel });
                renderMatchHistory();
            });
        }
        if (!tabStats.hasAttribute('data-listener-added')) {
            tabStats.setAttribute('data-listener-added', 'true');
            tabStats.addEventListener('click', () => {
                setActiveTab('stats', { tabInfo, tabFriends, tabHistory, tabStats }, { infoPanel, friendsPanel, historyPanel, statsPanel });
                renderStats();
            });
        }
    }
}
function setupPublicTabListeners() {
    const publicTabInfo = document.getElementById('public-profile-tab-info');
    const publicTabHistory = document.getElementById('public-profile-tab-history');
    const publicTabStats = document.getElementById('public-profile-tab-stats');
    const publicInfoPanel = document.getElementById('public-profile-info-panel');
    const publicHistoryPanel = document.getElementById('public-profile-history-panel');
    const publicStatsPanel = document.getElementById('public-profile-stats-panel');
    if (publicTabInfo && publicTabHistory && publicTabStats && publicInfoPanel && publicHistoryPanel && publicStatsPanel) {
        if (!publicTabInfo.hasAttribute('data-listener-added')) {
            publicTabInfo.setAttribute('data-listener-added', 'true');
            publicTabInfo.addEventListener('click', () => {
                setActiveTab('info', { tabInfo: publicTabInfo, tabHistory: publicTabHistory, tabStats: publicTabStats }, { infoPanel: publicInfoPanel, historyPanel: publicHistoryPanel, statsPanel: publicStatsPanel });
            });
        }
        if (!publicTabHistory.hasAttribute('data-listener-added')) {
            publicTabHistory.setAttribute('data-listener-added', 'true');
            publicTabHistory.addEventListener('click', () => {
                setActiveTab('history', { tabInfo: publicTabInfo, tabHistory: publicTabHistory, tabStats: publicTabStats }, { infoPanel: publicInfoPanel, historyPanel: publicHistoryPanel, statsPanel: publicStatsPanel });
                if (currentPublicUserId) {
                    renderPublicMatchHistory(currentPublicUserId);
                }
            });
        }
        if (!publicTabStats.hasAttribute('data-listener-added')) {
            publicTabStats.setAttribute('data-listener-added', 'true');
            publicTabStats.addEventListener('click', () => {
                setActiveTab('stats', { tabInfo: publicTabInfo, tabHistory: publicTabHistory, tabStats: publicTabStats }, { infoPanel: publicInfoPanel, historyPanel: publicHistoryPanel, statsPanel: publicStatsPanel });
                if (currentPublicUserId) {
                    renderPublicProfileStats(currentPublicUserId);
                }
            });
        }
    }
}
function setActiveTab(activeTab, tabs, panels) {
    Object.values(tabs).forEach(tab => {
        if (tab) {
            tab.classList.remove('bg-blue-600');
            tab.classList.add('bg-gray-800');
        }
    });
    Object.values(panels).forEach(panel => {
        if (panel) {
            panel.classList.add('hidden');
        }
    });
    switch (activeTab) {
        case 'info':
            tabs.tabInfo.classList.add('bg-blue-600');
            tabs.tabInfo.classList.remove('bg-gray-800');
            panels.infoPanel.classList.remove('hidden');
            break;
        case 'friends':
            if (tabs.tabFriends && panels.friendsPanel) {
                tabs.tabFriends.classList.add('bg-blue-600');
                tabs.tabFriends.classList.remove('bg-gray-800');
                panels.friendsPanel.classList.remove('hidden');
            }
            break;
        case 'history':
            tabs.tabHistory.classList.add('bg-blue-600');
            tabs.tabHistory.classList.remove('bg-gray-800');
            panels.historyPanel.classList.remove('hidden');
            break;
        case 'stats':
            tabs.tabStats.classList.add('bg-blue-600');
            tabs.tabStats.classList.remove('bg-gray-800');
            panels.statsPanel.classList.remove('hidden');
            break;
    }
}
async function renderMatchHistory() {
    const historyList = document.getElementById('profile-history-list');
    if (!historyList)
        return;
    try {
        console.log('Fetching match history...');
        const userRes = await fetch('/api/me', { credentials: 'include' });
        if (!userRes.ok) {
            historyList.textContent = 'Erreur d\'authentification.';
            return;
        }
        const currentUser = await userRes.json();
        const res = await fetch('/api/matches/history', { credentials: 'include' });
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        if (!res.ok) {
            const errorText = await res.text();
            console.log('Error response:', errorText);
            historyList.textContent = 'Erreur lors du chargement de l\'historique.';
            return;
        }
        const matches = await res.json();
        console.log('Matches received:', matches);
        if (matches.length === 0) {
            historyList.textContent = 'Aucune partie jouée pour le moment.';
            return;
        }
        historyList.innerHTML = matches.map((match) => {
            const isWinner = match.isWinner;
            const opponent = match.player1.id === currentUser.id ? match.player2 : match.player1;
            const userScore = match.player1.id === currentUser.id ? match.player1Score : match.player2Score;
            const opponentScore = match.player1.id === currentUser.id ? match.player2Score : match.player1Score;
            let matchTypeLabel = '';
            if (match.matchType === 'TOURNAMENT_SEMI') {
                matchTypeLabel = '<span class="text-yellow-400">Tournoi - Demi-finale</span>';
            }
            else if (match.matchType === 'TOURNAMENT_FINAL') {
                matchTypeLabel = '<span class="text-yellow-400">Tournoi - Finale</span>';
            }
            else {
                matchTypeLabel = '<span class="text-blue-400">Partie normale</span>';
            }
            return `
        <div class="bg-gray-800 p-3 rounded mb-2">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center">
              <span class="font-semibold">vs ${opponent.displayName}    </span>
              <img src="${opponent.avatar || '/avatars/default.png'}" class="w-8 h-8 rounded-full mr-2" alt="Avatar">
            </div>
            <div class="text-lg font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}">
              ${isWinner ? 'VICTOIRE' : 'DÉFAITE'}
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-300">Score: ${userScore} - ${opponentScore}</span>
            <span class="text-gray-400">${new Date(match.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="mt-1">
            ${matchTypeLabel}
          </div>
        </div>
      `;
        }).join('');
    }
    catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        historyList.textContent = 'Erreur lors du chargement de l\'historique.';
    }
}
async function renderStats() {
    const statsDiv = document.getElementById('profile-stats');
    if (!statsDiv)
        return;
    try {
        const res = await fetch('/api/matches/history', { credentials: 'include' });
        if (!res.ok) {
            console.error('Erreur lors du chargement des statistiques');
            return;
        }
        const matches = await res.json();
        const totalMatches = matches.length;
        const wins = matches.filter((match) => match.isWinner).length;
        const losses = totalMatches - wins;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        const tournamentMatches = matches.filter((match) => match.matchType.startsWith('TOURNAMENT'));
        const normalMatches = matches.filter((match) => match.matchType === 'NORMAL');
        const totalWinsEl = document.getElementById('total-wins');
        const totalLossesEl = document.getElementById('total-losses');
        const winRateEl = document.getElementById('win-rate');
        const totalMatchesEl = document.getElementById('total-matches');
        if (totalWinsEl)
            totalWinsEl.textContent = wins.toString();
        if (totalLossesEl)
            totalLossesEl.textContent = losses.toString();
        if (winRateEl)
            winRateEl.textContent = `${winRate}%`;
        if (totalMatchesEl)
            totalMatchesEl.textContent = totalMatches.toString();
        setTimeout(() => {
            if (winLossChart)
                winLossChart.destroy();
            if (matchTypesChart)
                matchTypesChart.destroy();
            const winLossCtx = document.getElementById('winLossChart');
            const matchTypesCtx = document.getElementById('matchTypesChart');
            if (winLossCtx) {
                winLossChart = createWinLossChart(winLossCtx.getContext('2d'), wins, losses);
            }
            if (matchTypesCtx) {
                matchTypesChart = createMatchTypesChart(matchTypesCtx.getContext('2d'), normalMatches.length, tournamentMatches.length);
            }
        }, 100);
    }
    catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}
// Fonction pour mettre à jour l'affichage du bracket de tournoi
function updateTournamentBracket(data) {
    // Si c'est la finale, on affiche seulement la section finale
    if (data.matchType === 'TOURNAMENT_FINAL' && data.currentMatch) {
        const finalp1Name = document.getElementById('final-p1-name');
        const finalp1Avatar = document.getElementById('final-p1-avatar');
        const finalp2Name = document.getElementById('final-p2-name');
        const finalp2Avatar = document.getElementById('final-p2-avatar');
        if (finalp1Name)
            finalp1Name.textContent = data.currentMatch.player1.displayName;
        if (finalp1Avatar)
            finalp1Avatar.src = data.currentMatch.player1.avatar || '/avatars/default.png';
        if (finalp2Name)
            finalp2Name.textContent = data.currentMatch.player2.displayName;
        if (finalp2Avatar)
            finalp2Avatar.src = data.currentMatch.player2.avatar || '/avatars/default.png';
        // Afficher la section finale et cacher les demi-finales
        if (finalSection) {
            finalSection.classList.remove('hidden');
            // S'assurer que le titre de la finale est visible et correct
            const finalTitle = finalSection.querySelector('h3');
            if (finalTitle) {
                finalTitle.textContent = ' FINALE ';
                finalTitle.className = 'text-2xl font-bold text-yellow-400 mb-4';
            }
        }
        // Cacher les demi-finales dans l'affichage
        const semifinalsSection = document.querySelector('.text-center:has(h3:contains("Demi-finales"))');
        if (semifinalsSection) {
            semifinalsSection.style.display = 'none';
        }
        return;
    }
    // Gestion des demi-finales - améliorer l'affichage des noms
    if (data.currentMatch) {
        // Mise à jour du match actuel (peut être demi-finale 1 ou 2)
        if (data.matchType === 'TOURNAMENT_SEMI') {
            // Déterminer quel match de demi-finale c'est
            const isMatch1 = data.semifinalNumber === 1 || data.currentMatch.matchNumber === 1;
            if (isMatch1) {
                const semi1p1Name = document.getElementById('semi1-p1-name');
                const semi1p1Avatar = document.getElementById('semi1-p1-avatar');
                const semi1p2Name = document.getElementById('semi1-p2-name');
                const semi1p2Avatar = document.getElementById('semi1-p2-avatar');
                if (semi1p1Name) {
                    semi1p1Name.textContent = data.currentMatch.player1.displayName;
                    semi1p1Name.className = 'text-white font-bold text-lg'; // Améliorer la visibilité
                }
                if (semi1p1Avatar)
                    semi1p1Avatar.src = data.currentMatch.player1.avatar || '/avatars/default.png';
                if (semi1p2Name) {
                    semi1p2Name.textContent = data.currentMatch.player2.displayName;
                    semi1p2Name.className = 'text-white font-bold text-lg'; // Améliorer la visibilité
                }
                if (semi1p2Avatar)
                    semi1p2Avatar.src = data.currentMatch.player2.avatar || '/avatars/default.png';
                // Ajouter un indicateur VS entre les joueurs si disponible
                const vsIndicator1 = document.getElementById('semi1-vs') || document.createElement('div');
                if (!document.getElementById('semi1-vs')) {
                    vsIndicator1.id = 'semi1-vs';
                    vsIndicator1.className = 'text-red-400 font-bold text-xl mx-2';
                    vsIndicator1.textContent = 'VS';
                    // Insérer entre les deux joueurs s'il y a un conteneur
                    const semi1Container = semi1p1Name?.parentElement?.parentElement;
                    if (semi1Container) {
                        semi1Container.appendChild(vsIndicator1);
                    }
                }
            }
            else {
                const semi2p1Name = document.getElementById('semi2-p1-name');
                const semi2p1Avatar = document.getElementById('semi2-p1-avatar');
                const semi2p2Name = document.getElementById('semi2-p2-name');
                const semi2p2Avatar = document.getElementById('semi2-p2-avatar');
                if (semi2p1Name) {
                    semi2p1Name.textContent = data.currentMatch.player1.displayName;
                    semi2p1Name.className = 'text-white font-bold text-lg'; // Améliorer la visibilité
                }
                if (semi2p1Avatar)
                    semi2p1Avatar.src = data.currentMatch.player1.avatar || '/avatars/default.png';
                if (semi2p2Name) {
                    semi2p2Name.textContent = data.currentMatch.player2.displayName;
                    semi2p2Name.className = 'text-white font-bold text-lg'; // Améliorer la visibilité
                }
                if (semi2p2Avatar)
                    semi2p2Avatar.src = data.currentMatch.player2.avatar || '/avatars/default.png';
                // Ajouter un indicateur VS entre les joueurs si disponible
                const vsIndicator2 = document.getElementById('semi2-vs') || document.createElement('div');
                if (!document.getElementById('semi2-vs')) {
                    vsIndicator2.id = 'semi2-vs';
                    vsIndicator2.className = 'text-red-400 font-bold text-xl mx-2';
                    vsIndicator2.textContent = 'VS';
                    // Insérer entre les deux joueurs s'il y a un conteneur
                    const semi2Container = semi2p1Name?.parentElement?.parentElement;
                    if (semi2Container) {
                        semi2Container.appendChild(vsIndicator2);
                    }
                }
            }
        }
    }
    // Données statiques pour les autres matchs si disponibles
    if (data.semifinalMatch1) {
        const semi1p1Name = document.getElementById('semi1-p1-name');
        const semi1p1Avatar = document.getElementById('semi1-p1-avatar');
        const semi1p2Name = document.getElementById('semi1-p2-name');
        const semi1p2Avatar = document.getElementById('semi1-p2-avatar');
        if (semi1p1Name)
            semi1p1Name.textContent = data.semifinalMatch1.player1.displayName;
        if (semi1p1Avatar)
            semi1p1Avatar.src = data.semifinalMatch1.player1.avatar || '/avatars/default.png';
        if (semi1p2Name)
            semi1p2Name.textContent = data.semifinalMatch1.player2.displayName;
        if (semi1p2Avatar)
            semi1p2Avatar.src = data.semifinalMatch1.player2.avatar || '/avatars/default.png';
    }
    if (data.semifinalMatch2) {
        const semi2p1Name = document.getElementById('semi2-p1-name');
        const semi2p1Avatar = document.getElementById('semi2-p1-avatar');
        const semi2p2Name = document.getElementById('semi2-p2-name');
        const semi2p2Avatar = document.getElementById('semi2-p2-avatar');
        if (semi2p1Name)
            semi2p1Name.textContent = data.semifinalMatch2.player1.displayName;
        if (semi2p1Avatar)
            semi2p1Avatar.src = data.semifinalMatch2.player1.avatar || '/avatars/default.png';
        if (semi2p2Name)
            semi2p2Name.textContent = data.semifinalMatch2.player2.displayName;
        if (semi2p2Avatar)
            semi2p2Avatar.src = data.semifinalMatch2.player2.avatar || '/avatars/default.png';
    }
}
// Fonction pour démarrer le compte à rebours du tournoi
function startTournamentCountdown(seconds, onComplete) {
    let remaining = seconds;
    const updateCountdown = () => {
        const timer = document.getElementById('countdown-timer');
        if (timer) {
            timer.textContent = remaining.toString();
        }
    };
    updateCountdown();
    const interval = setInterval(() => {
        remaining--;
        updateCountdown();
        if (remaining <= 0) {
            clearInterval(interval);
            onComplete();
        }
    }, 1000);
}
// Variable globale pour tracker le message temporaire
let currentTemporaryMessage = null;
// Fonction pour afficher un message temporaire simple
function showTemporaryMessage(message) {
    // Supprimer le message existant s'il y en a un
    if (currentTemporaryMessage) {
        currentTemporaryMessage.remove();
        currentTemporaryMessage = null;
    }
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'temporary-message-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    const messageBox = document.createElement('div');
    messageBox.className = 'bg-gray-900 p-8 rounded-lg border border-gray-700 text-center max-w-md mx-4';
    const messageText = document.createElement('h2');
    messageText.className = 'text-2xl font-bold text-white';
    messageText.textContent = message;
    messageBox.appendChild(messageText);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    // Stocker la référence
    currentTemporaryMessage = overlay;
}
// Fonction pour afficher le message de victoire du tournoi
function showTournamentWinnerMessage(winnerName) {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    const messageContainer = document.createElement('div');
    messageContainer.className = 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black p-8 rounded-lg shadow-2xl text-center max-w-lg mx-4 border-4 border-yellow-300';
    const trophy = document.createElement('div');
    trophy.className = 'text-6xl mb-4';
    trophy.textContent = '🏆';
    const title = document.createElement('h2');
    title.className = 'text-3xl font-bold mb-4';
    title.textContent = 'VICTOIRE DU TOURNOI !';
    const winnerText = document.createElement('p');
    winnerText.className = 'text-xl font-semibold mb-6';
    winnerText.textContent = `${winnerName} a gagné le tournoi !`;
    const closeButton = document.createElement('button');
    closeButton.className = 'bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold';
    closeButton.textContent = 'Retour à l\'accueil';
    messageContainer.appendChild(trophy);
    messageContainer.appendChild(title);
    messageContainer.appendChild(winnerText);
    messageContainer.appendChild(closeButton);
    overlay.appendChild(messageContainer);
    document.body.appendChild(overlay);
    // Event listener pour fermer et retourner à l'accueil
    const closeAndGoHome = () => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        showView('home');
    };
    closeButton.addEventListener('click', closeAndGoHome);
    // Permettre de fermer en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeAndGoHome();
        }
    });
    // Fermer automatiquement après 8 secondes
    setTimeout(() => {
        closeAndGoHome();
    }, 8000);
}
// Fonction pour cacher le message temporaire
function hideTemporaryMessage() {
    if (currentTemporaryMessage) {
        if (currentTemporaryMessage.parentNode) {
            currentTemporaryMessage.parentNode.removeChild(currentTemporaryMessage);
        }
        currentTemporaryMessage = null;
    }
}
// Fonction pour réinitialiser les slots du tournoi
function resetTournamentSlots() {
    // Réinitialiser le texte des slots
    for (let i = 1; i <= 4; i++) {
        const slotDiv = document.getElementById(`slot-${i}`);
        if (slotDiv) {
            slotDiv.textContent = `Slot ${i}`;
        }
    }
    // Réactiver et réafficher tous les boutons "Rejoindre"
    document.querySelectorAll('.join-tournament-btn').forEach(btn => {
        const button = btn;
        button.removeAttribute('disabled');
        button.textContent = 'Rejoindre';
        button.style.display = 'block'; // S'assurer que le bouton est visible
    });
    // Masquer les sections de bracket et finale si elles sont visibles
    if (tournamentMatchupPopup) {
        tournamentMatchupPopup.classList.add('hidden');
    }
    if (finalSection) {
        finalSection.classList.add('hidden');
    }
    // Réinitialiser les informations de bracket
    const semifinalsSection = document.querySelector('.text-center:has(h3:contains("Demi-finales"))');
    if (semifinalsSection) {
        semifinalsSection.style.display = 'block';
    }
}
async function renderPublicProfileStats(userId) {
    const statsDiv = document.getElementById('public-profile-stats');
    if (!statsDiv)
        return;
    try {
        const res = await fetch(`/api/matches/history/${userId}`, { credentials: 'include' });
        if (!res.ok) {
            statsDiv.textContent = 'Impossible de charger les statistiques.';
            return;
        }
        const matches = await res.json();
        if (matches.length === 0) {
            statsDiv.textContent = 'Aucune partie jouée pour le moment.';
            return;
        }
        const totalMatches = matches.length;
        const wins = matches.filter((match) => match.isWinner).length;
        const losses = totalMatches - wins;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        const tournamentMatches = matches.filter((match) => match.matchType.startsWith('TOURNAMENT'));
        const normalMatches = matches.filter((match) => match.matchType === 'NORMAL');
        const publicTotalWinsEl = document.getElementById('public-total-wins');
        const publicTotalLossesEl = document.getElementById('public-total-losses');
        const publicWinRateEl = document.getElementById('public-win-rate');
        const publicTotalMatchesEl = document.getElementById('public-total-matches');
        if (publicTotalWinsEl)
            publicTotalWinsEl.textContent = wins.toString();
        if (publicTotalLossesEl)
            publicTotalLossesEl.textContent = losses.toString();
        if (publicWinRateEl)
            publicWinRateEl.textContent = `${winRate}%`;
        if (publicTotalMatchesEl)
            publicTotalMatchesEl.textContent = totalMatches.toString();
        setTimeout(() => {
            if (publicWinLossChart)
                publicWinLossChart.destroy();
            if (publicMatchTypesChart)
                publicMatchTypesChart.destroy();
            const publicWinLossCtx = document.getElementById('publicWinLossChart');
            const publicMatchTypesCtx = document.getElementById('publicMatchTypesChart');
            if (publicWinLossCtx) {
                publicWinLossChart = createWinLossChart(publicWinLossCtx.getContext('2d'), wins, losses);
            }
            if (publicMatchTypesCtx) {
                publicMatchTypesChart = createMatchTypesChart(publicMatchTypesCtx.getContext('2d'), normalMatches.length, tournamentMatches.length);
            }
        }, 100);
    }
    catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        statsDiv.textContent = 'Erreur lors du chargement des statistiques.';
    }
}
async function renderPublicMatchHistory(userId) {
    console.log('renderPublicMatchHistory called with userId:', userId);
    const historyList = document.getElementById('public-profile-history-list');
    if (!historyList) {
        console.error('Element public-profile-history-list not found');
        return;
    }
    try {
        console.log('Fetching public match history for user:', userId);
        const res = await fetch(`/api/matches/history/${userId}`, { credentials: 'include' });
        console.log('Response status:', res.status);
        if (!res.ok) {
            if (res.status === 403) {
                historyList.textContent = 'Vous devez être ami avec cet utilisateur pour voir son historique.';
            }
            else {
                historyList.textContent = 'Erreur lors du chargement de l\'historique.';
            }
            return;
        }
        const matches = await res.json();
        console.log('Matches data:', matches);
        if (matches.length === 0) {
            historyList.textContent = 'Aucune partie jouée pour le moment.';
            return;
        }
        historyList.innerHTML = matches.map((match) => {
            const isWinner = match.isWinner;
            const opponent = match.player1.id === userId ? match.player2 : match.player1;
            const userScore = match.player1.id === userId ? match.player1Score : match.player2Score;
            const opponentScore = match.player1.id === userId ? match.player2Score : match.player1Score;
            let matchTypeLabel = '';
            if (match.matchType === 'TOURNAMENT_SEMI') {
                matchTypeLabel = '<span class="text-yellow-400">Tournoi - Demi-finale</span>';
            }
            else if (match.matchType === 'TOURNAMENT_FINAL') {
                matchTypeLabel = '<span class="text-yellow-400">Tournoi - Finale</span>';
            }
            else {
                matchTypeLabel = '<span class="text-blue-400">Partie normale</span>';
            }
            return `
        <div class="bg-gray-800 p-3 rounded mb-2">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center">
              <span class="font-semibold">vs ${opponent.displayName}    </span>
              <img src="${opponent.avatar || '/avatars/default.png'}" class="w-8 h-8 rounded-full mr-2" alt="Avatar">
            </div>
            <div class="text-lg font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}">
              ${isWinner ? 'VICTOIRE' : 'DÉFAITE'}
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-300">Score: ${userScore} - ${opponentScore}</span>
            <span class="text-gray-400">${new Date(match.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="mt-1">
            ${matchTypeLabel}
          </div>
        </div>
      `;
        }).join('');
        console.log('HTML content set to historyList');
    }
    catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        historyList.textContent = 'Erreur lors du chargement de l\'historique.';
    }
}
if (tournamentSection) {
    tournamentSection.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('join-tournament-btn')) {
            const slot = target.dataset.slot;
            target.textContent = 'En attente...';
            target.setAttribute('disabled', 'true');
            const ws = new WebSocket(`wss://${location.host}/ws/tournament`);
            let gameWs = null;
            let playernumber = null;
            let gameState = null;
            let animationId = null;
            let finished = false;
            let waitingStart = false;
            let player1Name = 'Joueur 1';
            let player2Name = 'Joueur 2';
            ws.onopen = async () => {
                const response = await fetch('/api/me', { credentials: 'include' });
                let userId = null;
                let displayName = 'Joueur';
                if (response.ok) {
                    const userData = await response.json();
                    userId = userData.id;
                    displayName = userData.displayName || 'Joueur';
                }
                ws.send(JSON.stringify({ type: 'join_tournament', slot, userId, displayName }));
            };
            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'update_slots') {
                    const userRes = await fetch('/api/me', { credentials: 'include' });
                    let currentUserId = null;
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        currentUserId = userData.id;
                    }
                    const userIds = data.userIds || [];
                    const userAlreadyJoined = currentUserId ? userIds.includes(currentUserId.toString()) : false;
                    for (let i = 1; i <= 4; i++) {
                        const slotDiv = document.getElementById(`slot-${i}`);
                        const joinBtn = document.querySelector(`[data-slot="${i}"]`);
                        if (slotDiv && joinBtn) {
                            if (data.slots[i - 1]) {
                                slotDiv.textContent = data.slots[i - 1];
                                joinBtn.style.display = 'none';
                            }
                            else {
                                slotDiv.textContent = `Slot ${i}`;
                                if (!userAlreadyJoined) {
                                    joinBtn.style.display = 'block';
                                    joinBtn.textContent = 'Rejoindre';
                                    joinBtn.removeAttribute('disabled');
                                }
                                else {
                                    joinBtn.style.display = 'none';
                                }
                            }
                        }
                    }
                }
                if (data.type === 'match_found') {
                    waitingStart = true;
                    // Afficher la popup de tournoi avec les informations des joueurs
                    if (tournamentMatchupPopup) {
                        // Mise à jour des informations des joueurs pour les demi-finales
                        updateTournamentBracket(data);
                        tournamentMatchupPopup.classList.remove('hidden');
                        // Vérifier si c'est la finale
                        const isFinal = data.matchType === 'TOURNAMENT_FINAL';
                        // Mettre à jour le texte du compte à rebours avec les noms des joueurs
                        if (tournamentCountdown) {
                            const player1Name = data.currentMatch?.player1?.displayName || 'Joueur 1';
                            const player2Name = data.currentMatch?.player2?.displayName || 'Joueur 2';
                            if (isFinal) {
                                tournamentCountdown.innerHTML = `
                  <div class="text-yellow-400 font-bold text-3xl mb-4">
                    🏆 FINALE DU TOURNOI! 🏆
                  </div>
                  <div class="text-white font-bold text-2xl mb-4">
                    ${player1Name} VS ${player2Name}
                  </div>
                  <div class="text-white font-bold text-xl">
                    La finale commence dans <span id="countdown-timer">3</span> secondes...
                  </div>
                `;
                            }
                            else {
                                tournamentCountdown.innerHTML = `
                  <div class="text-blue-400 font-bold text-2xl mb-4">
                    DEMI-FINALE
                  </div>
                  <div class="text-white font-bold text-2xl mb-4">
                    ${player1Name} VS ${player2Name}
                  </div>
                  <div class="text-white font-bold text-xl">
                    Le match commence dans <span id="countdown-timer">3</span> secondes...
                  </div>
                `;
                            }
                        }
                        // Démarrer le compte à rebours
                        startTournamentCountdown(3, () => {
                            // Cacher la popup et commencer le match
                            tournamentMatchupPopup.classList.add('hidden');
                            pongpage?.classList.remove('hidden');
                            tournamentSection.classList.add('hidden');
                            gameSection?.classList.add('hidden');
                            // Verrouiller la navigation pendant le jeu
                            lockNavigation();
                        });
                    }
                    else {
                        pongpage?.classList.remove('hidden');
                        tournamentSection.classList.add('hidden');
                        gameSection?.classList.add('hidden');
                        lockNavigation();
                    }
                }
                if (data.type === 'player_names') {
                    player1Name = data.player1Name;
                    player2Name = data.player2Name;
                }
                if (data.type === 'start_game') {
                    showView('game');
                    pongpage?.classList.remove('hidden');
                    bg_blur?.classList.add('hidden');
                    gameSection.classList.add("hidden");
                    canvas.classList.remove('hidden');
                    playernumber = data.playernumber || 1;
                    startPongGame();
                }
                if (data.type === 'game_state') {
                    gameState = data.state;
                }
                if (data.type === 'loser') {
                    if (finished)
                        return;
                    finished = true;
                    unlockNavigation();
                    // Vérifier si c'est une demi-finale ou la finale
                    const isCurrentFinal = data.matchType === 'TOURNAMENT_FINAL';
                    if (isCurrentFinal) {
                        // Pour la finale, afficher la popup de défaite normale
                        let loserpopup = document.getElementById('loser-popup');
                        if (loserpopup) {
                            loserpopup.classList.remove('hidden');
                            const loserScore = document.getElementById('loser-score');
                            let btnfermer = document.getElementById('fermer-loser');
                            if (loserScore) {
                                loserScore.textContent = `${data.score1} - ${data.score2}`;
                            }
                            if (btnfermer) {
                                btnfermer.addEventListener('click', () => {
                                    loserpopup.classList.add('hidden');
                                    showView('home');
                                });
                            }
                        }
                    }
                    else {
                        // Pour les demi-finales perdants, garder le popup loser
                        let loserpopup = document.getElementById('loser-popup');
                        if (loserpopup) {
                            loserpopup.classList.remove('hidden');
                            const loserScore = document.getElementById('loser-score');
                            let btnfermer = document.getElementById('fermer-loser');
                            if (loserScore) {
                                loserScore.textContent = `${data.score1} - ${data.score2}`;
                            }
                            if (btnfermer) {
                                btnfermer.addEventListener('click', () => {
                                    loserpopup.classList.add('hidden');
                                    showView('tournament');
                                });
                            }
                        }
                    }
                    if (animationId)
                        cancelAnimationFrame(animationId);
                    return;
                }
                if (data.type === 'winner') {
                    if (finished)
                        return;
                    finished = true;
                    unlockNavigation();
                    // Vérifier si c'est une demi-finale ou la finale
                    const isCurrentFinal = data.matchType === 'TOURNAMENT_FINAL';
                    if (isCurrentFinal) {
                        // Pour la finale, afficher la popup de victoire normale
                        let winnerpopup = document.getElementById('winner-popup');
                        let btnfermer = document.getElementById('fermer');
                        if (winnerpopup) {
                            winnerpopup.classList.remove('hidden');
                            const winnerScore = document.getElementById('winner-score');
                            if (winnerScore) {
                                winnerScore.textContent = `${data.score1} - ${data.score2}`;
                            }
                            if (btnfermer) {
                                btnfermer.addEventListener('click', () => {
                                    winnerpopup.classList.add('hidden');
                                    showView('home');
                                });
                            }
                        }
                    }
                    else {
                        // Pour les demi-finales gagnants, afficher un message simple
                        showTemporaryMessage('Bien joué ! Vous avez gagné, veuillez attendre la finale');
                    }
                    if (animationId)
                        cancelAnimationFrame(animationId);
                    return;
                }
                if (data.type === 'tournament_winner') {
                    unlockNavigation();
                    // Afficher le message personnalisé au lieu de l'alert
                    showTournamentWinnerMessage(data.displayName);
                    // Réinitialiser complètement les slots du tournoi
                    resetTournamentSlots();
                }
                if (data.type === 'tournament_bracket') {
                    // Mettre à jour l'affichage du bracket avec les vrais noms des joueurs
                    console.log('Réception du bracket:', data.bracket);
                    // Mettre à jour les demi-finales
                    if (data.bracket.semifinals) {
                        // Demi-finale 1
                        const semi1p1Name = document.getElementById('semi1-p1-name');
                        const semi1p2Name = document.getElementById('semi1-p2-name');
                        if (semi1p1Name && data.bracket.semifinals[0]) {
                            semi1p1Name.textContent = data.bracket.semifinals[0].player1;
                            semi1p1Name.className = 'text-white font-bold text-lg';
                        }
                        if (semi1p2Name && data.bracket.semifinals[0]) {
                            semi1p2Name.textContent = data.bracket.semifinals[0].player2;
                            semi1p2Name.className = 'text-white font-bold text-lg';
                        }
                        // Demi-finale 2
                        const semi2p1Name = document.getElementById('semi2-p1-name');
                        const semi2p2Name = document.getElementById('semi2-p2-name');
                        if (semi2p1Name && data.bracket.semifinals[1]) {
                            semi2p1Name.textContent = data.bracket.semifinals[1].player1;
                            semi2p1Name.className = 'text-white font-bold text-lg';
                        }
                        if (semi2p2Name && data.bracket.semifinals[1]) {
                            semi2p2Name.textContent = data.bracket.semifinals[1].player2;
                            semi2p2Name.className = 'text-white font-bold text-lg';
                        }
                    }
                    // Mettre à jour la finale si disponible
                    if (data.bracket.final && data.bracket.final.player1 && data.bracket.final.player2) {
                        const finalp1Name = document.getElementById('final-p1-name');
                        const finalp2Name = document.getElementById('final-p2-name');
                        if (finalp1Name) {
                            finalp1Name.textContent = data.bracket.final.player1;
                            finalp1Name.className = 'text-white font-bold text-lg';
                        }
                        if (finalp2Name) {
                            finalp2Name.textContent = data.bracket.final.player2;
                            finalp2Name.className = 'text-white font-bold text-lg';
                        }
                        // Afficher la section finale
                        if (finalSection) {
                            finalSection.classList.remove('hidden');
                        }
                    }
                }
                if (data.type === 'match_found') {
                    // Cacher le message temporaire quand un match commence (finale ou autre)
                    hideTemporaryMessage();
                    let blurm_bg = document.getElementById('blurm-bg');
                    if (blurm_bg) {
                        blurm_bg.classList.add('hidden');
                    }
                    canvas.classList.remove('hidden');
                    pongPlayers?.classList.remove('hidden');
                    playernumber = data.playernumber;
                    // Verrouiller la navigation pendant le tournoi
                    lockNavigation();
                    updateTournamentBracket(data);
                    startTournamentCountdown(3, () => {
                        startPongGame();
                    });
                }
                ws.onclose = () => {
                    target.textContent = 'Rejoindre';
                    target.removeAttribute('disabled');
                };
                function startPongGame() {
                    if (!canvas)
                        return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx)
                        return;
                    let paddleY = 150;
                    const paddleH = 80;
                    const paddleW = 10;
                    const height = 400;
                    const width = 800;
                    function draw() {
                        if (!gameState || !ctx)
                            return;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#222';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.strokeStyle = '#fff';
                        ctx.beginPath();
                        ctx.setLineDash([10, 10]);
                        ctx.moveTo(canvas.width / 2, 0);
                        ctx.lineTo(canvas.width / 2, canvas.height);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(20, gameState.paddle1.y, paddleW, paddleH);
                        ctx.fillRect(canvas.width - 30, gameState.paddle2.y, paddleW, paddleH);
                        ctx.beginPath();
                        ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.font = '18px Arial';
                        ctx.fillStyle = '#fff';
                        ctx.fillText(player1Name, 20, 20);
                        ctx.fillText(player2Name, canvas.width - ctx.measureText(player2Name).width - 30, 20);
                        ctx.font = '32px Arial';
                        ctx.fillText(gameState.score1, canvas.width / 2 - 50, 40);
                        ctx.fillText(gameState.score2, canvas.width / 2 + 30, 40);
                    }
                    function gameLoop() {
                        draw();
                        animationId = requestAnimationFrame(gameLoop);
                    }
                    gameLoop();
                    function onKey(e) {
                        if (!playernumber)
                            return;
                        let changed = false;
                        if (playernumber === 1) {
                            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                                paddleY -= 10;
                                changed = true;
                            }
                            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                                paddleY += 10;
                                changed = true;
                            }
                        }
                        else if (playernumber === 2) {
                            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                                paddleY -= 10;
                                changed = true;
                            }
                            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                                paddleY += 10;
                                changed = true;
                            }
                        }
                        paddleY = Math.max(0, Math.min(canvas.height - paddleH, paddleY));
                        if (changed) {
                            ws.send(JSON.stringify({ type: 'paddle_move', y: paddleY }));
                        }
                    }
                    window.addEventListener('keydown', onKey);
                }
            }; // Fermeture du ws.onmessage
        }
        if (target.id === 'close-tournament-btn') {
            tournamentSection.classList.add('hidden');
            showView('home');
        }
    });
}
async function renderFriendsList() {
    const container = document.getElementById('friends-list');
    if (!container)
        return;
    container.innerHTML = 'Chargement...';
    const res = await fetch('/api/friends', { credentials: 'include' });
    if (!res.ok) {
        container.innerHTML = 'Erreur lors du chargement des amis.';
        return;
    }
    const friends = await res.json();
    if (!friends.length) {
        container.innerHTML = '<div>Aucun ami pour le moment.</div>';
        return;
    }
    container.innerHTML = friends.map((f) => `
    <div class="flex items-center mb-2 friend-item" data-id="${f.id}" style="cursor:pointer;">
      <img src="${f.avatar || '/avatars/default.png'}" alt="Avatar" class="w-8 h-8 rounded-full mr-2">
      <span>${f.displayName}</span>
      <button class="ml-auto text-red-500 remove-friend-btn" data-id="${f.id}">Retirer</button>
    </div>
  `).join('');
    container.querySelectorAll('.remove-friend-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            if (id) {
                await fetch(`/api/friends/${id}`, { method: 'DELETE', credentials: 'include' });
                renderFriendsList();
            }
        });
    });
    container.querySelectorAll('.friend-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            const id = item.getAttribute('data-id');
            if (id) {
                const friend = friends.find((f) => f.id == id);
                if (friend && friend.displayName) {
                    const res = await fetch(`/api/user/${encodeURIComponent(friend.displayName)}`, {
                        credentials: 'include'
                    });
                    if (res.ok) {
                        const user = await res.json();
                        showView('public-profile', true, user);
                    }
                }
            }
        });
    });
}
async function openTwoFAModal(opts, onConfirm) {
    if (!twofaModal || !twofaQR || !twofaCode || !twofaConfirm || !twofaCancel)
        return false;
    twofaTitle && (twofaTitle.textContent = opts.title || (opts.mode === 'setup' ? 'Configurer la 2FA' : 'Validation 2FA'));
    twofaDesc && (twofaDesc.textContent = opts.desc || (opts.mode === 'setup'
        ? 'Scannez le QR code puis entrez le code à 6 chiffres.'
        : 'Entrez le code à 6 chiffres de votre application Authenticator.'));
    twofaCode.value = '';
    twofaQR.src = '';
    if (twofaQRWrap)
        twofaQRWrap.style.display = opts.mode === 'setup' ? '' : 'none';
    if (opts.mode === 'setup') {
        const r = await fetch('/api/2fa/enable', { method: 'POST', credentials: 'include' });
        if (!r.ok) {
            alert('Impossible de démarrer la configuration 2FA');
            return false;
        }
        const { qrDataUrl } = await r.json();
        twofaQR.src = qrDataUrl;
    }
    twofaModal.classList.remove('hidden');
    setTimeout(() => twofaCode?.focus(), 50);
    const closeModal = () => twofaModal.classList.add('hidden');
    const onCancel = () => closeModal();
    const onSubmit = async () => {
        const code = twofaCode.value.trim();
        if (!/^[0-9]{6}$/.test(code)) {
            alert('Code invalide');
            return false;
        }
        const ok = await onConfirm(code);
        if (ok)
            closeModal();
        return ok;
    };
    let cleanup;
    return await new Promise((resolve) => {
        const handlerCancel = () => {
            cleanup();
            closeModal();
            resolve(false);
        };
        const handlerConfirm = async () => {
            const ok = await onSubmit();
            if (ok) {
                cleanup();
                resolve(true);
            }
        };
        cleanup = () => {
            twofaCancel.removeEventListener('click', handlerCancel);
            twofaConfirm.removeEventListener('click', handlerConfirm);
        };
        twofaCancel.addEventListener('click', handlerCancel);
        twofaConfirm.addEventListener('click', handlerConfirm);
    });
}
window.startTwoFASetup = async function () {
    await openTwoFAModal({ mode: 'setup' }, async (code) => {
        const r = await fetch('/api/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code })
        });
        if (!r.ok) {
            alert('Code invalide');
            return false;
        }
        alert('2FA activée !');
        return true;
    });
};
async function exportMe() {
    const r = await fetch('/api/me/export', { credentials: 'include' });
    const data = await r.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-data.json';
    a.click();
}
async function anonymizeMe() {
    const r = await fetch('/api/me/anonymize', { method: 'POST', credentials: 'include' });
    alert(r.ok ? 'Anonymized' : 'Failed');
}
async function deleteMe() {
    if (!confirm('Êtes-vous sûr(e) ? Cette action supprimera définitivement votre compte.'))
        return false;
    const r = await fetch('/api/me', { method: 'DELETE', credentials: 'include' });
    if (r.ok) {
        alert('Compte supprimé avec succès');
        return true;
    }
    else {
        alert('Erreur lors de la suppression du compte');
        return false;
    }
}
async function renderFriendRequests() {
    const container = document.getElementById('friend-requests-list');
    if (!container)
        return;
    container.innerHTML = 'Chargement...';
    const res = await fetch('/api/friends/requests', { credentials: 'include' });
    if (!res.ok) {
        container.innerHTML = 'Erreur lors du chargement des demandes.';
        return;
    }
    const requests = await res.json();
    if (!requests.length) {
        container.innerHTML = '<div>Aucune demande en attente.</div>';
        return;
    }
    container.innerHTML = requests.map((u) => `
  <div class="flex items-center mb-2">
    <img src="${u.avatar || '/avatars/default.png'}" alt="Avatar" class="w-8 h-8 rounded-full mr-2">
    <span>${u.displayName}</span>
    <button class="ml-auto bg-green-500 text-white px-2 py-1 rounded accept-friend-btn" data-id="${u.friendRequestId}">Accepter</button>
  </div>
`).join('');
    container.querySelectorAll('.accept-friend-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (id) {
                await fetch(`/api/friends/${id}/accept`, { method: 'POST', credentials: 'include' });
                renderFriendRequests();
                renderFriendsList();
            }
        });
    });
}
if (publicProfileSection) {
    publicProfileSection.addEventListener('click', async (e) => {
        const target = e.target;
        if (target && target.id === 'add-friend-btn' && target.dataset.userid) {
            const res = await fetch(`/api/friends/${target.dataset.userid}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                alert('Ami ajouté !');
                target.classList.add('hidden');
                target.removeAttribute('data-userid');
                if (!profileSection.classList.contains('hidden')) {
                    renderFriendsList();
                }
            }
            else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de l\'ajout');
            }
        }
    });
}
function addLogoutButton() {
    if (!document.getElementById('logout-btn')) {
        const btn = document.getElementById('logout-btn');
        if (!btn) {
            return;
        }
        if (homeSection)
            homeSection.appendChild(btn);
        if (profileSection)
            profileSection.appendChild(btn.cloneNode(true));
    }
    document.querySelectorAll('#logout-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                localStorage.clear();
                await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                showView('login');
                console.log('Déconnexion réussie');
            }
            catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                localStorage.clear();
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                showView('login');
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
async function initializeApp() {
    try {
        const userId = localStorage.getItem('userId');
        let isAuthenticated = false;
        let userData = null;
        try {
            const meRes = await fetch('/api/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (meRes.ok) {
                userData = await meRes.json();
                if (userData && userData.id && userData.email) {
                    isAuthenticated = true;
                    localStorage.setItem('userId', userData.id.toString());
                }
                else {
                    console.warn('Données utilisateur invalides reçues du serveur');
                    isAuthenticated = false;
                }
            }
            else if (meRes.status === 401) {
                localStorage.clear();
                isAuthenticated = false;
            }
            else {
                console.warn('Erreur inattendue lors de la vérification auth:', meRes.status);
                isAuthenticated = false;
            }
        }
        catch (networkError) {
            console.warn('Erreur réseau lors de la vérification auth:', networkError);
            isAuthenticated = false;
        }
        if (userId && !isAuthenticated) {
            console.log('Nettoyage des données de session expirées');
            localStorage.clear();
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        let targetView = 'login';
        let shouldUpdateUrl = false;
        if (isAuthenticated && userData) {
            console.log('Utilisateur authentifié:', userData.displayName);
            if (location.pathname === '/register') {
                targetView = 'home';
                shouldUpdateUrl = true;
            }
            else if (location.pathname === '/home')
                targetView = 'home';
            else if (location.pathname === '/game')
                targetView = 'game';
            else if (location.pathname === '/profile')
                targetView = 'profile';
            else if (location.pathname === '/tournament')
                targetView = 'tournament';
            else if (location.pathname === '/' || location.pathname === '') {
                targetView = 'home';
                shouldUpdateUrl = true;
            }
            else {
                targetView = 'home';
                shouldUpdateUrl = true;
            }
        }
        else {
            console.log('Utilisateur non authentifié, redirection vers login');
            if (location.pathname === '/register') {
                targetView = 'register';
            }
            else if (location.pathname === '/' || location.pathname === '') {
                targetView = 'login';
            }
            else {
                targetView = 'login';
                shouldUpdateUrl = true;
            }
        }
        initializeEventListeners();
        // Gestionnaire pour la popup de tournoi
        if (tournamentMatchupPopup) {
            tournamentMatchupPopup.addEventListener('click', (e) => {
                // Fermer la popup si on clique sur l'arrière-plan (mais pas pendant un compte à rebours actif)
                if (e.target === tournamentMatchupPopup && !document.getElementById('countdown-timer')) {
                    tournamentMatchupPopup.classList.add('hidden');
                }
            });
        }
        if (shouldUpdateUrl) {
            const newUrl = targetView === 'login' ? '/' : `/${targetView}`;
            history.replaceState({ view: targetView }, '', newUrl);
        }
        showView(targetView, false);
    }
    catch (error) {
        console.error('Erreur critique lors de l\'initialisation:', error);
        localStorage.clear();
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        initializeEventListeners();
        showView('login', false);
    }
}
function initializeCanvas() {
    const canvashome = document.getElementById("home-canvas");
    if (!canvashome) {
        console.warn("Canvas home-canvas non trouvé, probablement pas sur la page d'accueil");
        return null;
    }
    const canHome = canvashome.getContext("2d");
    if (!canHome) {
        console.error("Impossible de récupérer le contexte du canvas");
        return null;
    }
    return { canvashome, canHome };
}
function drawHomePong() {
    const canvasData = initializeCanvas();
    if (!canvasData)
        return;
    const { canvashome, canHome } = canvasData;
    canHome.clearRect(0, 0, canvashome.width, canvashome.height);
    canHome.save();
    canHome.strokeStyle = "white";
    canHome.setLineDash([10, 10]);
    canHome.beginPath();
    canHome.moveTo(canvashome.width / 2, 0);
    canHome.lineTo(canvashome.width / 2, canvashome.height);
    canHome.stroke();
    canHome.setLineDash([]);
    canHome.restore();
    canHome.fillStyle = "white";
    canHome.fillRect(20, 80, 10, 60);
    canHome.fillRect(canvashome.width - 30, 10, 10, 60);
    canHome.beginPath();
    canHome.arc(100, 100, 6, 0, Math.PI * 2);
    canHome.fillStyle = "white";
    canHome.fill();
}
export {};
