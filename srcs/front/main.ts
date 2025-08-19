export {}

const loginForm = document.getElementById('login-form') as HTMLFormElement;
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const regEnable2FA = document.getElementById('reg-enable-2fa') as HTMLInputElement | null;
// 2FA modal elements (shared for registration & login)
const twofaModal = document.getElementById('twofa-modal') as HTMLDivElement | null;
const twofaTitle = document.getElementById('twofa-title') as HTMLHeadingElement | null;
const twofaDesc = document.getElementById('twofa-desc') as HTMLParagraphElement | null;
const twofaQR = document.getElementById('twofa-qr') as HTMLImageElement | null;
const twofaQRWrap = document.getElementById('twofa-qr-wrap') as HTMLDivElement | null;
const twofaCode = document.getElementById('twofa-code') as HTMLInputElement | null;
const twofaCancel = document.getElementById('twofa-cancel') as HTMLButtonElement | null;
const twofaConfirm = document.getElementById('twofa-confirm') as HTMLButtonElement | null;
const showRegisterBtn = document.getElementById('show-register') as HTMLButtonElement;
const homeSection = document.getElementById('home-section') as HTMLDivElement;
const gameSection = document.getElementById('game-section') as HTMLDivElement;
const profileSection = document.getElementById('profile-section') as HTMLDivElement;
const goGameBtn = document.getElementById('go-game') as HTMLButtonElement | null;
const backHomeBtn = document.getElementById('accueil') as HTMLButtonElement | null;
const goProfileBtn = document.getElementById('go-profile') as HTMLButtonElement | null;
const backHomeProfileBtn = document.getElementById('back-home-profile') as HTMLButtonElement | null;
const profileForm = document.getElementById('profile-form') as HTMLFormElement | null;
const profileEmail = document.getElementById('profile-email') as HTMLInputElement | null;
const profileDisplayName = document.getElementById('profile-displayName') as HTMLInputElement | null;
const profileAvatar = document.getElementById('profile-avatar') as HTMLInputElement | null;
const profileAvatarImg = document.getElementById('profile-avatar-img') as HTMLImageElement | null;
const regAvatar = document.getElementById('reg-avatar') as HTMLInputElement | null;
const searchUserInput = document.getElementById('search-user-input') as HTMLInputElement | null;
const searchUserBtn = document.getElementById('search-user-btn') as HTMLButtonElement | null;
const searchUserResult = document.getElementById('search-user-result') as HTMLDivElement | null;
const publicProfileSection = document.getElementById('public-profile-section') as HTMLDivElement | null;
const publicProfileAvatarImg = document.getElementById('public-profile-avatar-img') as HTMLImageElement | null;
const publicProfileEmail = document.getElementById('public-profile-email') as HTMLSpanElement | null;
const publicProfileDisplayName = document.getElementById('public-profile-displayName') as HTMLSpanElement | null;
const backProfileBtn = document.getElementById('back-profile-btn') as HTMLButtonElement | null;
const addFriendBtn = document.getElementById('add-friend-btn') as HTMLButtonElement | null;
const log_page = document.getElementById('c-page') as HTMLDivElement | null;
const page_acc = document.getElementById('page-accueil') as HTMLDivElement | null;
const canvas = document.getElementById('pong') as HTMLCanvasElement;
const pongpage = document.getElementById('pong-game') as HTMLDivElement | null;
const bg_blur = document.getElementById('blur-bg') as HTMLDivElement | null;
const profileHistory = document.getElementById('profile-history') as HTMLDivElement | null;
const tournamentSection = document.getElementById('tournament-section') as HTMLDivElement | null;
const pongPlayers = document.getElementById('pong-players') as HTMLDivElement | null;
const tournoisBtn = document.getElementById('tournois-button') as HTMLButtonElement | null;
const localGameBtn = document.getElementById('local-game-button') as HTMLButtonElement | null;

let pingInterval: number | undefined;
let currentPublicUserId: number | null = null;

// Variable pour tracker si on est en jeu
let isGameActive = false;

// Variables globales pour les graphiques
let winLossChart: any = null;
let matchTypesChart: any = null;
let publicWinLossChart: any = null;
let publicMatchTypesChart: any = null;

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
  
  // Retirer les listeners de prévention
  window.removeEventListener('beforeunload', preventNavigation);
  window.removeEventListener('popstate', preventBackNavigation);
}

// Fonction pour empêcher la fermeture de la page pendant le jeu
function preventNavigation(e: BeforeUnloadEvent) {
  if (isGameActive) {
    e.preventDefault();
    e.returnValue = 'Une partie est en cours. Êtes-vous sûr de vouloir quitter ?';
    return 'Une partie est en cours. Êtes-vous sûr de vouloir quitter ?';
  }
}

// Fonction pour empêcher la navigation arrière pendant le jeu
function preventBackNavigation(e: PopStateEvent) {
  if (isGameActive) {
    e.preventDefault();
    alert('Vous ne pouvez pas naviguer pendant une partie en cours !');
    // Remettre l'état actuel dans l'historique
    history.pushState({ view: 'game' }, '', '/game');
  }
}

pingInterval = window.setInterval(async () => {
  try {
    await fetch('/api/ping', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Ping failed:', error);
  }
}, 10_000);

  if (tournoisBtn && tournamentSection) {
  tournoisBtn.addEventListener('click', () => {
    showView('tournament');
  });
}

function createWinLossChart(ctx: any, wins: number, losses: number) {
  return new (window as any).Chart(ctx, {
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

function createMatchTypesChart(ctx: any, normalMatches: number, tournamentMatches: number) {
  return new (window as any).Chart(ctx, {
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

function showView(view: 'login' | 'register' | 'home' | 'game' | 'profile' | 'public-profile' | 'tournament', push = true, publicUser?: any) {
  // Débloquer la navigation quand on change de vue (sauf si on va vers 'game')
  if (view !== 'game') {
    unlockNavigation();
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

  if (page_acc) page_acc.classList.add('hidden');
  if (log_page) log_page.classList.add('hidden');
  if (view === 'login') {
    log_page?.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    showRegisterBtn.classList.remove('hidden');
  } else if (view === 'register') {
    log_page?.classList.remove('hidden');
    registerForm.classList.remove('hidden');
    showRegisterBtn.classList.add('hidden');
  } else if (view === 'home') {
    page_acc?.classList.remove('hidden');
    homeSection.classList.remove('hidden');
    showRegisterBtn.classList.add('hidden');
    log_page?.classList.add('hidden');
    drawHomePong();
    fetch('/api/me', { credentials: 'include' })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((user) => {
        const avatarImg = document.getElementById('user-avatar') as HTMLImageElement;
        if (avatarImg) {
          const src = user?.avatar ? user.avatar : '/avatars/default.png';
          avatarImg.src = src + '?t=' + Date.now();
        }
        const displayNameSpan = document.getElementById('user-displayName') as HTMLSpanElement;
        if (displayNameSpan) {
          displayNameSpan.textContent = user?.displayName || 'Inconnu';
        }
      })
      .catch(() => {
        const displayNameSpan = document.getElementById('user-displayName') as HTMLSpanElement;
        if (displayNameSpan) displayNameSpan.textContent = 'Inconnu';
      });
    addLogoutButton();
  } else if (view === 'game') {
    let vs_player = document.getElementById('vs-player') as HTMLButtonElement | null;

    homeSection.classList.remove('hidden');
    gameSection.classList.remove('hidden');
    showRegisterBtn.classList.add('hidden');
    vs_player?.addEventListener('click', () => 
    {
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
      let blurm_bg = document.getElementById('blurm-bg') as HTMLDivElement;

      if (pongpage) {
        const existingButtons = pongpage.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
      }

      const startMatchmakingBtn = document.createElement('button');
      startMatchmakingBtn.textContent = 'Commencer le matchmaking';
      startMatchmakingBtn.classList.add(
        'bg-gray-900', 'text-white', 'px-4', 'py-2', 'rounded', 'border', 'border-gray-700', 'hover:bg-gray-800',
        'absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2'
      );
      pongpage?.appendChild(startMatchmakingBtn);
      startMatchmakingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (blurm_bg) {
          blurm_bg.classList.remove('hidden');
        }
        let ws: WebSocket;
        let playernumber: number | null = null;
        let gameState: any = null;
        let animationId: number | null = null;
        let finished: boolean = false;
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
            lockNavigation(); // Bloquer la navigation pendant le match en ligne
            fetch('/api/me', { credentials: 'include' })
              .then(async (res) => (res.ok ? res.json() : null))
              .then((user) => {
                const avatarId = playernumber === 1 ? 'playerL-avatar' : 'playerR-avatar';
                const nameId = playernumber === 1 ? 'playerL-name' : 'playerR-name';
                const avatarElement = document.getElementById(avatarId) as HTMLImageElement;
                const nameElement = document.getElementById(nameId) as HTMLSpanElement;
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
                const avatarElement = document.getElementById(avatarId) as HTMLImageElement;
                const nameElement = document.getElementById(nameId) as HTMLSpanElement;
                if (avatarElement && user) {
                  avatarElement.src = (user.avatar || '/avatars/default.png') + '?t=' + Date.now();
                  nameElement.textContent = user.displayName || 'Joueur';
                }
              });
            startPongGame();
          } else if (data.type === 'game_state') {
            gameState = data.state;
          } else if (data.type === 'opponent_left') {
            alert('Ton adversaire a quitté la partie.');
            if (animationId) cancelAnimationFrame(animationId);
            unlockNavigation(); // Débloquer la navigation
            showView('home');
          }
          else if (data.type === 'loser') {
            if (finished) return;
            finished = true;
            let loserpopup = document.getElementById('loser-popup') as HTMLDivElement;
            if (loserpopup) {
              loserpopup.classList.remove('hidden');
              const loserScore = document.getElementById('loser-score') as HTMLSpanElement;
              let btnfermer = document.getElementById('fermer-loser') as HTMLButtonElement;
              if (loserScore) {
                loserScore.textContent = `${data.score1} - ${data.score2}`;
              }
              if (btnfermer) {
                btnfermer.addEventListener('click', () => {
                  loserpopup.classList.add('hidden');
                  unlockNavigation(); // Débloquer la navigation
                  showView('game');
                });
              }
            }
            if (animationId) cancelAnimationFrame(animationId);
            return;
          }
          else if (data.type === 'winner') {
            if (finished) return;
            finished = true;
            let winnerpopup = document.getElementById('winner-popup') as HTMLDivElement;
            let btnfermer = document.getElementById('fermer') as HTMLButtonElement;
            if (winnerpopup) {
              winnerpopup.classList.remove('hidden');
              const winnerScore = document.getElementById('winner-score') as HTMLSpanElement;
              if (winnerScore) {
                winnerScore.textContent = `${data.score1} - ${data.score2}`;
              }
              if (btnfermer) {
                btnfermer.addEventListener('click', () => {
                  winnerpopup.classList.add('hidden');
                  unlockNavigation(); // Débloquer la navigation
                  showView('game');
                });
              }
            }
            if (animationId) cancelAnimationFrame(animationId);
            return;
          }
        };
        ws.onclose = () => {
          if (animationId) cancelAnimationFrame(animationId);
          unlockNavigation(); // Débloquer la navigation en cas de déconnexion
        };

        function startPongGame() {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 800;
          canvas.height = 400;

          let paddleY = 150;
          const paddleH = 80;
          const paddleW = 10;
          const height = 400;
          const width = 800;
          function draw() {
            if (!gameState || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.setLineDash([10, 10]);
            ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#fff';
            ctx.fillRect(20, gameState.paddle1.y, paddleW, paddleH);
            ctx.fillRect(canvas.width-30, gameState.paddle2.y, paddleW, paddleH);
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, 2*Math.PI);
            ctx.fill();
            ctx.font = '18px Arial';
            ctx.fillStyle = '#fff';
            ctx.font = '32px Arial';
            ctx.fillText(gameState.score1, canvas.width/2-50, 40);
            ctx.fillText(gameState.score2, canvas.width/2+30, 40);
          }
          function gameLoop() {
            draw();
            animationId = requestAnimationFrame(gameLoop);
          }
          gameLoop();
          function onKey(e: KeyboardEvent) {
            if (!playernumber) return;
            let changed = false;
            const paddleSpeed = 18;
            if (playernumber === 1) {
              if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { paddleY -= 10; changed = true; }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { paddleY += 10; changed = true; }
              } else if (playernumber === 2) {
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { paddleY -= 10; changed = true; }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { paddleY += 10; changed = true; }
              }
            paddleY = Math.max(0, Math.min(canvas.height-paddleH, paddleY));
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

      // Nettoyer les boutons existants avant d'ajouter le nouveau
      if (pongpage) {
        const existingButtons = pongpage.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
      }

      const startLocalGameBtn = document.createElement('button');
      startLocalGameBtn.textContent = 'Commencer le jeu local';
      startLocalGameBtn.classList.add(
        'bg-gray-900', 'text-white', 'px-4', 'py-2', 'rounded', 'border', 'border-gray-700', 'hover:bg-gray-800',
        'absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2'
      );
      pongpage?.appendChild(startLocalGameBtn);
      
      startLocalGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let ws: WebSocket;
        let gameState: any = null;
        let animationId: number | null = null;
        let finished: boolean = false;

        // Use WSS via Nginx reverse proxy
        ws = new WebSocket(`wss://${location.host}/ws/pong`);
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'join_local' }));
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'local_game_started') {
            canvas.classList.remove('hidden');
            lockNavigation(); // Bloquer la navigation pendant le jeu local
            startLocalPongGame();
          } else if (data.type === 'game_state') {
            gameState = data.state;
          } else if (data.type === 'game_over') {
            if (finished) return;
            finished = true;
            unlockNavigation(); // Débloquer la navigation
            alert(`Fin de partie ! Score final: ${data.score1} - ${data.score2}. Gagnant: ${data.winner}`);
            showView('game');
          }
        };

        function startLocalPongGame() {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          let paddle1Y = 150;
          let paddle2Y = 150;
          const paddleH = 80;
          const paddleW = 10;
          const paddleSpeed = 18;
          const height = 400;
          const width = 800;
          
          function draw() {
            if (!gameState || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.setLineDash([10, 10]);
            ctx.moveTo(canvas.width/2, 0); 
            ctx.lineTo(canvas.width/2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#fff';
            ctx.fillRect(20, gameState.paddle1.y, paddleW, paddleH);
            ctx.fillRect(canvas.width-30, gameState.paddle2.y, paddleW, paddleH);
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, 2*Math.PI);
            ctx.fill();
            ctx.font = '32px Arial';
            ctx.fillText(gameState.score1, canvas.width/2-50, 40);
            ctx.fillText(gameState.score2, canvas.width/2+30, 40);

            ctx.font = '14px Arial';
            // ctx.fillText('Joueur 1: W/S', 20, height - 20);
            // ctx.fillText('Joueur 2: ↑/↓', width - 120, height - 20);
          }
          
          function gameLoop() {
            draw();
            animationId = requestAnimationFrame(gameLoop);
          }
          gameLoop();
          
          function onKey(e: KeyboardEvent) {
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

  } else if (view === 'profile') {
    bg_blur?.classList.remove('hidden');
    homeSection.classList.remove('hidden');
    profileSection.classList.remove('hidden');
    showRegisterBtn.classList.add('hidden');
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
      renderFriendsList();
      renderFriendRequests();
      addLogoutButton();
      const historyPanel = document.getElementById('profile-history-panel');
      if (historyPanel && !historyPanel.classList.contains('hidden')) {
        renderMatchHistory();
      }
      setTimeout(() => {
        renderMatchHistory();
      }, 100);
    });
  } else if (view === 'public-profile' && publicUser) {
    currentPublicUserId = publicUser.id; // Stocker l'ID pour utilisation ultérieure
    homeSection.classList.remove('hidden');
    bg_blur?.classList.remove('hidden');
    if (publicProfileSection) publicProfileSection.classList.remove('hidden');
    if (publicProfileAvatarImg) publicProfileAvatarImg.src = (publicUser.avatar || '/avatars/default.png') + '?t=' + Date.now();
    if (publicProfileEmail) publicProfileEmail.textContent = publicUser.email;
    if (publicProfileDisplayName) publicProfileDisplayName.textContent = publicUser.displayName;

    const publicTabInfo = document.getElementById('public-profile-tab-info');
    const publicTabHistory = document.getElementById('public-profile-tab-history');
    const publicInfoPanel = document.getElementById('public-profile-info-panel');
    const publicHistoryPanel = document.getElementById('public-profile-history-panel');
    
    if (publicTabInfo && publicTabHistory && publicInfoPanel && publicHistoryPanel) {
      publicTabInfo.classList.add('bg-blue-600');
      publicTabHistory.classList.remove('bg-blue-600');
      publicTabHistory.classList.add('bg-gray-800');
      publicInfoPanel.classList.remove('hidden');
      publicHistoryPanel.classList.add('hidden');
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

    renderPublicProfileStats(publicUser.id);
    // Charger l'historique dès l'affichage du profil public
    renderPublicMatchHistory(publicUser.id);

    fetch('/api/me', { credentials: 'include' })
      .then(async (res) => (res.ok ? res.json() : null))
      .then(async me => {
        if (addFriendBtn) {
          if (me && me.displayName && publicUser.displayName && me.displayName !== publicUser.displayName) {
            const friendsRes = await fetch('/api/friends', { credentials: 'include' });
            if (friendsRes.ok) {
              const friends = await friendsRes.json();
              const isAlreadyFriend = friends.some((friend: any) => friend.id === publicUser.id);
              
              if (isAlreadyFriend) {
                addFriendBtn.classList.add('hidden');
                addFriendBtn.removeAttribute('data-userid');
              } else {
                addFriendBtn.classList.remove('hidden');
                addFriendBtn.setAttribute('data-userid', publicUser.id);
              }
            } else {
              addFriendBtn.classList.remove('hidden');
              addFriendBtn.setAttribute('data-userid', publicUser.id);
            }
          } else {
            addFriendBtn.classList.add('hidden');
            addFriendBtn.removeAttribute('data-userid');
          }
        }
      });
  } else {
    currentPublicUserId = null; // Réinitialiser l'ID quand on quitte le profil public
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
  } else {
    if (!pingInterval) {
      pingInterval = setInterval(async () => {
        try {
          await fetch('/api/ping', {
            method: 'POST',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Ping failed:', error);
        }
      }, 10_000) as unknown as number;
    }
  }

  if (view === 'tournament') {
    homeSection.classList.remove('hidden');
    tournamentSection?.classList.remove('hidden');
    resetTournamentDisplay(); // Réinitialiser l'affichage du tournoi
    for (let i = 1; i <= 4; i++) {
      const slotDiv = document.getElementById(`slot-${i}`);
      if (slotDiv) slotDiv.textContent = `Slot ${i}`;
    }
    document.querySelectorAll('.join-tournament-btn').forEach(btn => {
      btn.removeAttribute('disabled');
      btn.textContent = 'Rejoindre';
    });
    return;
  }
}

showRegisterBtn.addEventListener('click', () => {
  showView('register');
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('reg-password') as HTMLInputElement).value.trim();
  const displayName = (document.getElementById('reg-displayName') as HTMLInputElement).value.trim();

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
    const data = await res.json().catch(() => ({} as any));
    alert(data.error || 'Erreur lors de la création du compte');
    return;
  }

  // If user opted in for 2FA, guide them immediately after account creation
  if (regEnable2FA && regEnable2FA.checked) {
    // Log user in transparently to allow 2FA setup immediately
    const loginRes = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!loginRes.ok) {
      alert('Compte créé. Veuillez vous connecter pour terminer la configuration 2FA.');
      showView('login');
      (document.getElementById('email') as HTMLInputElement).value = email;
      return;
    }

    // Prompt 2FA setup now (QR + code)
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

    // Fetch me and go home after flow (whether verified or canceled)
    try {
      const meRes = await fetch('/api/me', { credentials: 'include' });
      if (meRes.ok) {
        const me = await meRes.json();
        localStorage.setItem('userId', me.id);
      }
    } catch {}
    showView('home');
  } else {
    alert('Compte créé. Veuillez vous connecter.');
    showView('login');
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value.trim();

  if (!email || !password) {
    alert('Veuillez remplir tous les champs.');
    return;
  }

  const attempt = async (otp?: string): Promise<Response> => {
    return fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, otp })
    });
  };

  let res = await attempt();

  // If server indicates 2FA is needed, open a nice modal to enter code
  if (res.status === 206) {
    const verified = await openTwoFAModal({ mode: 'enter' }, async (code) => {
      res = await attempt(code);
      if (res.ok) return true;
      const data = await res.json().catch(() => ({} as any));
      alert(data.error || 'Code 2FA invalide');
      return false;
    });
    if (!verified) {
      // User canceled or verification failed; keep on login without generic error
      return;
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any));
    alert(data.error || 'Erreur de connexion');
    return;
  }

  let me: any = null;
  try {
    const meRes = await fetch('/api/me', { credentials: 'include' });
    if (meRes.ok) {
      me = await meRes.json();
      localStorage.setItem('userId', me.id);
      console.log('Connexion réussie - l\'historique sera rechargé automatiquement');
    }
  } catch {}

  // Previously we guided post-login 2FA setup; now setup happens right after registration if chosen.

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
    if (!profileEmail || !profileDisplayName) return;
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

    let avatarUrl: string | undefined;

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
    } else {
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
    } else {
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
  const deleteAvatarBtn = document.getElementById('delete-avatar');
  if (deleteAvatarBtn) {
    deleteAvatarBtn.addEventListener('click', async () => {
      await fetch('/api/me/avatar', { method: 'DELETE', credentials: 'include' });
      showView('profile', false);
    });
  }

  const tabInfo = document.getElementById('profile-tab-info');
  const tabHistory = document.getElementById('profile-tab-history');
  const infoPanel = document.getElementById('profile-info-panel');
  const historyPanel = document.getElementById('profile-history-panel');
  if (tabInfo && tabHistory && infoPanel && historyPanel) {
    tabInfo.addEventListener('click', () => {
      tabInfo.classList.add('bg-blue-600');
      tabInfo.classList.remove('bg-gray-800');
      tabHistory.classList.remove('bg-blue-600');
      tabHistory.classList.add('bg-gray-800');
      infoPanel.classList.remove('hidden');
      historyPanel.classList.add('hidden');
    });
    tabHistory.addEventListener('click', () => {
      tabHistory.classList.add('bg-blue-600');
      tabHistory.classList.remove('bg-gray-800');
      tabInfo.classList.remove('bg-blue-600');
      tabInfo.classList.add('bg-gray-800');
      infoPanel.classList.add('hidden');
      historyPanel.classList.remove('hidden');
      renderMatchHistory();
    });
  }

  const publicTabInfo = document.getElementById('public-profile-tab-info');
  const publicTabHistory = document.getElementById('public-profile-tab-history');
  const publicInfoPanel = document.getElementById('public-profile-info-panel');
  const publicHistoryPanel = document.getElementById('public-profile-history-panel');
  
  if (publicTabInfo && publicTabHistory && publicInfoPanel && publicHistoryPanel) {
    publicTabInfo.addEventListener('click', () => {
      publicTabInfo.classList.add('bg-blue-600');
      publicTabInfo.classList.remove('bg-gray-800');
      publicTabHistory.classList.remove('bg-blue-600');
      publicTabHistory.classList.add('bg-gray-800');
      publicInfoPanel.classList.remove('hidden');
      publicHistoryPanel.classList.add('hidden');
    });
    
    publicTabHistory.addEventListener('click', () => {
      publicTabHistory.classList.add('bg-blue-600');
      publicTabHistory.classList.remove('bg-gray-800');
      publicTabInfo.classList.remove('bg-blue-600');
      publicTabInfo.classList.add('bg-gray-800');
      publicInfoPanel.classList.add('hidden');
      publicHistoryPanel.classList.remove('hidden');

      // Utiliser la variable globale pour charger l'historique
      if (currentPublicUserId) {
        renderPublicMatchHistory(currentPublicUserId);
      }
    });
  }
});

async function renderMatchHistory() {
  const historyList = document.getElementById('profile-history-list');
  const statsDiv = document.getElementById('profile-stats');
  if (!historyList || !statsDiv) return;

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
      // Nettoyer les graphiques existants s'il n'y a pas de données
      const totalWinsEl = document.getElementById('total-wins');
      const totalLossesEl = document.getElementById('total-losses');
      const winRateEl = document.getElementById('win-rate');
      const totalMatchesEl = document.getElementById('total-matches');
      
      if (totalWinsEl) totalWinsEl.textContent = '0';
      if (totalLossesEl) totalLossesEl.textContent = '0';
      if (winRateEl) winRateEl.textContent = '0%';
      if (totalMatchesEl) totalMatchesEl.textContent = '0';
      
      return;
    }

    historyList.innerHTML = matches.map((match: any) => {
      const isWinner = match.isWinner;
      const opponent = match.player1.id === currentUser.id ? match.player2 : match.player1;
      const userScore = match.player1.id === currentUser.id ? match.player1Score : match.player2Score;
      const opponentScore = match.player1.id === currentUser.id ? match.player2Score : match.player1Score;
      
      let matchTypeLabel = '';
      if (match.matchType === 'TOURNAMENT_SEMI') {
        matchTypeLabel = '<span class="text-yellow-400">Tournoi - Demi-finale</span>';
      } else if (match.matchType === 'TOURNAMENT_FINAL') {
        matchTypeLabel = '<span class="text-yellow-400">Tournoi - Finale</span>';
      } else {
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

    const totalMatches = matches.length;
    const wins = matches.filter((match: any) => match.isWinner).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    
    const tournamentMatches = matches.filter((match: any) => match.matchType.startsWith('TOURNAMENT'));
    const normalMatches = matches.filter((match: any) => match.matchType === 'NORMAL');
    
    // Mettre à jour les statistiques textuelles
    const totalWinsEl = document.getElementById('total-wins');
    const totalLossesEl = document.getElementById('total-losses');
    const winRateEl = document.getElementById('win-rate');
    const totalMatchesEl = document.getElementById('total-matches');
    
    if (totalWinsEl) totalWinsEl.textContent = wins.toString();
    if (totalLossesEl) totalLossesEl.textContent = losses.toString();
    if (winRateEl) winRateEl.textContent = `${winRate}%`;
    if (totalMatchesEl) totalMatchesEl.textContent = totalMatches.toString();

    // Créer les graphiques
    setTimeout(() => {
      // Détruire les graphiques existants
      if (winLossChart) winLossChart.destroy();
      if (matchTypesChart) matchTypesChart.destroy();

      // Créer les nouveaux graphiques
      const winLossCtx = document.getElementById('winLossChart') as HTMLCanvasElement;
      const matchTypesCtx = document.getElementById('matchTypesChart') as HTMLCanvasElement;

      if (winLossCtx) {
        winLossChart = createWinLossChart(winLossCtx.getContext('2d'), wins, losses);
      }
      
      if (matchTypesCtx) {
        matchTypesChart = createMatchTypesChart(matchTypesCtx.getContext('2d'), normalMatches.length, tournamentMatches.length);
      }
    }, 100);

  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    historyList.textContent = 'Erreur lors du chargement de l\'historique.';
  }
}

async function renderPublicProfileStats(userId: number) {
  const statsDiv = document.getElementById('public-profile-stats');
  if (!statsDiv) return;

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
    const wins = matches.filter((match: any) => match.isWinner).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    
    const tournamentMatches = matches.filter((match: any) => match.matchType.startsWith('TOURNAMENT'));
    const normalMatches = matches.filter((match: any) => match.matchType === 'NORMAL');
    
    // Mettre à jour les statistiques textuelles du profil public
    const publicTotalWinsEl = document.getElementById('public-total-wins');
    const publicTotalLossesEl = document.getElementById('public-total-losses');
    const publicWinRateEl = document.getElementById('public-win-rate');
    const publicTotalMatchesEl = document.getElementById('public-total-matches');
    
    if (publicTotalWinsEl) publicTotalWinsEl.textContent = wins.toString();
    if (publicTotalLossesEl) publicTotalLossesEl.textContent = losses.toString();
    if (publicWinRateEl) publicWinRateEl.textContent = `${winRate}%`;
    if (publicTotalMatchesEl) publicTotalMatchesEl.textContent = totalMatches.toString();

    // Créer les graphiques pour le profil public
    setTimeout(() => {
      // Détruire les graphiques existants
      if (publicWinLossChart) publicWinLossChart.destroy();
      if (publicMatchTypesChart) publicMatchTypesChart.destroy();

      // Créer les nouveaux graphiques
      const publicWinLossCtx = document.getElementById('publicWinLossChart') as HTMLCanvasElement;
      const publicMatchTypesCtx = document.getElementById('publicMatchTypesChart') as HTMLCanvasElement;

      if (publicWinLossCtx) {
        publicWinLossChart = createWinLossChart(publicWinLossCtx.getContext('2d'), wins, losses);
      }
      
      if (publicMatchTypesCtx) {
        publicMatchTypesChart = createMatchTypesChart(publicMatchTypesCtx.getContext('2d'), normalMatches.length, tournamentMatches.length);
      }
    }, 100);

  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    statsDiv.textContent = 'Erreur lors du chargement des statistiques.';
  }
}

async function renderPublicMatchHistory(userId: number) {
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
      } else {
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

    historyList.innerHTML = matches.map((match: any) => {
      const isWinner = match.isWinner;
      const opponent = match.player1.id === userId ? match.player2 : match.player1;
      const userScore = match.player1.id === userId ? match.player1Score : match.player2Score;
      const opponentScore = match.player1.id === userId ? match.player2Score : match.player1Score;
      
      let matchTypeLabel = '';
      if (match.matchType === 'TOURNAMENT_SEMI') {
        matchTypeLabel = '<span class="text-yellow-400">Tournoi - Demi-finale</span>';
      } else if (match.matchType === 'TOURNAMENT_FINAL') {
        matchTypeLabel = '<span class="text-yellow-400">Tournoi - Finale</span>';
      } else {
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

  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    historyList.textContent = 'Erreur lors du chargement de l\'historique.';
  }
}

function displayTournamentMatches(bracketOrSlots: any) {
  showTournamentMatchupPopup(bracketOrSlots);
}

async function showTournamentMatchupPopup(bracketOrSlots: any) {
  const popup = document.getElementById('tournament-matchup-popup');
  if (!popup) return;

  let bracket: any;
  
  // Si c'est un tableau de slots, créer le bracket
  if (Array.isArray(bracketOrSlots)) {
    const slots = bracketOrSlots;
    bracket = {
      semifinals: [
        { player1: slots[0], player2: slots[1] },
        { player1: slots[2], player2: slots[3] }
      ],
      final: {
        player1: 'Gagnant Demi 1',
        player2: 'Gagnant Demi 2'
      }
    };
  } else {
    bracket = bracketOrSlots;
  }

  // Récupérer les informations des joueurs (noms et avatars)
  const playerInfos = new Map();
  
  try {
    // Pour chaque joueur dans les demi-finales, récupérer ses infos
    for (const match of bracket.semifinals) {
      for (const playerName of [match.player1, match.player2]) {
        if (playerName && !playerInfos.has(playerName)) {
          try {
            const res = await fetch(`/api/user/${encodeURIComponent(playerName)}`, { credentials: 'include' });
            if (res.ok) {
              const playerData = await res.json();
              playerInfos.set(playerName, {
                displayName: playerData.displayName,
                avatar: playerData.avatar || '/avatars/default.png'
              });
            }
          } catch (e) {
            // En cas d'erreur, utiliser les valeurs par défaut
            playerInfos.set(playerName, {
              displayName: playerName,
              avatar: '/avatars/default.png'
            });
          }
        }
      }
    }
  } catch (e) {
    console.error('Erreur lors de la récupération des infos joueurs:', e);
  }

  // Remplir les demi-finales
  if (bracket.semifinals && bracket.semifinals.length >= 2) {
    // Match 1
    const match1 = bracket.semifinals[0];
    const p1Info = playerInfos.get(match1.player1) || { displayName: match1.player1, avatar: '/avatars/default.png' };
    const p2Info = playerInfos.get(match1.player2) || { displayName: match1.player2, avatar: '/avatars/default.png' };
    
    const semi1P1Name = document.getElementById('semi1-p1-name');
    const semi1P1Avatar = document.getElementById('semi1-p1-avatar') as HTMLImageElement;
    const semi1P2Name = document.getElementById('semi1-p2-name');
    const semi1P2Avatar = document.getElementById('semi1-p2-avatar') as HTMLImageElement;
    
    if (semi1P1Name) semi1P1Name.textContent = p1Info.displayName;
    if (semi1P1Avatar) semi1P1Avatar.src = p1Info.avatar + '?t=' + Date.now();
    if (semi1P2Name) semi1P2Name.textContent = p2Info.displayName;
    if (semi1P2Avatar) semi1P2Avatar.src = p2Info.avatar + '?t=' + Date.now();

    // Match 2
    const match2 = bracket.semifinals[1];
    const p3Info = playerInfos.get(match2.player1) || { displayName: match2.player1, avatar: '/avatars/default.png' };
    const p4Info = playerInfos.get(match2.player2) || { displayName: match2.player2, avatar: '/avatars/default.png' };
    
    const semi2P1Name = document.getElementById('semi2-p1-name');
    const semi2P1Avatar = document.getElementById('semi2-p1-avatar') as HTMLImageElement;
    const semi2P2Name = document.getElementById('semi2-p2-name');
    const semi2P2Avatar = document.getElementById('semi2-p2-avatar') as HTMLImageElement;
    
    if (semi2P1Name) semi2P1Name.textContent = p3Info.displayName;
    if (semi2P1Avatar) semi2P1Avatar.src = p3Info.avatar + '?t=' + Date.now();
    if (semi2P2Name) semi2P2Name.textContent = p4Info.displayName;
    if (semi2P2Avatar) semi2P2Avatar.src = p4Info.avatar + '?t=' + Date.now();
  }

  // Gérer l'affichage de la finale
  const finalSection = document.getElementById('final-section');
  if (bracket.final && bracket.final.player1 !== 'Gagnant Demi 1') {
    // La finale a de vrais joueurs
    if (finalSection) finalSection.classList.remove('hidden');
    
    const final1Info = playerInfos.get(bracket.final.player1) || { displayName: bracket.final.player1, avatar: '/avatars/default.png' };
    const final2Info = playerInfos.get(bracket.final.player2) || { displayName: bracket.final.player2, avatar: '/avatars/default.png' };
    
    const finalP1Name = document.getElementById('final-p1-name');
    const finalP1Avatar = document.getElementById('final-p1-avatar') as HTMLImageElement;
    const finalP2Name = document.getElementById('final-p2-name');
    const finalP2Avatar = document.getElementById('final-p2-avatar') as HTMLImageElement;
    
    if (finalP1Name) finalP1Name.textContent = final1Info.displayName;
    if (finalP1Avatar) finalP1Avatar.src = final1Info.avatar + '?t=' + Date.now();
    if (finalP2Name) finalP2Name.textContent = final2Info.displayName;
    if (finalP2Avatar) finalP2Avatar.src = final2Info.avatar + '?t=' + Date.now();
  } else {
    // Cacher la finale pour l'instant
    if (finalSection) finalSection.classList.add('hidden');
  }

  // Afficher le popup
  popup.classList.remove('hidden');
  
  // Démarrer le compte à rebours optimisé - commencer directement sans délai
  let countdown = 3;
  const countdownTimer = document.getElementById('countdown-timer');
  const countdownText = document.getElementById('tournament-countdown');
  
  if (countdownTimer) countdownTimer.textContent = countdown.toString();
  
  // Premier décompte immédiat
  setTimeout(() => {
    countdown--;
    if (countdownTimer) countdownTimer.textContent = countdown.toString();
    
    const interval = setInterval(() => {
      countdown--;
      if (countdownTimer) countdownTimer.textContent = countdown.toString();
      
      if (countdown <= 0) {
        clearInterval(interval);
        popup.classList.add('hidden');
        // Le serveur démarre le match maintenant
      }
    }, 1000);
  }, 100); // Petit délai pour éviter le décalage
}

function resetTournamentDisplay() {
  const bracketDiv = document.getElementById('tournament-bracket');
  const slotsDiv = document.getElementById('tournament-slots');
  
  // Cacher le bracket et réafficher les slots
  if (bracketDiv) {
    bracketDiv.classList.add('hidden');
    bracketDiv.innerHTML = '';
  }
  if (slotsDiv) {
    slotsDiv.classList.remove('hidden');
  }

  // Réinitialiser tous les slots et boutons
  for (let i = 1; i <= 4; i++) {
    const slotDiv = document.getElementById(`slot-${i}`);
    const joinBtn = document.querySelector(`[data-slot="${i}"]`) as HTMLButtonElement;
    
    if (slotDiv) {
      slotDiv.textContent = `Slot ${i}`;
    }
    if (joinBtn) {
      joinBtn.style.display = 'block';
      joinBtn.textContent = 'Rejoindre';
      joinBtn.removeAttribute('disabled');
    }
  }

  // Nettoyer les notifications et écrans d'attente
  const tournamentNotification = document.getElementById('tournament-notification');
  const championNotification = document.getElementById('champion-notification');
  const waitingScreen = document.getElementById('waiting-final-screen');
  const popup = document.getElementById('tournament-matchup-popup');

  if (tournamentNotification) tournamentNotification.classList.add('hidden');
  if (championNotification) championNotification.classList.add('hidden');
  if (waitingScreen) waitingScreen.classList.add('hidden');
  if (popup) popup.classList.add('hidden');

  // Réinitialiser le canvas du tournoi si il existe
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

function showWaitingForFinalScreen() {
  // Masquer toutes les autres sections
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

  // Créer et afficher l'écran d'attente
  let waitingScreen = document.getElementById('waiting-final-screen');
  if (!waitingScreen) {
    waitingScreen = document.createElement('div');
    waitingScreen.id = 'waiting-final-screen';
    waitingScreen.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    waitingScreen.innerHTML = `
      <div class="text-center p-8 bg-gray-950 rounded-lg border border-gray-700 max-w-2xl">
        <h1 class="text-3xl font-bold text-green-400 mb-4">SEMI-FINALE GAGNÉE !</h1>
        <p class="text-xl text-white mb-6">Vous êtes qualifié(e) pour la FINALE !</p>
        
        <div class="text-center mb-6">
          <p class="text-lg text-white mb-4">Attente de l'autre demi-finale...</p>
          <p class="text-base text-gray-300 mb-4">La finale commencera dès que l'autre match sera terminé</p>
          <div class="bg-gray-800 rounded-lg p-4 mb-4">
            <p class="text-white font-semibold">Préparez-vous pour le match de votre vie !</p>
            <p class="text-sm text-gray-300 mt-2">Conseil : Restez concentré(e) et gérez bien vos angles</p>
          </div>
          <p class="text-sm text-gray-400">Navigation bloquée pendant l'attente</p>
        </div>
        
        <p class="text-base text-white">Finale en approche</p>
      </div>
    `;
    document.body.appendChild(waitingScreen);
  }
  
  waitingScreen.classList.remove('hidden');
  
  // La navigation reste lockée - elle ne sera débloquée qu'après la finale
}

function hideWaitingForFinalScreen() {
  const waitingScreen = document.getElementById('waiting-final-screen');
  if (waitingScreen) {
    waitingScreen.classList.add('hidden');
  }
}

function showTournamentNotification(isWinner: boolean, score1: number, score2: number, isInFinal: boolean = false) {
  // Créer une notification simple qui disparaît automatiquement
  let notification = document.getElementById('tournament-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'tournament-notification';
    notification.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    document.body.appendChild(notification);
  }

  const textColor = isWinner ? 'text-green-400' : 'text-red-400';
  const title = isWinner ? 'VICTOIRE !' : 'DÉFAITE';
  const message = isWinner ? 
    (isInFinal ? 'Vous êtes CHAMPION DU TOURNOI !' : 'Vous êtes qualifié(e) pour la FINALE !') :
    'Merci d\'avoir participé au tournoi !';

  notification.innerHTML = `
    <div class="text-center p-8 bg-gray-950 rounded-lg border border-gray-700 max-w-md">
      <h1 class="text-3xl font-bold ${textColor} mb-4">${title}</h1>
      <p class="text-xl text-white mb-4">${message}</p>
      <div class="text-2xl font-bold text-white mb-4">
        Score: ${score1} - ${score2}
      </div>
      ${isWinner && !isInFinal ? 
        '<p class="text-lg text-white">Préparez-vous pour la finale...</p>' : 
        isWinner && isInFinal ? '<p class="text-lg text-white">CHAMPION !</p>' :
        '<p class="text-lg text-gray-300">Continuez à vous entraîner !</p>'
      }
    </div>
  `;

  notification.classList.remove('hidden');

  // Faire disparaître automatiquement après 3 secondes
  setTimeout(() => {
    notification.classList.add('hidden');
    
    if (isWinner && !isInFinal) {
      // Si c'est un gagnant de demi-finale, montrer l'écran d'attente
      showWaitingForFinalScreen();
    } else if (!isWinner || isInFinal) {
      // Si c'est un perdant ou le champion final, débloquer la navigation
      unlockNavigation();
      showView('home');
    }
  }, 3000);
}

if (tournamentSection) {
  tournamentSection.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('join-tournament-btn')) {
      const slot = target.dataset.slot;
      target.textContent = 'En attente...';
      target.setAttribute('disabled', 'true');
      
      // Use WSS via Nginx reverse proxy
      const ws = new WebSocket(`wss://${location.host}/ws/tournament`);
      let gameWs: WebSocket | null = null;
      let playernumber: number | null = null;
      let gameState: any = null;
      let animationId: number | null = null;
      let finished: boolean = false;
      let waitingStart = false;
      let player1Name = 'Joueur 1';
      let player2Name = 'Joueur 2';
      let isInFinal = false; // Variable pour tracker si on est en finale

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
            const joinBtn = document.querySelector(`[data-slot="${i}"]`) as HTMLButtonElement;
            
            if (slotDiv && joinBtn) {
              if (data.slots[i-1]) {
                slotDiv.textContent = data.slots[i-1];
                joinBtn.style.display = 'none';
              } else {
                slotDiv.textContent = `Slot ${i}`;
                if (!userAlreadyJoined) {
                  joinBtn.style.display = 'block';
                  joinBtn.textContent = 'Rejoindre';
                  joinBtn.removeAttribute('disabled');
                } else {
                  joinBtn.style.display = 'none';
                }
              }
            }
          }
          
          // Afficher les matchups quand tous les slots sont remplis
          const allSlotsFilled = data.slots.every((slot: string) => slot && slot.trim() !== '');
          if (allSlotsFilled && data.slots.length === 4) {
            displayTournamentMatches(data.slots);
          }
        }
        if (data.type === 'tournament_bracket') {
          displayTournamentMatches(data.bracket);
          // Vérifier si c'est le bracket de la finale
          if (data.bracket.final && data.bracket.final.player1 !== 'Gagnant Demi 1') {
            isInFinal = true;
          }
        }
        if (data.type === 'match_found') {
          waitingStart = true;
          pongpage?.classList.remove('hidden');
          tournamentSection.classList.add('hidden');
          gameSection.classList.add('hidden');
        }
        if (data.type === 'player_names') {
          player1Name = data.player1Name;
          player2Name = data.player2Name;
        }
        if (data.type === 'start_game') {
          hideWaitingForFinalScreen(); // Cacher l'écran d'attente si on était en attente
          showView('game');
          pongpage?.classList.remove('hidden');
          bg_blur?.classList.add('hidden');
          gameSection.classList.add('hidden');
          canvas.classList.remove('hidden');
          playernumber = data.playernumber || 1;
          lockNavigation(); // Bloquer la navigation pendant le jeu
          startPongGame();
        }
        if (data.type === 'game_state') {
          gameState = data.state;
        }
        if (data.type === 'loser') {
          if (finished) return;
          finished = true;
          
          // Réinitialiser le canvas
          if (animationId) cancelAnimationFrame(animationId);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          
          // Afficher la notification de défaite (elle gère automatiquement la navigation)
          showTournamentNotification(false, data.score1, data.score2, false);
          return;
        }
        if (data.type === 'winner') {
          if (finished) return;
          finished = true;
          
          // Réinitialiser le canvas
          if (animationId) cancelAnimationFrame(animationId);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          
          // Déterminer si c'est une finale (basé sur isInFinal)
          showTournamentNotification(true, data.score1, data.score2, isInFinal);
          return;
        }
        if (data.type === 'tournament_winner') {
          // Masquer l'écran d'attente si il était affiché
          hideWaitingForFinalScreen();
          
          // Créer une notification simple pour le champion du tournoi
          let championNotification = document.getElementById('champion-notification');
          if (!championNotification) {
            championNotification = document.createElement('div');
            championNotification.id = 'champion-notification';
            championNotification.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
            document.body.appendChild(championNotification);
          }

          championNotification.innerHTML = `
            <div class="text-center p-12 bg-gray-950 rounded-lg border border-gray-700 max-w-lg">
              <h1 class="text-4xl font-bold text-white mb-6">CHAMPION DU TOURNOI !</h1>
              <p class="text-2xl text-white mb-4">Le gagnant est : <span class="text-green-400 font-bold">${data.displayName}</span></p>
              <div class="text-lg text-white mb-6">
                Félicitations pour cette victoire !
              </div>
              <div class="text-base text-gray-300">Retour au menu principal...</div>
            </div>
          `;

          championNotification.classList.remove('hidden');

          // Retourner au menu après 5 secondes
          setTimeout(() => {
            championNotification.classList.add('hidden');
            resetTournamentDisplay(); 
            unlockNavigation();
            showView('home'); 
          }, 5000);
        }
      };
      ws.onclose = () => {
        resetTournamentDisplay(); 
        unlockNavigation(); 
        target.textContent = 'Rejoindre';
        target.removeAttribute('disabled');
      };

      function startPongGame() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Réinitialiser complètement le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 800;
        canvas.height = 400;
        
        let paddleY = 150;
        const paddleH = 80;
        const paddleW = 10;
        const height = 400;
        const width = 800;
        
        function draw() {
          if (!gameState || !ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#222';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#fff';
          ctx.beginPath();
          ctx.setLineDash([10, 10]);
          ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#fff';
          ctx.fillRect(20, gameState.paddle1.y, paddleW, paddleH);
          ctx.fillRect(canvas.width-30, gameState.paddle2.y, paddleW, paddleH);
          ctx.beginPath();
          ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, 2*Math.PI);
          ctx.fill();
          ctx.font = '18px Arial';
          ctx.fillStyle = '#fff';
          ctx.fillText(player1Name, 20, 20);
          ctx.fillText(player2Name, canvas.width - ctx.measureText(player2Name).width - 30, 20);
          ctx.font = '32px Arial';
          ctx.fillText(gameState.score1, canvas.width/2-50, 40);
          ctx.fillText(gameState.score2, canvas.width/2+30, 40);
        }
        function gameLoop() {
          draw();
          animationId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
        function onKey(e: KeyboardEvent) {
          if (!playernumber) return;
          let changed = false;
          if (playernumber === 1) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { paddleY -= 10; changed = true; }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { paddleY += 10; changed = true; }
          } else if (playernumber === 2) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { paddleY -= 10; changed = true; }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { paddleY += 10; changed = true; }
          }
          paddleY = Math.max(0, Math.min(canvas.height-paddleH, paddleY));
          if (changed) {
            ws.send(JSON.stringify({ type: 'paddle_move', y: paddleY }));
          }
        }
        window.addEventListener('keydown', onKey);
      }
    }
    if (target.id === 'close-tournament-btn') {
      resetTournamentDisplay();
      tournamentSection.classList.add('hidden');
      showView('home');
    }
  });
}

async function renderFriendsList() {
  const container = document.getElementById('friends-list');
  if (!container) return;
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
  container.innerHTML = friends.map((f: any) => `
    <div class="flex items-center mb-2 friend-item" data-id="${f.id}" style="cursor:pointer;">
      <img src="${f.avatar || '/avatars/default.png'}" alt="Avatar" class="w-8 h-8 rounded-full mr-2">
      <span>${f.displayName}</span>
      <button class="ml-auto text-red-500 remove-friend-btn" data-id="${f.id}">Retirer</button>
    </div>
  `).join('');

  container.querySelectorAll('.remove-friend-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = (e.target as HTMLElement).getAttribute('data-id');
      if (id) {
        await fetch(`/api/friends/${id}`, { method: 'DELETE', credentials: 'include' });
        renderFriendsList();
      }
    });
  });

  container.querySelectorAll('.friend-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      const id = (item as HTMLElement).getAttribute('data-id');
      if (id) {
        const friend = friends.find((f: any) => f.id == id);
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

// High-level 2FA helper to start and/or enter code using the shared modal
async function openTwoFAModal(
  opts: { mode: 'setup' | 'enter'; title?: string; desc?: string },
  onConfirm: (code: string) => Promise<boolean>
) : Promise<boolean> {
  if (!twofaModal || !twofaQR || !twofaCode || !twofaConfirm || !twofaCancel) return false;
  twofaTitle && (twofaTitle.textContent = opts.title || (opts.mode === 'setup' ? 'Configurer la 2FA' : 'Validation 2FA'));
  twofaDesc && (twofaDesc.textContent = opts.desc || (opts.mode === 'setup'
    ? 'Scannez le QR code puis entrez le code à 6 chiffres.'
    : 'Entrez le code à 6 chiffres de votre application Authenticator.'));

  // Reset UI
  twofaCode.value = '';
  twofaQR.src = '';
  // Hide QR wrapper when not in setup mode (prevents empty image box on login)
  if (twofaQRWrap) twofaQRWrap.style.display = opts.mode === 'setup' ? '' : 'none';

  // If setup, call /api/2fa/enable to fetch a new QR
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
  // focus the code input for faster retry
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
    if (ok) closeModal();
    return ok;
  };
  // Keep handlers active until user cancels or verification succeeds.
  let cleanup: () => void;

  return await new Promise<boolean>((resolve) => {
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
      // if not ok, do not cleanup so user can retry without reopening modal
    };

    cleanup = () => {
      twofaCancel.removeEventListener('click', handlerCancel);
      twofaConfirm.removeEventListener('click', handlerConfirm);
    };

    twofaCancel.addEventListener('click', handlerCancel);
    twofaConfirm.addEventListener('click', handlerConfirm);
  });
}

// Hook: after login success into home, offer to setup 2FA if user opted during registration.
// We can also attach a listener to encourage setup from profile later.

// Optional: expose a function to launch setup from elsewhere (e.g., future settings button)
(window as any).startTwoFASetup = async function() {
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
}

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
  if (!confirm('Are you sure? This will delete your account.')) return;
  const r = await fetch('/api/me', { method: 'DELETE', credentials: 'include' });
  alert(r.ok ? 'Deleted' : 'Failed');
}



async function renderFriendRequests() {
  const container = document.getElementById('friend-requests-list');
  if (!container) return;
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
  container.innerHTML = requests.map((u: any) => `
  <div class="flex items-center mb-2">
    <img src="${u.avatar || '/avatars/default.png'}" alt="Avatar" class="w-8 h-8 rounded-full mr-2">
    <span>${u.displayName}</span>
    <button class="ml-auto bg-green-500 text-white px-2 py-1 rounded accept-friend-btn" data-id="${u.friendRequestId}">Accepter</button>
  </div>
`).join('');
  container.querySelectorAll('.accept-friend-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
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
    const target = e.target as HTMLElement;
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
      } else {
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
      return
    }
    if (homeSection) homeSection.appendChild(btn);
    if (profileSection) profileSection.appendChild(btn.cloneNode(true));
  }

  document.querySelectorAll('#logout-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      localStorage.clear();
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      showView('login');
    });
  });
}

window.addEventListener('popstate', (event) => {
  const view = event.state?.view || 'login';
  showView(view, false);
});

if (location.pathname === '/register') showView('register', false);
else if (location.pathname === '/home') showView('home', false);
else if (location.pathname === '/game') showView('game', false);
else if (location.pathname === '/profile') showView('profile', false);
else showView('login', false);

const userId = localStorage.getItem('userId');
await fetch('/api/me', { method: 'GET', credentials: 'include' });

const canvashome = document.getElementById("home-canvas") as HTMLCanvasElement;
const canHome = canvashome?.getContext("2d");
if (!canHome) {
    throw new Error("Impossible de récupérer le contexte du canvas");
}

function drawHomePong() 
{
    if (!canHome) return;
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
