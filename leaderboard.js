(function() {
    // 1. Initialize Anonymous Auth
    firebase.auth().signInAnonymously().then(() => {
        console.log("[Firebase] Anonymous Authentication Successful");
    }).catch(err => {
        console.error("[Firebase] Anonymous Authentication Failed:", err);
    });

    // 2. Get database reference
    const db = firebase.app().firestore();

    // 3. Define the window.Voyager namespace
    window.Voyager = window.Voyager || {};
    window.Voyager.currentScore = 0;
    window.Voyager.scoreSaved = false;
    window.Voyager.savedDocId = null;

    // Show leaderboard handler
    window.Voyager.showLeaderboard = function(score) {
        console.log("[Leaderboard] showLeaderboard called with score:", score);
        window.Voyager.currentScore = score;
        window.Voyager.scoreSaved = false;
        window.Voyager.savedDocId = null;

        const overlay = document.getElementById('leaderboard-screen');
        if (!overlay) {
            console.error("leaderboard-screen element not found");
            return;
        }

        // Show modal overlay
        overlay.classList.add('active');

        // Update final score display
        const scoreVal = document.getElementById('modal-final-score');
        if (scoreVal) {
            scoreVal.textContent = score.toLocaleString();
        }

        // Determine win/lose status text
        const statusEl = document.getElementById('completion-status');
        if (statusEl) {
            const inst = window.VoyagerGameInstance;
            if (inst && inst.gameState === 'SUCCESS') {
                statusEl.textContent = 'VICTORY: CHOPPER EXTRACT SUCCESSFUL';
                statusEl.style.color = 'var(--accent-cyan)';
            } else {
                statusEl.textContent = 'DEFEAT: KILLED IN ACTION (K.I.A.)';
                statusEl.style.color = '#E74C3C';
            }
        }

        const submissionSection = document.getElementById('new-high-score-section');
        const viewSection = document.getElementById('leaderboard-view-section');

        // Limit the input for initials to exactly 3 letters
        const nameInput = document.getElementById('pilot-name-input');
        if (nameInput) {
            nameInput.maxLength = 3;
            nameInput.placeholder = "AAA";
            nameInput.value = "";
            nameInput.disabled = false;
        }

        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Record';
            submitBtn.disabled = false;
        }

        const skipBtn = document.getElementById('skip-submit-btn');
        if (skipBtn) {
            skipBtn.style.display = 'inline-block';
        }

        if (score > 0) {
            // Show submission screen
            if (submissionSection) submissionSection.classList.remove('hidden');
            if (viewSection) viewSection.classList.add('hidden');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        } else {
            // No score to save, go straight to leaderboard table view
            if (submissionSection) submissionSection.classList.add('hidden');
            if (viewSection) viewSection.classList.remove('hidden');
            fetchAndRenderScores();
        }
    };

    // Reset game handler
    window.Voyager.resetGame = function() {
        console.log("[Leaderboard] Reset game requested");
        const overlay = document.getElementById('leaderboard-screen');
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Restart Voyager game engine
        if (window.VoyagerGameInstance) {
            window.VoyagerGameInstance.restartGame();
        }
    };

    // Helper to submit the score
    function submitScore() {
        const nameInput = document.getElementById('pilot-name-input');
        if (!nameInput || nameInput.disabled) return;

        const initials = nameInput.value.trim().toUpperCase();
        
        // Restrict to exactly 3 letters A-Z
        if (!/^[A-Z]{3}$/.test(initials)) {
            alert("Please enter exactly 3 letters for your soldier initials.");
            nameInput.focus();
            return;
        }

        // Disable input while saving
        nameInput.disabled = true;
        
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }

        const skipBtn = document.getElementById('skip-submit-btn');
        if (skipBtn) {
            skipBtn.style.display = 'none';
        }

        // Write to Firestore
        db.collection('scores').add({
            initials: initials,
            score: window.Voyager.currentScore,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then((docRef) => {
            console.log("[Firestore] Score saved successfully. DocID:", docRef.id);
            window.Voyager.scoreSaved = true;
            window.Voyager.savedDocId = docRef.id;

            // Fetch high scores and render
            fetchAndRenderScores();

            // Transition to leaderboard table view
            const submissionSection = document.getElementById('new-high-score-section');
            const viewSection = document.getElementById('leaderboard-view-section');
            if (submissionSection) submissionSection.classList.add('hidden');
            if (viewSection) viewSection.classList.remove('hidden');
        }).catch(err => {
            console.error("[Firestore] Error saving score:", err);
            alert("Database transmission failed. Please try again.");
            nameInput.disabled = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Record';
            }
            if (skipBtn) {
                skipBtn.style.display = 'inline-block';
            }
        });
    }

    // Helper to fetch and render top 10 scores
    function fetchAndRenderScores() {
        const tbody = document.getElementById('leaderboard-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:20px 0;">Synchronizing with Warzone archives...</td></tr>';

        db.collection('scores')
            .orderBy('score', 'desc')
            .limit(10)
            .get()
            .then(querySnapshot => {
                tbody.innerHTML = '';
                
                if (querySnapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:20px 0;">No records in Warzone archives.</td></tr>';
                    return;
                }

                let rank = 1;
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const tr = document.createElement('tr');
                    
                    // Highlight the player's just-saved score
                    if (window.Voyager.scoreSaved && doc.id === window.Voyager.savedDocId) {
                        tr.className = 'highlight-row';
                    }

                    // Rank
                    const tdRank = document.createElement('td');
                    tdRank.className = 'rank-cell';
                    if (rank === 1) {
                        tdRank.innerHTML = '<span class="medal gold">🥇</span>';
                    } else if (rank === 2) {
                        tdRank.innerHTML = '<span class="medal silver">🥈</span>';
                    } else if (rank === 3) {
                        tdRank.innerHTML = '<span class="medal bronze">🥉</span>';
                    } else {
                        tdRank.textContent = rank;
                    }

                    // Pilot (Initials)
                    const tdName = document.createElement('td');
                    tdName.className = 'name-cell';
                    const safeInitials = escapeHTML(data.initials || '???');
                    if (window.Voyager.scoreSaved && doc.id === window.Voyager.savedDocId) {
                        tdName.innerHTML = `${safeInitials} <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:bold; margin-left:8px;">[YOU]</span>`;
                    } else {
                        tdName.textContent = safeInitials;
                    }

                    // Score
                    const tdScore = document.createElement('td');
                    tdScore.className = 'score-cell';
                    tdScore.textContent = (data.score || 0).toLocaleString();

                    tr.appendChild(tdRank);
                    tr.appendChild(tdName);
                    tr.appendChild(tdScore);
                    tbody.appendChild(tr);

                    rank++;
                });
            }).catch(err => {
                console.error("[Firestore] Error reading scores:", err);
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#E74C3C; padding:20px 0;">Warzone leaderboard retrieval error.</td></tr>';
            });
    }

    // Helper to escape HTML characters
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Setup input restrictions (letters only, uppercase)
    document.addEventListener('DOMContentLoaded', () => {
        const nameInput = document.getElementById('pilot-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                nameInput.value = nameInput.value.toUpperCase().replace(/[^A-Z]/g, '');
            });
        }

        // Setup Submit button handler
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitScore);
        }

        // Setup Skip button handler
        const skipBtn = document.getElementById('skip-submit-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                fetchAndRenderScores();
                const submissionSection = document.getElementById('new-high-score-section');
                const viewSection = document.getElementById('leaderboard-view-section');
                if (submissionSection) submissionSection.classList.add('hidden');
                if (viewSection) viewSection.classList.remove('hidden');
            });
        }

        // Setup Play Again button handler
        const playAgainBtn = document.getElementById('modal-play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                window.Voyager.resetGame();
            });
        }

        // Setup Manual View Leaderboard button (from header)
        const headerLeaderboardBtn = document.getElementById('header-leaderboard-btn');
        if (headerLeaderboardBtn) {
            headerLeaderboardBtn.addEventListener('click', () => {
                fetchAndRenderScores();
                const overlay = document.getElementById('leaderboard-screen');
                if (overlay) overlay.classList.add('active');
                const submissionSection = document.getElementById('new-high-score-section');
                const viewSection = document.getElementById('leaderboard-view-section');
                if (submissionSection) submissionSection.classList.add('hidden');
                if (viewSection) viewSection.classList.remove('hidden');
            });
        }

        // Hide "Clear Logs" button for shared Firestore leaderboard
        const resetBtn = document.getElementById('modal-reset-btn');
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }

        // Setup modal close buttons click handlers
        const closeBtnTop = document.getElementById('modal-close-btn-top');
        const closeBtnBottom = document.getElementById('modal-close-btn-bottom');
        const overlay = document.getElementById('leaderboard-screen');

        const hideOverlay = () => {
            if (overlay) overlay.classList.remove('active');
        };

        if (closeBtnTop) closeBtnTop.addEventListener('click', hideOverlay);
        if (closeBtnBottom) closeBtnBottom.addEventListener('click', hideOverlay);
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) hideOverlay();
            });
        }
    });

    // 4. Global Keyboard handler: Enter restarts the game when active
    window.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('leaderboard-screen');
        if (overlay && overlay.classList.contains('active')) {
            if (e.key === 'Enter') {
                const submissionSection = document.getElementById('new-high-score-section');
                if (submissionSection && !submissionSection.classList.contains('hidden')) {
                    // Try submitting score
                    submitScore();
                } else {
                    // Relaunch/restart game
                    window.Voyager.resetGame();
                }
                e.preventDefault();
            }
        }
    });
})();
