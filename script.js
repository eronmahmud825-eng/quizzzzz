// =========================
// LOGIN PAGE
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const user = {
                name: document.getElementById("username").value,
                email: document.getElementById("email").value,
            };

            localStorage.setItem("currentUser", JSON.stringify(user));

            window.location.href = "quiz.html";
        });
    }

    loadQuizPage();
    loadResultsPage();
    loadRankingPage();
});

// =========================
// QUESTION POOL 100+
// =========================
const questions = [
    // --- EASY
    { q: "Erling Haaland is from which country?", a: "Norway", o: ["Denmark", "Sweden", "Germany"] },
    { q: "Which club does Lionel Messi play for in 2023?", a: "Inter Miami", o: ["Barcelona", "PSG", "Chelsea"] },
    { q: "Who won the World Cup 2022?", a: "Argentina", o: ["France", "Brazil", "Germany"] },
    { q: "Who is known as CR7?", a: "Cristiano Ronaldo", o: ["Messi", "Neymar", "Bale"] },
    { q: "Which club is Mohamed Salah playing for?", a: "Liverpool", o: ["Arsenal", "Real Madrid", "PSG"] },
    { q: "Which country hosted World Cup 2018?", a: "Russia", o: ["Qatar", "Brazil", "Germany"] },
    { q: "Who is the coach of Manchester City?", a: "Pep Guardiola", o: ["Jurgen Klopp", "Arteta", "Ancelotti"] },
    { q: "Which club has the most Champions League titles?", a: "Real Madrid", o: ["Barcelona", "AC Milan", "Liverpool"] },
    { q: "Which country did Ronaldo Nazário play for?", a: "Brazil", o: ["Spain", "Portugal", "Argentina"] },
    { q: "Who is the captain of Portugal?", a: "Cristiano Ronaldo", o: ["Bruno Fernandes", "Pepe", "Cancelo"] },
    // --- NORMAL
    { q: "Which club did Haaland play for before Manchester City?", a: "Borussia Dortmund", o: ["RB Leipzig", "PSG", "Monaco"] },
    { q: "Which country has won the most World Cups?", a: "Brazil", o: ["Germany", "Italy", "Argentina"] },
    { q: "What year did Messi win his first Ballon d'Or?", a: "2009", o: ["2010", "2008", "2011"] },
    { q: "Which country hosted Euro 2016?", a: "France", o: ["Germany", "Portugal", "Italy"] },
    { q: "Who won the Champions League 2019?", a: "Liverpool", o: ["Tottenham", "Barcelona", "Juventus"] },
    { q: "What position does Luka Modric play?", a: "Midfielder", o: ["Striker", "Defender", "Goalkeeper"] },
    { q: "Who is the all-time top scorer in the Premier League?", a: "Alan Shearer", o: ["Wayne Rooney", "Harry Kane", "Salah"] },
    { q: "Which country won Euro 2016?", a: "Portugal", o: ["France", "Germany", "Italy"] },
    { q: "Which club is known as 'The Red Devils'?", a: "Manchester United", o: ["Liverpool", "Arsenal", "Chelsea"] },
    { q: "Which country won Copa America 2021?", a: "Argentina", o: ["Brazil", "Uruguay", "Chile"] },
    // --- HARD
    { q: "Who scored the 'Hand of God' goal?", a: "Diego Maradona", o: ["Pele", "Messi", "Ronaldinho"] },
    { q: "Which club did Zlatan Ibrahimović NOT play for?", a: "Real Madrid", o: ["Barcelona", "PSG", "AC Milan"] },
    { q: "Which year was the first World Cup held?", a: "1930", o: ["1940", "1920", "1934"] },
    { q: "Which country has the most Copa América titles?", a: "Uruguay", o: ["Brazil", "Argentina", "Chile"] },
    { q: "Who scored the fastest hat-trick in Premier League history?", a: "Sadio Mané", o: ["Henry", "Aguero", "Salah"] },
    { q: "Which club has the nickname 'The Old Lady'?", a: "Juventus", o: ["Inter Milan", "AC Milan", "Roma"] },
    { q: "Who won the first Ballon d'Or?", a: "Stanley Matthews", o: ["Puskas", "Di Stefano", "Pele"] },
    { q: "Which manager won the treble with Manchester United?", a: "Sir Alex Ferguson", o: ["Pep Guardiola", "Jose Mourinho", "Van Gaal"] },
    { q: "Who scored in the 2014 World Cup final for Germany?", a: "Mario Götze", o: ["Muller", "Kroos", "Reus"] },
    { q: "Which player has the most assists in Premier League history?", a: "Ryan Giggs", o: ["De Bruyne", "Lampard", "Scholes"] },
    // ADDITIONAL 60+ QUESTIONS CAN BE APPENDED
];

// =========================
// QUIZ SYSTEM VARIABLES
// =========================
let quizIndex = 0;
let score = 0;
let selected20 = [];
let timer = 30;
let interval;

// =========================
// QUIZ PAGE LOAD
// =========================
function loadQuizPage() {
    const box = document.getElementById("quizBox");
    if (!box) return;

    // select 20 random unique questions
    selected20 = [...questions].sort(() => 0.5 - Math.random()).slice(0, 20);
    showQuestion();
}

// =========================
// SHOW QUESTION
// =========================
function showQuestion() {
    if (quizIndex >= selected20.length) {
        return finishQuiz();
    }

    timer = 30;
    document.getElementById("timer").innerText = timer;

    clearInterval(interval);
    interval = setInterval(() => {
        timer--;
        document.getElementById("timer").innerText = timer;
        if (timer <= 0) {
            nextQuestion(false);
        }
    }, 1000);

    const q = selected20[quizIndex];
    const options = [...q.o, q.a].sort(() => 0.5 - Math.random());

    document.getElementById("quizBox").innerHTML = `
        <h4>${quizIndex + 1}. ${q.q}</h4>
        ${options.map(op => `
            <button class="btn btn-warning option-btn" onclick="nextQuestion('${op}')">${op}</button>
        `).join("")}
    `;
}

// =========================
// NEXT QUESTION
// =========================
function nextQuestion(answer) {
    clearInterval(interval);

    if (answer === selected20[quizIndex].a) {
        score += 2;
    }

    quizIndex++;
    showQuestion();
}

// =========================
// FINISH QUIZ
// =========================
function finishQuiz() {
    localStorage.setItem("finalScore", score);
    localStorage.setItem("answersList", JSON.stringify(selected20));
    window.location.href = "result.html";
}

// =========================
// RESULT PAGE
// =========================
function loadResultsPage() {
    const sc = document.getElementById("score");
    if (!sc) return;

    const scoreValue = localStorage.getItem("finalScore");
    const list = JSON.parse(localStorage.getItem("answersList"));

    sc.innerText = `Score: ${scoreValue} / 40`;

    let html = "";
    list.forEach(q => {
        html += `<div class="card p-3 bg-secondary text-white my-2">
            <h5>${q.q}</h5>
            <p><b>Correct Answer:</b> ${q.a}</p>
        </div>`;
    });

    document.getElementById("answers").innerHTML = html;

    saveToRanking(scoreValue);
}

// =========================
// RANKING SYSTEM
// =========================
function saveToRanking(score) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    let rank = JSON.parse(localStorage.getItem("ranking")) || [];

    rank.push({ name: user.name, score: Number(score) });

    rank.sort((a, b) => b.score - a.score);

    localStorage.setItem("ranking", JSON.stringify(rank));
}

function loadRankingPage() {
    const body = document.getElementById("rankBody");
    if (!body) return;

    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    body.innerHTML = ranking.slice(0, 40).map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.name}</td>
            <td>${r.score}</td>
        </tr>
    `).join("");
}