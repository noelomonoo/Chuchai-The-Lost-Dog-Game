/* =========================================================
   CHUCHAI: THE LOST DOG
   IMPROVED GAME JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   SETTINGS
========================================================= */

const AUDIO_PATH = "audio/background-music.wav";

const AUDIO_VOLUME = 0.4;

/*
    Chuchai can survive 8 mistakes.

    0 - 3 mistakes:
    Chuchai is safe.

    4 - 6:
    Chuchai becomes worried/tired.

    7:
    Chuchai is very close to getting lost.

    8:
    BAD ENDING.
*/

const MAX_MISTAKES = 8;


/* =========================================================
   DOM
========================================================= */

const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

const mistakeCounter =
    document.getElementById("mistake-counter");

const healthFill =
    document.getElementById("health-fill");

const modal =
    document.getElementById("game-modal");

const modalTitle =
    document.getElementById("modal-title");

const modalMessage =
    document.getElementById("modal-message");

const modalButton =
    document.getElementById("modal-button");

const modalIcon =
    document.getElementById("modal-icon");


/* =========================================================
   MUSIC
========================================================= */

music.src = AUDIO_PATH;
music.volume = AUDIO_VOLUME;

let musicOn = false;

function startMusic() {

    if (musicOn) {
        return;
    }

    music.play()
        .then(() => {

            musicOn = true;

            musicToggle.textContent =
                "🔊 Music On";

        })
        .catch(() => {

            /*
                Browser blocked autoplay.

                The user can click the music button.
            */

        });
}


musicToggle.addEventListener("click", () => {

    if (musicOn) {

        music.pause();

        musicOn = false;

        musicToggle.textContent =
            "🔇 Music Off";

    } else {

        startMusic();

    }

});


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    currentScene: "scene-start",

    mistakes: 0,

    completedScenes: new Set(),

    cluesFound: new Set(),

    pawProgress: 0,

    gameOver: false,

    choiceMade: {

        scene1: false,
        scene2: false,
        scene4: false

    }

};


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    state.currentScene = "scene-start";

    state.mistakes = 0;

    state.completedScenes.clear();

    state.cluesFound.clear();

    state.pawProgress = 0;

    state.gameOver = false;

    state.choiceMade.scene1 = false;
    state.choiceMade.scene2 = false;
    state.choiceMade.scene4 = false;


    /* Reset all scenes */

    document.querySelectorAll(".scene").forEach(scene => {

        scene.classList.remove("active");

    });


    /* Reset normal choices */

    document.querySelectorAll(".choice").forEach(choice => {

        choice.classList.remove(
            "correct",
            "wrong"
        );

        choice.disabled = false;

    });


    /* Reset clues */

    document.querySelectorAll(".clue").forEach(clue => {

        clue.classList.remove(
            "found",
            "wrong"
        );

        clue.disabled = false;

    });


    /* Reset paws */

    document.querySelectorAll(".paw").forEach(paw => {

        paw.classList.remove(
            "followed",
            "wrong"
        );

        paw.disabled = false;

    });


    /* Reset buttons */

    document.querySelectorAll(".next-button").forEach(button => {

        button.classList.add("locked");

    });


    /* Reset feedback */

    document.querySelectorAll(".feedback").forEach(feedback => {

        feedback.textContent = "";

        feedback.className = "feedback";

    });


    updateStatus();

    updateProgress();


    /* Ensure the start card is unique and visible only on the start scene */
    ensureSingleStartCard();

    /* Re-enable the start button when resetting */
    const startBtn = document.getElementById("start-game");
    if (startBtn) startBtn.disabled = false;

    showScene("scene-start");

}


/* Make sure only one start-card exists and it lives under #scene-start */
function ensureSingleStartCard() {
    const cards = Array.from(document.querySelectorAll('.start-card'));
    if (cards.length === 0) return;
    const first = cards[0];
    // Remove duplicates
    for (let i = 1; i < cards.length; i++) {
        cards[i].remove();
    }
    // Ensure the first card is inside the scene-start container
    const startScene = document.getElementById('scene-start');
    if (startScene && !startScene.contains(first)) {
        // Remove any existing start-card in scene-start then append
        const existing = startScene.querySelector('.start-card');
        if (existing) existing.remove();
        startScene.appendChild(first);
    }
}


/* =========================================================
   STATUS
========================================================= */

function updateStatus() {

    mistakeCounter.textContent =
        `Mistakes: ${state.mistakes} / ${MAX_MISTAKES}`;


    const remaining =
        Math.max(
            0,
            100 -
            (state.mistakes / MAX_MISTAKES) * 100
        );


    healthFill.style.width =
        `${remaining}%`;


    if (state.mistakes >= 6) {

        healthFill.style.background =
            "#d9534f";

    } else if (state.mistakes >= 4) {

        healthFill.style.background =
            "#f29f4b";

    } else {

        healthFill.style.background =
            "#58b96c";

    }
}


/* =========================================================
   ADD MISTAKE
========================================================= */

function addMistake(reason = "") {

    if (state.gameOver) {
        return;
    }

    state.mistakes++;

    updateStatus();


    /*
        Give the player feedback depending
        on how close Chuchai is to being lost.
    */

    if (state.mistakes === 3) {

        showModal(
            "⚠️",
            "Chuchai Is Getting Worried",
            "Chuchai has made several wrong choices. He is starting to feel scared and doesn't know where his family is.",
            "Keep Going 🐾"
        );

    }


    if (state.mistakes === 5) {

        showModal(
            "😟",
            "Chuchai Is Getting Tired",
            "Chuchai is hungry and tired. Please be careful with your next choices.",
            "I'll Be Careful ❤️"
        );

    }


    if (state.mistakes === 7) {

        showModal(
            "🌙",
            "Chuchai Is Almost Lost",
            "The sun is going down. Chuchai is very hungry, frightened, and confused. One more serious mistake could make him lose his way completely.",
            "Find the Way Home 🐾"
        );

    }


    if (state.mistakes >= MAX_MISTAKES) {

        setTimeout(() => {

            triggerBadEnding();

        }, 500);

    }

}


/* =========================================================
   BAD ENDING
========================================================= */

function triggerBadEnding() {

    if (state.gameOver) {
        return;
    }

    state.gameOver = true;


    showScene("scene-lost");


    document.querySelectorAll("button").forEach(button => {

        if (
            button.id !== "try-again" &&
            button.id !== "start-over" &&
            button.id !== "music-toggle"
        ) {

            button.disabled = true;

        }

    });


    updateProgress();

}


/* =========================================================
   SHOW SCENE
========================================================= */

function showScene(sceneId) {

    if (state.gameOver && sceneId !== "scene-lost") {
        return;
    }


    document.querySelectorAll(".scene").forEach(scene => {

        scene.classList.remove("active");

    });


    const scene =
        document.getElementById(sceneId);


    if (!scene) {
        return;
    }


    scene.classList.add("active");

    state.currentScene = sceneId;

    // Hide the start card unless we're on the start scene
    document.querySelectorAll('.start-card').forEach(card => {
        card.hidden = sceneId !== 'scene-start';
    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    updateProgress();


    if (sceneId === "scene-6") {

        renderFinalResult();

    }

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress() {

    const currentSceneNumber =
        Number(
            state.currentScene
                .replace("scene-", "")
        );


    document.querySelectorAll(".progress-dot")
        .forEach((dot, index) => {

            const number = index + 1;

            dot.classList.toggle(
                "is-current",
                number === currentSceneNumber
            );

            dot.classList.toggle(
                "is-done",
                number < currentSceneNumber
            );

        });

}


/* =========================================================
   MODAL
========================================================= */

let modalCallback = null;


function showModal(
    icon,
    title,
    message,
    buttonText = "Continue",
    callback = null
) {

    modalIcon.textContent = icon;

    modalTitle.textContent = title;

    modalMessage.textContent = message;

    modalButton.textContent = buttonText;

    modalCallback = callback;

    modal.classList.remove("hidden");

}


modalButton.addEventListener("click", () => {

    modal.classList.add("hidden");

    startMusic();

    if (modalCallback) {

        const callback = modalCallback;

        modalCallback = null;

        callback();

    }

});


/* =========================================================
   START GAME
========================================================= */

document
    .getElementById("start-game")
    .addEventListener("click", () => {

        startMusic();

        // Prevent double-activating the start button which could clone or
        // duplicate start UI in some setups.
        const btn = document.getElementById("start-game");
        if (btn) btn.disabled = true;

        showScene("scene-1");

    });


/* =========================================================
   NORMAL SCENE CHOICES
========================================================= */

function setupChoiceScene(
    sceneId,
    choiceStateName,
    feedbackText
) {

    const scene =
        document.getElementById(sceneId);

    const choices =
        scene.querySelectorAll(".choice");

    const feedback =
        scene.querySelector(".feedback");

    const nextButton =
        scene.querySelector(".next-button");


    choices.forEach(choice => {

        choice.addEventListener("click", () => {

            startMusic();


            if (state.choiceMade[choiceStateName]) {
                return;
            }


            const isCorrect =
                choice.dataset.correct === "true";


            /* =========================================
               CORRECT CHOICE
            ========================================= */

            if (isCorrect) {

                choice.classList.add("correct");

                feedback.textContent =
                    "✅ " +
                    (
                        choice.dataset.message ||
                        feedbackText
                    );

                feedback.className =
                    "feedback good";


                state.choiceMade[choiceStateName] = true;

                state.completedScenes.add(sceneId);


                nextButton.classList.remove("locked");

                /*
                    Disable the choices after a correct
                    answer so the player doesn't change
                    the story.
                */

                choices.forEach(button => {

                    button.disabled = true;

                });

            }


            /* =========================================
               WRONG CHOICE
            ========================================= */

            else {

                choice.classList.add("wrong");

                feedback.textContent =
                    "❌ " +
                    (
                        choice.dataset.message ||
                        "That was not a good choice."
                    );

                feedback.className =
                    "feedback bad";


                addMistake();


                /*
                    Remove the red animation after a moment.
                */

                setTimeout(() => {

                    choice.classList.remove("wrong");

                }, 600);

            }

        });

    });


    nextButton.addEventListener("click", () => {

        if (nextButton.classList.contains("locked")) {
            return;
        }

        startMusic();

        const nextScene =
            nextButton.dataset.next;

        showScene(nextScene);

    });

}


/* =========================================================
   SCENE 1
========================================================= */

setupChoiceScene(
    "scene-1",
    "scene1",
    "Chuchai made a good choice!"
);


/* =========================================================
   SCENE 2
========================================================= */

setupChoiceScene(
    "scene-2",
    "scene2",
    "Chuchai found a safer direction!"
);


/* =========================================================
   SCENE 4
========================================================= */

setupChoiceScene(
    "scene-4",
    "scene4",
    "The owners found a useful clue!"
);


/* =========================================================
   SCENE 3 — CLUE GAME
========================================================= */

const clueScene =
    document.getElementById("scene-3");

const clues =
    clueScene.querySelectorAll(".clue");

const clueFeedback =
    clueScene.querySelector(".feedback");

const clueNext =
    clueScene.querySelector(".next-button");


const TOTAL_CORRECT_CLUES = 3;


function updateClueProgress() {

    const found =
        state.cluesFound.size;


    if (found === TOTAL_CORRECT_CLUES) {

        clueFeedback.textContent =
            "✨ All 3 clues found! They remind Chuchai of home!";

        clueFeedback.className =
            "feedback good";


        clueNext.classList.remove("locked");

        state.completedScenes.add("scene-3");

    } else {

        clueFeedback.textContent =
            `🔎 Clues found: ${found}/3`;

        clueFeedback.className =
            "feedback";

    }

}


clues.forEach(clue => {

    clue.addEventListener("click", () => {

        startMusic();


        if (state.cluesFound.has(
            clue.querySelector("strong").textContent
        )) {

            return;

        }


        const isCorrect =
            clue.dataset.correct === "true";


        const clueName =
            clue.querySelector("strong").textContent;


        /* =========================================
           CORRECT CLUE
        ========================================= */

        if (isCorrect) {

            state.cluesFound.add(clueName);

            clue.classList.add("found");

            clue.disabled = true;

            updateClueProgress();

        }


        /* =========================================
           WRONG CLUE
        ========================================= */

        else {

            clue.classList.add("wrong");

            clueFeedback.textContent =
                `❌ ${clueName} is not a useful clue. Chuchai becomes more confused.`;

            clueFeedback.className =
                "feedback bad";


            addMistake();


            setTimeout(() => {

                clue.classList.remove("wrong");

                if (
                    state.cluesFound.size <
                    TOTAL_CORRECT_CLUES
                ) {

                    updateClueProgress();

                }

            }, 700);

        }

    });

});


clueNext.addEventListener("click", () => {

    if (clueNext.classList.contains("locked")) {
        return;
    }

    showScene("scene-4");

});


/* =========================================================
   SCENE 5 — PAW TRAIL
========================================================= */

const paws =
    document.querySelectorAll(".paw");

const trailFeedback =
    document
        .getElementById("scene-5")
        .querySelector(".feedback");

const trailNext =
    document
        .getElementById("scene-5")
        .querySelector(".next-button");


function updateTrail() {

    const progress =
        state.pawProgress;


    if (progress === 0) {

        trailFeedback.textContent =
            "🐾 Start with paw #1.";

        trailFeedback.className =
            "feedback";

    }


    if (progress > 0 && progress < 6) {

        trailFeedback.textContent =
            `🐾 Good! Now find paw #${progress + 1}.`;

        trailFeedback.className =
            "feedback good";

    }


    if (progress === 6) {

        trailFeedback.textContent =
            "🎉 You followed the entire trail! Chuchai's house is nearby!";

        trailFeedback.className =
            "feedback good";


        trailNext.classList.remove("locked");

        state.completedScenes.add("scene-5");

    }

}


paws.forEach(paw => {

    paw.addEventListener("click", () => {

        startMusic();


        if (state.pawProgress >= 6) {
            return;
        }


        const pawNumber =
            Number(paw.dataset.paw);


        const expected =
            state.pawProgress + 1;


        /* =========================================
           CORRECT PAW
        ========================================= */

        if (pawNumber === expected) {

            state.pawProgress++;

            paw.classList.add("followed");

            paw.disabled = true;

            updateTrail();

        }


        /* =========================================
           WRONG PAW
        ========================================= */

        else {

            paw.classList.add("wrong");

            addMistake();


            /*
                Reset the trail after a wrong step.
            */

            state.pawProgress = 0;


            trailFeedback.textContent =
                `❌ Paw #${pawNumber} was wrong! Chuchai lost the trail. Start again at paw #1.`;

            trailFeedback.className =
                "feedback bad";


            setTimeout(() => {

                paws.forEach(p => {

                    p.classList.remove(
                        "followed",
                        "wrong"
                    );

                    p.disabled = false;

                });


                updateTrail();

            }, 700);

        }

    });

});


trailNext.addEventListener("click", () => {

    if (trailNext.classList.contains("locked")) {
        return;
    }

    showScene("scene-6");

});


/* =========================================================
   FINAL RESULT
========================================================= */

function renderFinalResult() {

    const result =
        document.getElementById("final-result");


    const mistakes =
        state.mistakes;


    let stars;

    let message;


    if (mistakes === 0) {

        stars = "⭐⭐⭐⭐⭐";

        message =
            "PERFECT ADVENTURE! Chuchai made it home without a single mistake!";

    }

    else if (mistakes <= 2) {

        stars = "⭐⭐⭐⭐";

        message =
            "Amazing! Chuchai made it home safely with only a few mistakes.";

    }

    else if (mistakes <= 4) {

        stars = "⭐⭐⭐";

        message =
            "Good job! Chuchai made it home, although the journey was difficult.";

    }

    else if (mistakes <= 6) {

        stars = "⭐⭐";

        message =
            "Chuchai made it home, but he was very tired and scared along the way.";

    }

    else {

        stars = "⭐";

        message =
            "Chuchai barely made it home. He was hungry, tired, and frightened.";

    }


    result.innerHTML = `

        <div class="final-score">

            <h3>Your Adventure Score</h3>

            <div class="score-stars">
                ${stars}
            </div>

            <p>
                <strong>
                    Mistakes: ${mistakes}
                </strong>
            </p>

            <p>
                ${message}
            </p>

        </div>

    `;

}


/* =========================================================
   PLAY AGAIN
========================================================= */

document
    .getElementById("play-again")
    .addEventListener("click", () => {

        resetGame();

    });


document
    .getElementById("try-again")
    .addEventListener("click", () => {

        /*
            Re-enable all buttons first because
            bad ending disables them.
        */

        document.querySelectorAll("button")
            .forEach(button => {

                button.disabled = false;

            });


        resetGame();
        showScene("scene-1");

    });


document
    .getElementById("start-over")
    .addEventListener("click", () => {

        document.querySelectorAll("button")
            .forEach(button => {

                button.disabled = false;

            });

        resetGame();
        showScene("scene-1");

    });


/* =========================================================
   INITIALIZE
========================================================= */

resetGame();