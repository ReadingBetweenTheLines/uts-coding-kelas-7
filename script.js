const quizApp = {
    studentName: "",
    startTime: null,
    sortArrays: {}, 
    guessGames: {}, 
    selectedBlock: null, // BARU: Untuk mengingat balok mana yang sedang diketuk/dipegang
    
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
        
        { id: "q6", type: "text", topic: "🧱 Insertion Sort", text: "Istilah lain dari mengambil satu balok dan menaruhnya di sela-sela yang pas adalah m_ _ _ _ _ _ _ _ _ _ (Isi kata yang hilang!)" },
        
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

    startQuiz() {
        const nameInput = document.getElementById('student-name').value.trim();
        if (!nameInput) return alert("Tolong masukkan namamu dulu untuk memulai! 😊");

        // Kunci Anti-Refresh
        if (localStorage.getItem('uts_coding_started') === 'true') {
            alert("Akses ditolak! Kamu sudah pernah mencoba masuk ke ujian ini.");
            return;
        }
        localStorage.setItem('uts_coding_started', 'true');

        this.studentName = nameInput;
        this.startTime = new Date();
        document.getElementById('display-name').textContent = this.studentName;
        
        this.renderQuestions();
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

            if (q.type === "text") {
                html += `<input type="text" id="${q.id}" placeholder="Ketik jawabanmu di sini...">`;
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
                    this.guessGames[q.id] = {
                        target: Math.floor(Math.random() * 100) + 1,
                        guesses: [], solved: false
                    };
                }
            }

            card.innerHTML = html;
            container.appendChild(card);

            if (q.type === "sort-blocks") {
                if (!this.sortArrays[q.id]) this.sortArrays[q.id] = [...q.initialArray]; 
                this.renderBlocks(q);
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
    },

    // --- LOGIKA KETUK (TAP) UNTUK SMARTPHONE ---
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

            // Jika balok ini sedang dipilih, beri kelas 'selected' agar melayang
            if (this.selectedBlock && this.selectedBlock.qId === qId && this.selectedBlock.index === index) {
                block.classList.add('selected');
            }

            // Aksi saat balok diketuk di layar HP
            block.onclick = () => {
                // Kondisi 1: Belum ada balok yang dipegang
                if (!this.selectedBlock) {
                    this.selectedBlock = { qId: qId, index: index };
                    this.renderBlocks(q); 
                } 
                // Kondisi 2: Batal memilih balok yang sama
                else if (this.selectedBlock.qId === qId && this.selectedBlock.index === index) {
                    this.selectedBlock = null;
                    this.renderBlocks(q);
                } 
                // Kondisi 3: Menukar/Menyisipkan dengan balok target
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
                        this.selectedBlock = null; // Lepaskan pegangan
                        this.renderBlocks(q);
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

        // Kumpulkan data ke dalam satu teks panjang
        let logOutput = `== HASIL UJIAN UTS ==\nSiswa: ${this.studentName}\nMulasi: ${this.startTime.toLocaleTimeString('id-ID')}\nSelesai: ${new Date().toLocaleTimeString('id-ID')}\n-----------------------\n`;

        this.questions.forEach((q, index) => {
            let answer = "Belum dijawab";
            if (q.type === "text") {
                const inputVal = document.getElementById(q.id).value.trim();
                if (inputVal) answer = inputVal;
            } else if (q.type === "sort-blocks") {
                answer = `Susunan Akhir (${q.sortType}): [${this.sortArrays[q.id].join(", ")}]`;
            } else if (q.type === "guess-game") {
                const game = this.guessGames[q.id];
                answer = `[${game.solved ? "DITEMUKAN" : "MENYERAH"}] Target: ${game.target} | Tebakan: [${game.guesses.join(", ")}]`;
            }
            logOutput += `Q${index + 1}: ${answer}\n`;
        });

        document.getElementById('final-log').value = logOutput;
        document.getElementById('screen-quiz').classList.remove('active');
        document.getElementById('screen-final').classList.add('active');

        // ==========================================
        // FITUR PENGIRIMAN OTOMATIS KE FORMSPREE
        // ==========================================
        // Ganti URL di bawah ini dengan URL Formspree milikmu sendiri nanti
        const formspreeURL = "https://formspree.io/f/meerkkra"; 

        try {
            await fetch(formspreeURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    NamaSiswa: this.studentName,
                    Pesan: logOutput // Mengirim log lengkap ke tabelmu
                })
            });
            alert("Jawaban berhasil terkirim ke server Bapak Guru! Silakan tutup halaman ini.");
        } catch (error) {
            alert("Gagal mengirim otomatis karena koneksi. Silakan copy teks hasil dan kirim secara manual ke Bapak Guru.");
        }
    }
};

// Cek kunci saat web baru dibuka
window.onload = () => {
    if (localStorage.getItem('uts_coding_started') === 'true') {
        document.getElementById('screen-login').innerHTML = `
            <h1 style="color: var(--secondary);">⛔ Akses Ditolak</h1>
            <p>Sistem mendeteksi bahwa kamu sudah menyelesaikan atau me-refresh ujian ini.</p>
        `;
    }
};