const quizApp = {
    studentName: "",
    studentClass: "",
    startTime: null,
    sortArrays: {}, 
    guessGames: {}, 
    selectedBlock: null, 
    
    questions: [
        { id: "q1", type: "text", topic: "💡 Angka Biner", text: "Jika nilai tempatnya adalah 8, 4, 2, 1, angka berapakah kode biner '1010' di dunia nyata?" },
        { id: "q2", type: "text", topic: "💡 Angka Biner", text: "Bagaimana cara menulis angka 7 menggunakan 4-bit kode Biner?" },
        { id: "q3", type: "text", topic: "💡 Angka Biner", text: "Jika kamu memiliki 3 bit (tiga saklar), berapakah angka TERBESAR yang bisa kamu buat?" },
        { id: "q4", type: "text", topic: "🧱 Bubble Sort", text: "Di algoritma Bubble Sort, jika balok kiri LEBIH BESAR dari balok kanan, apa yang harus dilakukan?" },
        
        {
            id: "q5", type: "sort-blocks", sortType: "bubble", topic: "🧱 Praktik Bubble Sort",
            text: "Urutkan dari terkecil ke terbesar! Ketuk balok pertama, lalu ketuk balok di sebelahnya untuk menukar (swap) posisi mereka.",
            initialArray: [45, 12, 89, 33, 17, 56, 7, 68, 22, 91, 5] 
        },
        
        { id: "q6", type: "text", topic: "🧱 Insertion Sort", text: "Apa pengertian dari Insertion Sort?" },
        
        {
            id: "q7", type: "sort-blocks", sortType: "insertion", topic: "🧱 Praktik Insertion Sort",
            text: "Gunakan Insertion Sort! Ketuk satu balok untuk memegangnya, lalu ketuk balok lain untuk menyisipkan (insert) ke posisi tersebut. Balok lain akan otomatis bergeser!",
            initialArray: [62, 13, 95, 28, 51, 8, 41, 77, 19, 84, 36]
        },
        
        { id: "q8", type: "text", topic: "🔍 Binary Search", text: "Apa SATU syarat wajib sebelum kita bisa menggunakan metode Binary Search?" },
        { id: "q9", type: "text", topic: "🔍 Binary Search", text: "Apa tujuan utama dari algoritma Binary Search saat mencari data?" },
        
        {
            id: "q10", type: "guess-game", topic: "🔍 Praktik Binary Search (Detektif Angka)",
            text: "Aku menyimpan angka rahasia dari <b>1 sampai 100</b>. Coba temukan angkanya! Gunakan strategi membelah dua. Langkahmu akan dicatat oleh sistem!"
        }
    ],

    // --- NEW: THE AUTO-SAVE SYSTEM ---
    saveState() {
        let state = {
            name: this.studentName,
            kelas: this.studentClass,
            startTime: this.startTime,
            sortArrays: this.sortArrays,
            guessGames: this.guessGames,
            textAnswers: {}
        };
        
        // Grab current text from all input boxes
        this.questions.forEach(q => {
            if (q.type === "text") {
                const el = document.getElementById(q.id);
                if (el) state.textAnswers[q.id] = el.value;
            }
        });
        
        localStorage.setItem('uts_state', JSON.stringify(state));
    },

    checkSavedState() {
        // Check if they already fully completed and submitted it
        if (localStorage.getItem('uts_submitted') === 'true') {
            document.getElementById('screen-login').innerHTML = `
                <h1 style="color: var(--secondary);">⛔ Ujian Selesai</h1>
                <p>Kamu sudah mengumpulkan jawaban ujian ini. Terima kasih!</p>
            `;
            return;
        }

        // Check if they have an active, unfinished session
        const saved = localStorage.getItem('uts_state');
        if (saved) {
            const state = JSON.parse(saved);
            this.studentName = state.name;
            this.studentClass = state.kelas;
            this.startTime = new Date(state.startTime); // Convert back to Date object
            this.sortArrays = state.sortArrays || {};
            this.guessGames = state.guessGames || {};
            
            document.getElementById('display-name').textContent = `${this.studentName} (${this.studentClass})`;
            
            this.renderQuestions();
            
            // Restore text box answers
            this.questions.forEach(q => {
                if (q.type === 'text' && state.textAnswers && state.textAnswers[q.id]) {
                    document.getElementById(q.id).value = state.textAnswers[q.id];
                }
            });

            // Skip login screen
            document.getElementById('screen-login').classList.remove('active');
            document.getElementById('screen-quiz').classList.add('active');
        }
    },
    // ---------------------------------

    startQuiz() {
        const nameInput = document.getElementById('student-name').value.trim();
        const classInput = document.getElementById('student-class').value.trim(); 
        
        if (!nameInput || !classInput) {
            alert("Tolong isi Nama dan Kelasmu dulu ya! 😊");
            return;
        }

        this.studentName = nameInput;
        this.studentClass = classInput; 
        this.startTime = new Date();
        
        document.getElementById('display-name').textContent = `${this.studentName} (${this.studentClass})`;
        
        this.renderQuestions();
        this.saveState(); // Save immediately upon starting
        
        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-quiz').classList.add('active');
    },

    renderQuestions() {
        const container = document.getElementById('questions-container');
        container.innerHTML = ""; 

        this.questions.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = "question-card";
            
            let html = `<h3>${index + 1}. ${q.topic}</h3><p>${q.text}</p>`;

            // Added oninput="quizApp.saveState()" so it saves every time they type a letter
            if (q.type === "text") {
                html += `<input type="text" id="${q.id}" placeholder="Ketik jawabanmu di sini..." oninput="quizApp.saveState()">`;
            } else if (q.type === "sort-blocks") {
                html += `<div class="block-container" id="container-${q.id}"></div>`;
            } else if (q.type === "guess-game") {
                html += `
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <input type="number" id="input-${q.id}" placeholder="Tebak angkanya..." style="margin-top: 0; width: 70%;">
                        <button onclick="quizApp.handleGuess('${q.id}')" style="margin-bottom: 0; width: 30%;">Tebak!</button>
                    </div>
                    <p id="feedback-${q.id}" style="font-weight: bold; color: var(--secondary); margin-top: 15px;">Mulai menebak untuk mendapat petunjuk...</p>
                    <p style="font-size: 0.9em; color: #666;">Riwayat tebakanmu: <span id="history-${q.id}">-</span></p>
                `;
                if (!this.guessGames[q.id]) {
                    this.guessGames[q.id] = { target: Math.floor(Math.random() * 100) + 1, guesses: [], solved: false };
                }
            }

            card.innerHTML = html;
            container.appendChild(card);

            if (q.type === "sort-blocks") {
                if (!this.sortArrays[q.id]) this.sortArrays[q.id] = [...q.initialArray]; 
                this.renderBlocks(q);
            }

            // Restore Guess Game UI if it was loaded from Auto-Save
            if (q.type === "guess-game") {
                const game = this.guessGames[q.id];
                if (game.guesses.length > 0) {
                    document.getElementById(`history-${q.id}`).textContent = game.guesses.join(" ➔ ");
                    if (game.solved) {
                        document.getElementById(`feedback-${q.id}`).textContent = `🎉 TEPAT SEKALI! Angka rahasianya adalah ${game.target}!`;
                        document.getElementById(`feedback-${q.id}`).style.color = "green";
                        document.getElementById(`input-${q.id}`).disabled = true;
                    } else {
                        const lastGuess = game.guesses[game.guesses.length - 1];
                        document.getElementById(`feedback-${q.id}`).textContent = lastGuess < game.target ? `🔼 Lebih BESAR dari ${lastGuess}` : `🔽 Lebih KECIL dari ${lastGuess}`;
                    }
                }
            }
        });
    },

    handleGuess(qId) {
        const game = this.guessGames[qId];
        if (game.solved) return; 

        const inputEl = document.getElementById(`input-${qId}`);
        const feedbackEl = document.getElementById(`feedback-${qId}`);
        const historyEl = document.getElementById(`history-${qId}`);
        
        const guess = parseInt(inputEl.value);
        if (isNaN(guess) || guess < 1 || guess > 100) return;

        game.guesses.push(guess);
        historyEl.textContent = game.guesses.join(" ➔ ");
        inputEl.value = ""; 

        if (guess === game.target) {
            feedbackEl.textContent = `🎉 TEPAT SEKALI! Angka rahasianya adalah ${game.target}!`;
            feedbackEl.style.color = "green";
            game.solved = true;
            inputEl.disabled = true; 
        } else if (guess < game.target) {
            feedbackEl.textContent = `🔼 Angka rahasia LEBIH BESAR dari ${guess}`;
            feedbackEl.style.color = "var(--secondary)";
        } else {
            feedbackEl.textContent = `🔽 Angka rahasia LEBIH KECIL dari ${guess}`;
            feedbackEl.style.color = "var(--secondary)";
        }
        
        this.saveState(); // Auto-save after every guess
    },

    renderBlocks(q) {
        const qId = q.id;
        const blockContainer = document.getElementById(`container-${qId}`);
        blockContainer.innerHTML = ''; 
        const currentArray = this.sortArrays[qId];

        currentArray.forEach((val, index) => {
            const block = document.createElement('div');
            block.className = 'sort-block';
            block.textContent = val;
            block.style.height = `${val + 40}px`; 
            block.style.viewTransitionName = `block-${qId}-${val}`;

            if (this.selectedBlock && this.selectedBlock.qId === qId && this.selectedBlock.index === index) {
                block.classList.add('selected');
            }

            block.onclick = () => {
                if (!this.selectedBlock) {
                    this.selectedBlock = { qId: qId, index: index };
                    this.renderBlocks(q); 
                } 
                else if (this.selectedBlock.qId === qId && this.selectedBlock.index === index) {
                    this.selectedBlock = null;
                    this.renderBlocks(q);
                } 
                else if (this.selectedBlock.qId === qId) {
                    const firstIndex = this.selectedBlock.index;
                    const secondIndex = index;

                    const performSwap = () => {
                        if (q.sortType === "bubble") {
                            if (Math.abs(firstIndex - secondIndex) === 1) {
                                const temp = currentArray[firstIndex];
                                currentArray[firstIndex] = currentArray[secondIndex];
                                currentArray[secondIndex] = temp;
                            } else {
                                alert("Ups! Aturan Bubble Sort: Kamu HANYA boleh menukar balok yang tepat bersebelahan! 🚫");
                            }
                        } else if (q.sortType === "insertion") {
                            const movedItem = currentArray.splice(firstIndex, 1)[0];
                            currentArray.splice(secondIndex, 0, movedItem);
                        }
                        this.selectedBlock = null; 
                        this.renderBlocks(q);
                        this.saveState(); // Auto-save after every block move
                    };

                    if (document.startViewTransition) {
                        document.startViewTransition(() => performSwap());
                    } else {
                        performSwap(); 
                    }
                }
            };
            blockContainer.appendChild(block);
        });
    },

    async submitQuiz() {
        if(!confirm("Apakah kamu yakin sudah selesai dan ingin mengumpulkan jawaban?")) return;

        let answersPayload = {
            nama: this.studentName,
            kelas: this.studentClass, 
            mulai: this.startTime.toLocaleTimeString('id-ID'),
            selesai: new Date().toLocaleTimeString('id-ID')
        };

        let logOutput = `== HASIL UJIAN UTS ==\nSiswa: ${this.studentName}\nKelas: ${this.studentClass}\nMulai: ${this.startTime.toLocaleTimeString('id-ID')}\nSelesai: ${new Date().toLocaleTimeString('id-ID')}\n-----------------------\n`;

        this.questions.forEach((q, index) => {
            let answer = "Belum dijawab";
            if (q.type === "text") {
                const inputVal = document.getElementById(q.id).value.trim();
                if (inputVal) answer = inputVal;
            } else if (q.type === "sort-blocks") {
                answer = `[${this.sortArrays[q.id].join(", ")}]`;
            } else if (q.type === "guess-game") {
                const game = this.guessGames[q.id];
                answer = `[${game.solved ? "DITEMUKAN" : "MENYERAH"}] Target: ${game.target} | Tebakan: [${game.guesses.join(", ")}]`;
            }
            
            answersPayload[`q${index + 1}`] = answer; 
            logOutput += `Q${index + 1}: ${answer}\n`;
        });

        document.getElementById('final-log').value = logOutput;
        document.getElementById('screen-quiz').classList.remove('active');
        document.getElementById('screen-final').classList.add('active');

        // GANTI URL INI DENGAN URL GOOGLE APPS SCRIPT-MU!
        const googleScriptURL = "https://script.google.com/macros/s/KODE_PANJANG_KAMU_DISINI/exec"; 

        try {
            await fetch(googleScriptURL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" }, 
                body: JSON.stringify(answersPayload)
            });
            alert("Jawaban berhasil tersimpan ke sistem Bapak Guru! Silakan tutup halaman ini.");
            
            // Lock them out permanently now that the data is sent successfully
            localStorage.removeItem('uts_state'); 
            localStorage.setItem('uts_submitted', 'true');

        } catch (error) {
            alert("Gagal mengirim otomatis karena koneksi. Silakan copy teks hasil dan kirim secara manual ke Bapak Guru.");
        }
    }
};

// Fire the check when the page loads
window.onload = () => {
    quizApp.checkSavedState();
};