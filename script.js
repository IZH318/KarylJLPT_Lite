const questions = {}; // 문제들을 저장할 객체
let score = 0; // 사용자 점수 저장
let selectedDifficulty = ""; // 선택된 난이도 저장
let displayedAnswers = []; // 현재 질문에서 보여진 답변 목록 저장
let selectedDifficulties = []; // 사용자가 선택한 난이도 저장
let totalQuestions = 0; // 전체 문제 수 저장

// UI 요소 초기 상태 설정
function resetElements() {
  console.log("");
  console.log("[SYSTEM] UI 요소 초기 상태 설정");

  // 메인 화면 캐릭터 이미지 표시
  document.querySelector(".partner-image-container").style.display = "block";
  document.querySelector(".partner-image").src = "./asm_partner_01_base.png";

  // 칠판 이미지 위치 조절
  document.getElementById("chalkboardImage").style.top = "50%";

  // 체크박스 초기화
  document.getElementById("JLPT N1").checked = false;
  document.getElementById("JLPT N2").checked = false;
  document.getElementById("JLPT N3").checked = false;
  document.getElementById("JLPT N4").checked = false;
  document.getElementById("JLPT N5").checked = false;
  document.getElementById("필수기초단어").checked = false;

  // 텍스트박스 초기화
  document.getElementById("questionCountInput").value = "";
  document.getElementById("customQuestionCountInput").value = "";

  // 발음 기호 표시 체크박스 초기화
  document.getElementById("showPronunciation").checked = false;
  document.getElementById("customshowPronunciation").checked = false;

  // 출제 문제수 기준 설정 라디오 버튼 체크박스 초기화
  document.getElementById("customQuestionOption1").checked = false;
  document.getElementById("customQuestionOption2").checked = true;

  // Confetti 중지
  StopConfetti(); // Confetti.js 함수 호출

  // 특정 날짜 확인 함수에 지정한 날짜에만 작동
  if (isTodaySpecialDate()) {
    InitializeConfetti(); // Confetti.js 함수 호출
    console.log("[SYSTEM] Confetti.js 실행");
    console.log("[Developer] ☆★캬루의 생일을 축하합니다!★☆"); // 개발자 축하 메시지
  }
}

// 로딩 화면을 보여주는 함수
const showLoadingScreen = () => {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.opacity = "1"; // 투명도 변경
  loadingScreen.style.display = "flex"; // 로딩 화면을 보이게 함
};

// 로딩 화면을 숨기는 함수
const hideLoadingScreen = () => {
  return new Promise((resolve) => {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.classList.remove("hidden"); // 숨김 클래스 제거
    setTimeout(() => {
      loadingScreen.style.opacity = "0"; // 투명도 변경

      setTimeout(() => {
        loadingScreen.style.display = "none"; // 최종적으로 숨김
        resolve();
      }, 500); // 애니메이션 시간과 같게 설정
    }, 300); // 대기 시간
  });
};

// CSV 파일에서 문제 로딩 함수
async function loadQuestions() {
  try {
    const response = await fetch("Questions.csv");
    if (!response.ok) {
      console.log("");
      console.erorr(
        "[SYSTEM] 네트워크 문제 발생(서버 응답이 HTTP 200~299 범위가 아님)"
      );
      throw new Error("네트워크 응답이 올바르지 않습니다."); // 서버 응답이 HTTP 200~299 범위가 아닐 경우 실행
    }
    const csvText = await response.text();

    // PapaParse를 사용하여 CSV 파싱
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row) => {
          const { difficulty, question, pronunciation, answers, correct } = row;
          if (!questions[difficulty]) {
            questions[difficulty] = [];
          }

          questions[difficulty].push({
            question,
            answers: answers.split(";"), // 답변 목록은 세미콜론으로 분리되었다고 가정
            correct,
            pronunciation,
          });
        });
      },
    });
  } catch (error) {
    console.log("");
    console.error("[SYSTEM] Error loading questions:", error);
    console.log("[SYSTEM] 문제 데이터(Questions.csv) 로딩 실패");
    alert("문제 데이터(Questions.csv)를 불러오는 데 실패했습니다.");
  }
}

// 특정 날짜 확인 함수
function isTodaySpecialDate() {
  const today = new Date();
  const specialDate = new Date(today.getFullYear(), 8, 2); // 9월 2일, Month는 0부터 시작(1월 = 0, 12월 = 11)

  console.log("");
  console.log("[SYSTEM] 현재 시스템 날짜:", today.toLocaleDateString()); // 현재 시스템 날짜
  console.log("[SYSTEM] 특정 날짜:", specialDate.toLocaleDateString()); // 특정 날짜

  return (
    today.getDate() === specialDate.getDate() &&
    today.getMonth() === specialDate.getMonth()
  );
}

// 페이지가 로드될 때 필수 리소스 로드
window.onload = async () => {
  console.log("[SYSTEM] 로딩 화면 표시 중...");
  showLoadingScreen(); // 로딩 화면 표시

  // 폰트 로드
  const fontPromises = [
    document.fonts.load("400 1em 'Noto Sans KR'"),
    document.fonts.load("400 1em 'Allison'"),
    document.fonts.load("400 1em 'Noto Serif KR'"),
  ];

  // 이미지 로드
  const partnerImage = new Image();
  partnerImage.src = "./asm_partner_01_base.png";

  const listenButtonImage = new Image();
  listenButtonImage.src = "./pronunciationListenButton.png";

  // 폰트 및 이미지 로드 대기
  await Promise.all([
    new Promise((resolve, reject) => {
      console.log("[SYSTEM] 폰트 로딩 중...");
      document.querySelector("#loading-screen p").innerText = "폰트 로딩 중...";

      Promise.all(fontPromises)
        .then(() => {
          console.log("[SYSTEM] 폰트 로딩 완료");
          document.querySelector("#loading-screen p").innerText =
            "폰트 로딩 완료";
          resolve();
        })
        .catch((error) => {
          console.error("[SYSTEM] 폰트 로딩 실패", error);
          reject();
        });
    }),
    new Promise((resolve, reject) => {
      console.log("[SYSTEM] 이미지 로딩 중...");
      document.querySelector("#loading-screen p").innerText =
        "이미지 로딩 중...";

      let loadedImages = 0;
      const checkComplete = () => {
        loadedImages++;
        if (loadedImages === 2) {
          console.log("[SYSTEM] 이미지 로딩 완료");
          document.querySelector("#loading-screen p").innerText =
            "이미지 로딩 완료";
          resolve();
        }
      };

      partnerImage.onload = checkComplete;
      partnerImage.onerror = () => {
        console.error("[SYSTEM] 메인 화면 캐릭터 이미지 로딩 실패");
        reject();
      };

      listenButtonImage.onload = checkComplete;
      listenButtonImage.onerror = () => {
        console.error("[SYSTEM] 정오표 발음 버튼 이미지 로딩 실패");
        reject();
      };
    }),
  ]);

  // 문제 데이터 로드
  console.log("[SYSTEM] 문제 데이터(Questions.csv) 로딩 중...");
  document.querySelector("#loading-screen p").innerText =
    "문제 데이터 로딩 중...";
  await loadQuestions();
  console.log("[SYSTEM] 문제 데이터(Questions.csv) 로딩 완료");
  document.querySelector("#loading-screen p").innerText =
    "문제 데이터 로딩 완료";

  // 모든 리소스 로딩 완료 메시지 표시
  console.log("[SYSTEM] 모든 리소스 로딩 완료");
  document.querySelector("#loading-screen p").innerText =
    "모든 리소스 로딩 완료";

  // 페이지가 로드된 후 0.5초 대기 후 로딩 화면 숨기기
  await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
  await hideLoadingScreen();
  console.log("[SYSTEM] 로딩 화면 숨김");

  // 나머지 초기화 작업
  resetElements();
  console.log("[SYSTEM] 초기화 작업 완료");
};

// 난이도 선택 확인 팝업 창 표시 함수
function showConfirmation(difficulty) {
  console.log("");
  console.log("[SYSTEM] 난이도 선택 확인 팝업 창 표시");

  selectedDifficulty = difficulty;
  const confirmationMessage = `난이도 '${difficulty}'을(를) 선택하셨습니다.<br><br>계속 하시겠습니까?`;
  document.getElementById("confirmationMessage").innerHTML =
    confirmationMessage;
  document.getElementById("menu").style.display = "none";
  const confirmationContainer = document.getElementById(
    "confirmationContainer"
  );
  confirmationContainer.style.display = "block";
  confirmationContainer.classList.add("show");
}

// 난이도 선택 확인 팝업 창에서 예/아니오 버튼 클릭 시 처리 함수
function confirmSelection(confirm) {
  const confirmationContainer = document.getElementById(
    "confirmationContainer"
  );

  if (confirm) {
    console.log("[SYSTEM] 난이도 선택 확인 팝업 창에서 '예' 버튼 클릭");

    // 선택된 난이도 배열을 초기화하고 새 난이도만 추가
    selectedDifficulties = [selectedDifficulty];

    confirmationContainer.classList.remove("show");
    setTimeout(() => {
      confirmationContainer.style.display = "none";
      showQuestionCountInput(); // 문제 수 입력 창 표시
    }, 120);
  } else {
    confirmationContainer.classList.remove("show");
    console.log("[SYSTEM] 난이도 선택 확인 팝업 창에서 '아니요' 버튼 클릭");

    setTimeout(() => {
      confirmationContainer.style.display = "none";
      document.getElementById("menu").style.display = "flex"; // 메뉴 표시
    }, 120);
  }
}

// 문제 수 입력 팝업 창 표시 함수
function showQuestionCountInput() {
  console.log("");
  console.log("[SYSTEM] 문제 수 입력 팝업 창 표시");

  const questionCountContainer = document.getElementById(
    "questionCountContainer"
  );
  const difficultyInfo = document.getElementById("difficultyInfo");

  // 현재 선택된 난이도와 전체 문제 수 표시
  totalQuestions = questions[selectedDifficulty]
    ? questions[selectedDifficulty].length
    : 0;
  difficultyInfo.innerHTML = `선택된 난이도: ${selectedDifficulty}<br>전체 문제 수: ${totalQuestions}개`;

  questionCountContainer.style.display = "block";
  questionCountContainer.classList.add("show");
}

// 문제 수 입력 후 확인 함수
function confirmQuestionCount() {
  console.log("[SYSTEM] 문제 수 입력 팝업 창에서 '확인' 버튼 클릭");

  const input = document.getElementById("questionCountInput").value;
  let count = parseInt(input, 10);

  // 입력 값이 숫자가 아닌 경우
  if (isNaN(count)) {
    console.log("[SYSTEM] 입력 값이 숫자가 아님");
    alert("올바른 숫자(정수)를 입력해 주세요.");
    return;
  }

  // 입력 값이 1보다 작은 경우
  if (count < 1) {
    console.log("[SYSTEM] 입력 값이 1보다 작음");
    alert("최소 1 이상의 값을 입력하세요.");

    document.getElementById("questionCountInput").value = ""; // 수정된 값을 입력 필드에 반영
    return;
  }

  // 선택된 난이도의 전체 문제 수를 초과하는 경우
  if (count > totalQuestions) {
    count = totalQuestions;
    document.getElementById("questionCountInput").value = count;

    console.log("[SYSTEM] 선택된 난이도의 전체 문제 수 초과");
    alert(
      `선택된 난이도의 전체 문제 수를 초과했습니다.\n` +
        `최대 ${totalQuestions}개의 문제로 자동 설정됩니다.`
    );

    console.log("[SYSTEM] 선택된 난이도의 전체 문제 수로 설정");
    return;
  }

  console.log(`[SYSTEM] 문제 수: ${count}`);

  document.querySelector("#loading-screen p").innerText =
    "문제를 불러오는 중...";
  console.log("[SYSTEM] 문제 불러오는 중...");

  console.log("[SYSTEM] 로딩 화면 표시 중...");
  showLoadingScreen(); // 로딩 화면 표시

  // 로딩 화면 표시된 후 대기 시간 설정
  setTimeout(() => {
    hideLoadingScreen(); // 로딩 화면 숨김
    console.log("[SYSTEM] 로딩 화면 숨김");

    questionCount = count;
    document.getElementById("questionCountContainer").classList.remove("show");

    // 퀴즈 시작
    setTimeout(() => {
      document.getElementById("questionCountContainer").style.display = "none";
      startQuiz(selectedDifficulty);
    }, 120);
  }, 100); // 로딩 화면이 표시된 후 0.1초 대기
}

// 문제 수 입력 취소 함수
function cancelQuestionCount() {
  console.log("[SYSTEM] 문제 수 입력 팝업 창에서 '취소' 버튼 클릭");

  document.getElementById("questionCountContainer").classList.remove("show");
  setTimeout(() => {
    document.getElementById("questionCountContainer").style.display = "none";
    document.getElementById("menu").style.display = "flex";
    document.getElementById("progressContainer").style.display = "none"; // 진행 상태 막대 숨기기
    resetElements();
  }, 120);
}

// 사용자 지정 문제 확인 팝업 창 표시 함수
function startCustomQuiz() {
  console.log("");
  console.log("[SYSTEM] 사용자 지정 문제 확인 팝업 창 표시");

  // 확인 메시지 설정
  const confirmationMessage = `사용자 지정 문제 을(를) 선택하셨습니다.<br><br>계속 하시겠습니까?`;
  document.getElementById("customQuizConfirmationMessage").innerHTML =
    confirmationMessage;

  // 메뉴 숨기기
  document.getElementById("menu").style.display = "none";

  const customQuizConfirmationContainer = document.getElementById(
    "customQuizConfirmationContainer"
  );
  customQuizConfirmationContainer.style.display = "block";
  customQuizConfirmationContainer.classList.add("show");
}

// 사용자 지정 문제 확인 팝업 창에서 '예' 또는 '아니오' 버튼 클릭 시 호출되는 함수
function handleCustomQuizConfirmation(confirm) {
  const customQuizConfirmationContainer = document.getElementById(
    "customQuizConfirmationContainer"
  );
  if (confirm) {
    console.log("[SYSTEM] 사용자 지정 문제 확인 팝업 창에서 '예' 버튼 클릭");

    customQuizConfirmationContainer.classList.remove("show");
    setTimeout(() => {
      customQuizConfirmationContainer.style.display = "none";
      showCustomQuestionCountInput();
    }, 120);
  } else {
    console.log(
      "[SYSTEM] 사용자 지정 문제 확인 팝업 창에서 '아니요' 버튼 클릭"
    );

    customQuizConfirmationContainer.classList.remove("show");
    setTimeout(() => {
      customQuizConfirmationContainer.style.display = "none";
      document.getElementById("menu").style.display = "flex";
    }, 120);
  }
}

// 사용자 지정 문제 설정 팝업 창 표시 함수
function showCustomQuestionCountInput() {
  console.log("");
  console.log("[SYSTEM] 사용자 지정 문제 설정 팝업 창 표시");

  const customQuestionCountContainer = document.getElementById(
    "customQuestionCountContainer"
  );
  customQuestionCountContainer.style.display = "block";
  customQuestionCountContainer.classList.add("show");
  updateDifficultyInfo(); // 체크박스 상태와 문제 수를 업데이트
}

// 사용자 지정 문제 설정 팝업 창에서 '확인' 버튼 클릭 시 호출되는 함수
function confirmCustomQuestionCount() {
  console.log("[SYSTEM] 사용자 지정 문제 설정 팝업 창에서 '확인' 버튼 클릭");

  questionCount = document.getElementById("customQuestionCountInput").value;

  // 난이도가 선택되지 않은 경우
  if (selectedDifficulties.length === 0) {
    console.log("[SYSTEM] 난이도가 선택 되지 않음");
    alert("하나 이상의 난이도를 선택해 주세요.");
    return;
  }

  // 숫자가 아닌 경우
  if (isNaN(questionCount)) {
    console.log("[SYSTEM] 입력 값이 숫자가 아님");
    alert("올바른 숫자(정수)를 입력해 주세요.");
    return;
  }

  // 1보다 작은 경우
  if (questionCount < 1) {
    console.log("[SYSTEM] 입력 값이 1보다 작음");
    alert("최소 1 이상의 값을 입력하세요.");
    document.getElementById("customQuestionCountInput").value = "";
    return;
  }

  // 선택된 난이도의 전체 문제 수 계산
  let totalQuestions = 0;
  selectedDifficulties.forEach((difficulty) => {
    if (questions[difficulty]) {
      totalQuestions += questions[difficulty].length;
    }
  });

  // 전체 문제 수를 초과하는 경우
  if (questionCount > totalQuestions) {
    count = totalQuestions;
    document.getElementById("customQuestionCountInput").value = count; // 문제 수를 최대값으로 조정

    console.log("[SYSTEM] 선택된 난이도의 전체 문제 수 초과");
    alert(
      `선택된 난이도의 전체 문제 수를 초과했습니다.\n` +
        `최대 ${totalQuestions}개의 문제로 자동 설정됩니다.`
    );

    console.log("[SYSTEM] 선택된 난이도의 전체 문제 수로 설정");
    return;
  }

  console.log(`[SYSTEM] 문제 수: ${questionCount}`);

  // 입력 창 숨기기
  const customQuestionCountContainer = document.getElementById(
    "customQuestionCountContainer"
  );

  document.querySelector("#loading-screen p").innerText =
    "사용자 지정 문제를 불러오는 중...";
  console.log("[SYSTEM] 사용자 지정 문제 불러오는 중...");

  console.log("[SYSTEM] 로딩 화면 표시 중...");
  showLoadingScreen(); // 로딩 화면 표시

  // 로딩 화면 표시된 후 대기 시간 설정
  setTimeout(() => {
    hideLoadingScreen();
    console.log("[SYSTEM] 로딩 화면 숨김");

    customQuestionCountContainer.classList.remove("show");

    // 퀴즈 시작
    setTimeout(() => {
      customQuestionCountContainer.style.display = "none";
      startQuiz(); // 퀴즈 시작 함수 호출
    }, 120);
  }, 100); // 로딩 화면이 표시된 후 0.1초 대기
}

// 사용자 지정 문제 설정 팝업 창에서 '취소' 버튼 클릭 시 호출되는 함수
function cancelCustomQuestionCount() {
  console.log("[SYSTEM] 사용자 지정 문제 설정 팝업 창에서 '취소' 버튼 클릭");

  // 입력 창 숨기기
  const customQuestionCountContainer = document.getElementById(
    "customQuestionCountContainer"
  );
  customQuestionCountContainer.classList.remove("show");
  setTimeout(() => {
    customQuestionCountContainer.style.display = "none";
    document.getElementById("menu").style.display = "flex";
    resetElements();
  }, 120);
}

// 사용자 지정 문제 설정 팝업 창에서 체크박스 상태와 문제 수를 업데이트하는 함수
function updateDifficultyInfo() {
  // 체크박스 요소를 선택
  const checkboxes = document.querySelectorAll(
    '#difficultyCheckboxContainer input[type="checkbox"]'
  );
  selectedDifficulties = [];

  // 체크된 체크박스의 값을 수집
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedDifficulties.push(checkbox.value);
    }
  });

  // 선택된 난이도에 따른 문제 수 계산
  totalQuestions = 0;
  selectedDifficulties.forEach((difficulty) => {
    if (questions[difficulty]) {
      totalQuestions += questions[difficulty].length;
    }
  });

  // 문제 수 정보를 표시할 문자열 생성
  const infoText = `선택된 난이도의 전체 문제 수: ${totalQuestions}`;

  // `<p id="customDifficultyInfo"></p>` 요소에 문자열을 설정
  document.getElementById("customDifficultyInfo").innerHTML = infoText;
}

// 사용자 지정 문제 체크박스와 문제 수 입력의 변화를 감지하여 `updateDifficultyInfo`를 호출
document
  .querySelectorAll('#difficultyCheckboxContainer input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", updateDifficultyInfo);
  });

document
  .getElementById("customQuestionCountInput")
  .addEventListener("input", updateDifficultyInfo);

// 입력 필드에서 점(`.`) 자동 삭제 및 마우스 휠로 숫자 증가, 감소 기능을 처리하는 함수
function setupInputHandling(inputId) {
  const inputField = document.getElementById(inputId);

  // 점(`.`) 자동 삭제
  inputField.addEventListener("input", function (event) {
    const input = event.target;
    input.value = input.value.replace(/\./g, "");
  });

  // 마우스 휠로 숫자 증가, 감소
  inputField.addEventListener("wheel", function (event) {
    const input = event.target;
    let value = parseInt(input.value.replace(/\D/g, ""), 10) || 0;

    // 문제 수의 최소값 설정
    const minValue = 1;

    // 선택된 난이도에 따른 최대값 설정
    const maxValue = selectedDifficulties.reduce((total, difficulty) => {
      if (questions[difficulty]) {
        return total + questions[difficulty].length;
      }
      return total;
    }, 0);

    if (event.deltaY < 0) {
      // 값을 증가시키되 최대값을 초과하지 않도록
      value = Math.min(value + 1, maxValue);
    } else if (event.deltaY > 0) {
      // 값을 감소시키되 최소값보다 작아지지 않도록
      value = Math.max(value - 1, minValue);
    }

    // 값 업데이트
    input.value = value;

    // 기본 스크롤 동작 방지
    event.preventDefault();
  });
}

// 문제 수 입력 필드 설정
setupInputHandling("questionCountInput");

// 사용자 지정 문제 수 입력 필드 설정
setupInputHandling("customQuestionCountInput");

// 퀴즈 시작 함수
function startQuiz() {
  console.log("");
  console.log("[SYSTEM] 퀴즈 시작");

  StopConfetti();
  console.log("[SYSTEM] Confetti.js 중지");

  // 문제 출제 옵션 선택
  const mode = document.querySelector(
    'input[name="customQuestionMode"]:checked'
  ).value;

  selectedDifficulties.push(mode); // 선택한 난이도를 배열에 추가 (* 상장 다운로드시 사용)

  // 문제 데이터를 숨기고, 퀴즈 컨테이너 표시
  document.getElementById("confirmationContainer").style.display = "none";
  document.getElementById("questionCountContainer").style.display = "none";
  document.getElementById("quizContainer").style.display = "grid";
  document.getElementById("menu").style.display = "none";

  console.log("[SYSTEM] 진행 상태 막대 표시");
  document.getElementById("progressContainer").style.display = "block"; // 진행 상태 막대 표시

  // 메인 화면 캐릭터 이미지 숨김
  console.log("[SYSTEM] 메인 화면 캐릭터 이미지 숨김");
  document.querySelector(".partner-image-container").style.display = "none";

  // 칠판 이미지 위치 조절
  console.log("[SYSTEM] 칠판 이미지 위치 조절");
  document.getElementById("chalkboardImage").style.top = "45%";

  if (mode === "byDifficulty") {
    // 난이도별 문제 수 지정
    console.log("[SYSTEM] 난이도별 문제 수 지정");
    selectedQuestions = [];
    selectedDifficulties.forEach((difficulty) => {
      if (questions[difficulty] && questions[difficulty].length > 0) {
        selectedQuestions.push(
          ...shuffleArray(questions[difficulty]).slice(0, questionCount)
        );
      }
    });

    // 선택된 문제의 개수가 questionCount보다 적을 경우 처리
    if (selectedQuestions.length < questionCount) {
      console.log("[SYSTEM] 선택 된 문제 수가 지정된 수 보다 적음");
      alert("문제의 수가 지정된 개수보다 적습니다.");
      return;
    }
  } else if (mode === "totalRandom") {
    // 선택된 난이도에서 총 문제를 무작위로 추출
    console.log("[SYSTEM] 선택 된 난이도에서 총 문제 무작위로 추출");
    let allQuestions = [];
    selectedDifficulties.forEach((difficulty) => {
      if (questions[difficulty] && questions[difficulty].length > 0) {
        allQuestions.push(...questions[difficulty]);
      }
    });

    // 문제가 없는 경우 처리
    if (allQuestions.length === 0) {
      console.log("[SYSTEM] 선택한 난이도 문제 없음");
      alert("선택한 난이도에 해당하는 문제가 없습니다.");
      return;
    }

    // 문제를 무작위로 섞고, 지정된 개수만큼 선택합니다.
    console.log("[SYSTEM] 문제 무작위로 섞은 후 지정된 수 만큼 선택");
    selectedQuestions = shuffleArray(allQuestions).slice(0, questionCount);
  }

  // 초기화
  currentQuestionIndex = 0;
  score = 0;
  answersChosen = [];

  // 문제 표시
  displayQuestion();
}

// 문제 표시 함수
function displayQuestion() {
  console.log("");
  console.log("[SYSTEM] 문제 표시");
  if (currentQuestionIndex >= selectedQuestions.length) {
    showResult();
    return;
  }

  const question = selectedQuestions[currentQuestionIndex];
  const showPronunciation =
    document.getElementById("showPronunciation").checked;
  const customshowPronunciation = document.getElementById(
    "customshowPronunciation"
  ).checked;

  let questionText = question.question;
  if (
    (showPronunciation && question.pronunciation) ||
    (customshowPronunciation && question.pronunciation)
  ) {
    questionText = `<span class="questionPronunciation">(${question.pronunciation})</span><br>${questionText}`; // 발음 기호를 먼저 표시
    console.log(`[SYSTEM] 발음 기호 표시: YES`);
  } else {
    questionText = `<br>${questionText}`; // 발음 기호를 먼저 표시
    console.log(`[SYSTEM] 발음 기호 표시: NO`);
  }

  document.getElementById("questionText").innerHTML = questionText;

  // 현재 문제의 정답을 포함한 선택지 생성
  const allAnswers = [question.correct];

  // 다른 문제에서 정답을 무작위로 선택
  const allQuestions = Object.values(questions)
    .flat()
    .filter((q) => q.correct !== question.correct);

  const randomAnswers = shuffleArray(allQuestions.map((q) => q.correct)).slice(
    0,
    3
  );
  allAnswers.push(...randomAnswers);

  // 총 4개의 선택지 배열 생성
  const shuffledAnswers = shuffleArray(allAnswers);

  // 선택지 버튼 생성
  const answersContainer = document.getElementById("answers");
  answersContainer.innerHTML = "";

  // 문제에서 보여진 답변 저장
  displayedAnswers[currentQuestionIndex] = shuffledAnswers.slice(0, 4);

  shuffledAnswers.forEach((answer) => {
    const displayAnswer = answer.replace(/\\n/g, "<br>"); // \\n을 <br>로 대체

    const button = document.createElement("button");
    button.innerHTML = displayAnswer; // HTML을 사용하여 줄 바꿈 적용
    button.classList.add("answer-button");
    button.addEventListener("click", () => selectAnswer(answer)); // 원본 값을 사용
    answersContainer.appendChild(button);
  });

  updateProgress(); // 진행 상태 업데이트
}

// 배열을 무작위로 섞는 함수 (피셔-예이츠 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 사용자가 선택한 답변 처리 함수
function selectAnswer(selectedAnswer) {
  const question = selectedQuestions[currentQuestionIndex];

  console.log("[SYSTEM] 선택된 답변:", selectedAnswer);

  if (selectedAnswer === question.correct) {
    score += 1; // 문제당 1점
  }

  answersChosen[currentQuestionIndex] = selectedAnswer;
  currentQuestionIndex++;
  displayQuestion();
}

// 문제 푸는 중 문제 건너뛰기 버튼 처리 함수
function skipQuestion() {
  console.log("[SYSTEM] 문제 푸는 중 '건너뛰기' 버튼 클릭");
  answersChosen[currentQuestionIndex] = null;
  currentQuestionIndex++;
  displayQuestion();
}

// 문제 푸는 중 처음으로 돌아가기 버튼 클릭 시 확인 팝업 창 표시 함수
function showRestartConfirmation() {
  console.log(
    "[SYSTEM] 문제 푸는 중 처음으로 돌아가기 버튼 클릭 시 팝업 창 표시"
  );
  document.getElementById("quizContainer").style.display = "none";
  const restartConfirmationContainer = document.getElementById(
    "restartConfirmationContainer"
  );
  restartConfirmationContainer.style.display = "block";
  restartConfirmationContainer.classList.add("show");
}

// 문제 푸는 중 처음으로 돌아가기 버튼 누른 후 확인 팝업 창에서 예/아니오 버튼 클릭 시 처리 함수
function confirmRestart(confirm) {
  const restartConfirmationContainer = document.getElementById(
    "restartConfirmationContainer"
  );
  if (confirm) {
    console.log(
      "[SYSTEM] 문제 푸는 중 처음으로 돌아가기 팝업 창에서 '예' 버튼 클릭"
    );
    restartConfirmationContainer.classList.remove("show");
    setTimeout(() => {
      restartConfirmationContainer.style.display = "none";
      restartQuiz();
    }, 120);
  } else {
    console.log(
      "[SYSTEM] 문제 푸는 중 처음으로 돌아가기 팝업 창에서 '아니요' 버튼 클릭"
    );
    restartConfirmationContainer.classList.remove("show");
    setTimeout(() => {
      restartConfirmationContainer.style.display = "none";
      document.getElementById("quizContainer").style.display = "grid";
    }, 120);
  }
}

// 진행 상태 업데이트 함수
function updateProgress() {
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  console.log("[SYSTEM] 진행 상태 막대 업데이트");

  // 현재 진행 상황을 백분율로 계산
  const progressPercentage =
    ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;

  // 진행 상태 막대 업데이트
  progressBar.style.width = `${progressPercentage}%`;
  progressText.innerText = `문제: ${currentQuestionIndex + 1}/${
    selectedQuestions.length
  }`;
}

// 결과 표시 함수
function showResult() {
  const maxScore = selectedQuestions.length; // 총 문제 수를 최대 점수로 설정
  const percentageScore = (score / maxScore) * 100; // 점수를 백분율로 변환
  const formattedScore = percentageScore.toFixed(2); // 소수 둘째 자리까지 포맷팅

  console.log("");
  console.log("[SYSTEM] 결과 불러오는 중...");
  document.querySelector("#loading-screen p").innerText =
    "결과를 불러오는 중...";

  console.log("[SYSTEM] 로딩 화면 표시 중...");
  showLoadingScreen(); // 로딩 화면 표시

  // 메인 화면 캐릭터 이미지 표시
  console.log("[SYSTEM] 메인 화면 캐릭터 이미지 표시");
  document.querySelector(".partner-image-container").style.display = "block";

  // 칠판 이미지 위치 조절
  console.log("[SYSTEM] 칠판 이미지 위치 조절");
  document.getElementById("chalkboardImage").style.top = "50%";

  // 로딩 화면 표시된 후 대기 시간 설정
  setTimeout(() => {
    console.log("[SYSTEM] 로딩 화면 숨김"); // 로딩 화면 숨김 로그

    let resultText = "";
    let resultImageURL = ""; // 이미지 URL 변수를 추가

    if (percentageScore === 0) {
      console.log("[SYSTEM] 점수 0점");
      resultImageURL = "./asm_partner_01_base_face_06.png";
    } else if (percentageScore < 10) {
      console.log("[SYSTEM] 점수 0점 이상, 10점 미만");
      resultImageURL = "./asm_partner_01_base_face_06.png";
    } else if (percentageScore < 20) {
      console.log("[SYSTEM] 점수 10점 이상, 20점 미만");
      resultImageURL = "./asm_partner_01_base_face_03.png";
    } else if (percentageScore < 30) {
      console.log("[SYSTEM] 점수 20점 이상, 30점 미만");
      resultImageURL = "./asm_partner_01_base_face_09.png";
    } else if (percentageScore < 40) {
      console.log("[SYSTEM] 점수 30점 이상, 40점 미만");
      resultImageURL = "./asm_partner_01_base_face_10.png";
    } else if (percentageScore < 50) {
      console.log("[SYSTEM] 점수 40점 이상, 50점 미만");
      resultImageURL = "./asm_partner_01_base_face_07.png";
    } else if (percentageScore < 60) {
      console.log("[SYSTEM] 점수 50점 이상, 60점 미만");
      resultImageURL = "./asm_partner_01_base_face_01.png";
    } else if (percentageScore < 70) {
      console.log("[SYSTEM] 점수 60점 이상, 70점 미만");
      resultImageURL = "./asm_partner_01_base_face_08.png";
    } else if (percentageScore < 80) {
      console.log("[SYSTEM] 점수 70점 이상, 80점 미만");
      resultImageURL = "./asm_partner_01_base_face_02.png";
    } else if (percentageScore < 90) {
      console.log("[SYSTEM] 점수 80점 이상, 90점 미만");
      resultImageURL = "./asm_partner_01_base_face_05.png";
    } else if (percentageScore <= 100) {
      console.log("[SYSTEM] 점수 90점 이상, 100점 이하");

      InitializeConfetti(); // confetti.js 함수 호출
      console.log("[SYSTEM] Confetti.js 실행");
      resultImageURL = "./asm_partner_01_base_face_04.png";
    } else {
      console.log("[SYSTEM] 올바르지 않은 접근으로 결과 표시 화면 접근");
      resultText =
        "(오류) 올바르지 않은 접근입니다.<br><br>메인 화면으로 이동하십시오.";
    }

    document.getElementById(
      "resultText"
    ).innerHTML = `총 점수: ${formattedScore}점<br><br>${resultText}`;

    // 상장 다운로드 버튼 표시
    console.log(
      "[SYSTEM] 점수 90점 이상이면서 선택한 난이도의 전체 문제수 80% 이상일 때 상장 다운로드 버튼 표시"
    );
    console.log(
      "[SYSTEM] (* 전체 문제 수의 80% 계산 시 소수점은 반내림하여 정수로 처리))"
    );
    console.log(`[SYSTEM] 점수: ${percentageScore}`);
    console.log(`[SYSTEM] 문제 수: ${questionCount}`);
    console.log(
      `[SYSTEM] 필요 최소 문제 수: ${Math.floor(totalQuestions * 0.8)}`
    );

    if (
      percentageScore >= 90 &&
      questionCount >= Math.floor(totalQuestions * 0.8)
    ) {
      console.log("[SYSTEM] 조건 충족으로 상장 다운로드 버튼 표시");

      // 상장 다운로드 버튼 표시
      document.getElementById("downloadCertificateButton").style.display =
        "block";
      document.getElementById("downloadCertificateButton").onclick =
        generateCertificate;
    } else {
      console.log("[SYSTEM] 조건 불충족으로 상장 다운로드 버튼 숨김");
      document.getElementById("downloadCertificateButton").style.display =
        "none";
    }

    // 이미지를 로드하고 나서 로딩 화면을 숨김
    const img = new Image();
    img.src = resultImageURL; // 점수에 맞는 이미지 로딩
    img.onload = () => {
      document.querySelector(".partner-image").src = resultImageURL; // 이미지 변경

      hideLoadingScreen(); // 로딩 화면 숨김
      console.log("[SYSTEM] 로딩 화면 숨김"); // 로딩 화면 숨김 로그

      document.getElementById("quizContainer").style.display = "none";
      document.getElementById("resultContainer").style.display = "flex";

      console.log("[SYSTEM] 진행 상태 막대 숨김");
      document.getElementById("progressContainer").style.display = "none"; // 진행 상태 막대 숨기기
    };
  }, 500); // 로딩 화면이 표시된 후 0.5초 대기
}

// 상장 다운로드 버튼 클릭 이벤트
async function generateCertificate() {
  console.log("");
  console.log("[SYSTEM] 상장 다운로드 버튼 클릭");

  const canvas = document.getElementById("Certificate_Canvas");
  const ctx = canvas.getContext("2d");
  const image = document.getElementById("Certificate_Image");

  // 월 이름 배열
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const name = prompt("상장에 추가할 이름을 입력하세요:");
  if (name) {
    await document.fonts.ready; // 모든 폰트 로딩 완료 대기

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // 난이도
    const filteredDifficulties = selectedDifficulties.filter(
      (difficulty) =>
        difficulty !== "byDifficulty" && difficulty !== "totalRandom"
    );

    // 난이도 그리기 전에 지연 시간 추가 (200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    const difficultyText = `Completed ${filteredDifficulties.join(
      ", "
    )} Certifications`;
    ctx.font = "24px 'Noto Serif KR'";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    const difficultyX = canvas.width / 2;
    const difficultyY = canvas.height * 0.19;

    ctx.fillText(difficultyText, difficultyX, difficultyY);

    // 이름
    let fontSize = 72;
    ctx.fillStyle = "black";
    ctx.imageSmoothingEnabled = false;

    ctx.font = `${fontSize}px 'Noto Serif KR'`;
    let textWidth = ctx.measureText(name).width;

    while (textWidth > canvas.width * 0.5) {
      fontSize -= 1;
      ctx.font = `${fontSize}px 'Noto Serif KR'`;
      textWidth = ctx.measureText(name).width;
    }

    const nameX = canvas.width / 2;
    const nameY = canvas.height * 0.62;

    ctx.textAlign = "center";

    // 이름 그리기 전에 지연 시간 추가 (1200ms)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    ctx.fillText(name, nameX, nameY);

    // 날짜
    const today = new Date();
    const year = today.getFullYear();
    const monthIndex = today.getMonth();
    const monthName = months[monthIndex];
    const day = String(today.getDate()).padStart(2, "0");

    const dateString = `${monthName} ${day}, ${year}`;
    const dateX = canvas.width * 0.253;
    const dateY = canvas.height * 0.826;

    ctx.font = "54px 'Allison'";
    ctx.textAlign = "center";

    // 날짜 그리기 전에 지연 시간 추가 (200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));
    ctx.fillText(dateString, dateX, dateY);

    const formattedDateTime = `${year}${
      monthIndex + 1
    }${day}${today.getHours()}${today.getMinutes()}${today.getSeconds()}`;
    const imageUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${formattedDateTime}_${name}.png`;
    link.click();
  }
}

// TTS 함수
function handlePronunciationClick(question, pronunciation) {
  console.log("[SYSTEM] 발음 듣기 클릭");

  // Speech Synthesis API 지원 확인
  if ("speechSynthesis" in window) {
    console.log("[SYSTEM] Speech Synthesis API 지원");
    console.log("[SYSTEM] TTS 재생");
    const selectedTTS = document.getElementById("ttsModel").value;
    const utterance = new SpeechSynthesisUtterance(pronunciation);
    utterance.lang = selectedTTS;
    window.speechSynthesis.speak(utterance);
  } else {
    console.log("[SYSTEM] Speech Synthesis API 미지원");
    console.log("[SYSTEM] 네이버 일본어사전에서 질문 항목 열기");

    // 네이버 일본어사전 웹 사이트 링크 생성
    const googleTranslateUrl = `https://ja.dict.naver.com/#/search?query=${encodeURIComponent(
      question
    )}`;
    window.open(googleTranslateUrl, "_blank");
  }
}

// 최종 결과 화면에서 정오표를 표 형식으로 창을 보여주는 함수
function showAnswerSheet() {
  console.log("");
  console.log("[SYSTEM] 정오표 팝업 창 표시");

  let answerSheetHtml = `
        <div id="printable-content" style="flex: 1; overflow-y: auto; padding: 10px 20px 10px 20px;">
            <h2 style="text-align: center;">정오표</h2>
            <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
                <thead>
                    <tr>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">번호</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">과목</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">문제</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">발음</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">보기</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">정답</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">선택</th>
                        <th style="text-align: center; padding: 10px; white-space: nowrap;">정오</th>
                    </tr>
                </thead>
                <tbody>`;
  selectedQuestions.forEach((question, index) => {
    const isCorrect = answersChosen[index] === question.correct;
    const resultSymbol = isCorrect ? "O" : "X";
    const highlightClass = isCorrect ? "" : "highlight-mistake";

    const allAnswers = displayedAnswers[index] || [];
    const allAnswersHtml = allAnswers
      .map(
        (answer) =>
          `<li style="list-style: none; padding-left: 0; margin: 0;">
                <span style="margin-right: 5px;">•</span>${answer}
            </li>`
      )
      .join("");

    const correctAnswerHtml = `<strong>${question.correct}</strong>`;

    // 문제 텍스트와 발음 기호 포함
    const showPronunciation =
      document.getElementById("showPronunciation")?.checked;
    const customshowPronunciation = document.getElementById(
      "customshowPronunciation"
    )?.checked;
    let questionText = question.question;
    if (
      (showPronunciation && question.pronunciation) ||
      (customshowPronunciation && question.pronunciation)
    ) {
      questionText += ` (${question.pronunciation})`;
    }

    // 발음 듣기 버튼 추가
    const playPronunciationButton = `
    <img src="./pronunciationListenButton.png" 
        alt="듣기" 
        class="pronunciation-button"
        id="playPronunciationButtonId"
        onclick="handlePronunciationClick('${question.question}', '${question.pronunciation}')" />
    `;

    // 문제의 난이도 가져오기
    const difficulty =
      selectedDifficulties.find((difficulty) =>
        questions[difficulty]?.some((q) => q.question === question.question)
      ) || "";

    answerSheetHtml += `<tr class="${highlightClass}">
                <td style="text-align: center; padding: 10px;">${index + 1}</td>
                <td style="text-align: center; padding: 10px; ">${difficulty}</td>
                <td style="padding: 10px;">${questionText}</td>
                <td style="text-align: center; padding: 10px;">${playPronunciationButton}</td>
                <td style="padding: 10px;">${allAnswersHtml.replace(
                  /\\n/g,
                  " "
                )}</td>
                <td style="padding: 10px;">${correctAnswerHtml.replace(
                  /\\n/g,
                  " "
                )}</td>
                <td style="padding: 10px;">${
                  answersChosen[index].replace(/\\n/g, " ") || "문제 건너뛰기"
                }</td>
                <td style="text-align: center; padding: 10px;">${resultSymbol}</td>
            </tr>`;
  });

  answerSheetHtml += `</tbody></table></div>`;

  const answerSheetContainer = document.createElement("div");
  answerSheetContainer.innerHTML = answerSheetHtml;
  answerSheetContainer.classList.add("answer-sheet-container");

  const checkboxContainer = document.createElement("div");
  checkboxContainer.classList.add("checkbox-container");
  checkboxContainer.innerHTML = `
        <input type="checkbox" id="highlightMistakes" />
        <label for="highlightMistakes"> 오답 항목 강조 (강조 색: 
        <input type="color" id="highlightColor" value="#FFFF00" /> )</label>
    `;
  answerSheetContainer.appendChild(checkboxContainer);

  // TTS 모델 선택 드롭박스 추가
  const ttsModelSelect = document.createElement("div");
  ttsModelSelect.classList.add("ttsModelSelect-container");
  ttsModelSelect.innerHTML = `
    <label for="ttsModel">TTS 모델 선택:</label>
    <select id="ttsModel"></select>
`;
  answerSheetContainer.appendChild(ttsModelSelect);

  // Speech Synthesis API 지원 확인
  if ("speechSynthesis" in window) {
    console.log("[SYSTEM] Speech Synthesis API 지원");

    console.log("[SYSTEM] TTS 모델 로드");

    const populateTTSModelSelect = () => {
      const ttsModelSelect = document.getElementById("ttsModel");
      const voices = window.speechSynthesis.getVoices();

      console.log("[SYSTEM] 드롭박스 목록 비우고 TTS 모델 목록 추가");

      ttsModelSelect.innerHTML = "";
      voices.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.lang;
        option.textContent = `${voice.name} (${voice.lang})`;
        ttsModelSelect.appendChild(option);
      });
    };

    // TTS 모델이 변경되었을 때 호출
    window.speechSynthesis.onvoiceschanged = populateTTSModelSelect;

    // 처음에 모델을 불러오고, DOM에 추가된 후에 호출
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length) {
        populateTTSModelSelect();
      }
    }, 100);
  } else {
    console.log("[SYSTEM] Speech Synthesis API 미지원");

    // TTS 모델 선택 드롭박스를 안 보이게 설정
    ttsModelSelect.style.display = "none";

    const noTTSMessage = document.createElement("p");
    noTTSMessage.innerHTML =
      "이 웹 브라우저에서는 Speech Synthesis API을 사용할 수 없습니다.<br>(발음 버튼 클릭 시 '네이버 일본어사전'으로 이동)";
    noTTSMessage.style.fontSize = "10px";
    noTTSMessage.style.textAlign = "center";
    answerSheetContainer.appendChild(noTTSMessage);
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  const printButton = document.createElement("button");
  printButton.innerText = "인쇄";
  printButton.onclick = async () => {
    const highlightMistakes =
      document.getElementById("highlightMistakes").checked;
    const highlightColor = document.getElementById("highlightColor").value;

    if (highlightMistakes) {
      console.log(
        "[SYSTEM] '오답 항목 강조' 기능 활성화 인쇄 시 안내 문구 표시"
      );

      alert(
        "'오답 항목 강조' 기능이 활성화되었습니다.\n\n인쇄 옵션에서 '배경 그래픽'과 관련된 기능을 활성화하십시오.\n\n(* 필요에 따라 웹 브라우저 팝업 및 리디렉션을 허용해야 할 수도 있습니다.)\n\n(** 모바일 환경에서는 '배경 그래픽'과 관련된 기능을 웹 브라우저가 아닌 인쇄 시 사용할 프린터 앱에서 확인해야 하며, '배경 그래픽'과 관련된 기능 미지원 시 해당 기능을 사용할 수 없습니다.)"
      );
    }

    // 인쇄 창 생성
    const printWindow = window.open("", "캬루와 함께하는 JLPT - 정오표 인쇄");
    printWindow.document.write(`
    <html>
    <head>
        <title>캬루와 함께하는 JLPT - 정오표 인쇄</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Noto Serif KR', serif; /* 기본 폰트 */
                font-size: 10px;
            }
            @media print {
                body {
                    font-family: 'Noto Serif KR', serif; /* 인쇄 시 사용할 폰트 */
                }
            }
            table { border-collapse: collapse; width: 100%; font-size: 10px; }
            th, td { border: 1px solid black; padding: 5px; text-align: left;}
            ${
              highlightMistakes
                ? `.highlight-mistake { background-color: ${highlightColor}; }`
                : ""
            }
        </style>
    </head>
    <body>
        <h2 style="text-align: center;">정오표</h2>
        <table border="1" style="width: 100%;">
            <thead>
                <tr>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">번호</th>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">과목</th>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">문제</th>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">보기</th>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">정답</th>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">선택</th>
                    <th style="text-align: center; padding: 5px; white-space: nowrap;">정오</th>
                </tr>
            </thead>
            <tbody>
                ${Array.from(selectedQuestions)
                  .map((question, index) => {
                    const isCorrect = answersChosen[index] === question.correct;
                    const resultSymbol = isCorrect ? "O" : "X";
                    const highlightClass = isCorrect ? "" : "highlight-mistake";
                    const allAnswers = displayedAnswers[index] || [];
                    const allAnswersHtml = allAnswers
                      .map(
                        (answer) =>
                          `<li style="list-style: none;">• ${answer}</li>`
                      )
                      .join("");
                    const correctAnswerHtml = `<strong>${question.correct}</strong>`;
                    const questionText = question.question;

                    // 문제의 난이도 가져오기
                    const difficulty =
                      selectedDifficulties.find((difficulty) =>
                        questions[difficulty]?.some(
                          (q) => q.question === question.question
                        )
                      ) || "";

                    return `
                      <tr class="${highlightClass}">
                          <td style="text-align: center; padding: 5px;">${
                            index + 1
                          }</td>
                          <td style="text-align: center; padding: 5px; ">${difficulty}</td>
                          <td style="padding: 5px;">${questionText}</td>
                          <td style="padding: 5px;">${allAnswersHtml.replace(
                            /\\n/g,
                            " "
                          )}</td>
                          <td style="padding: 5px;">${correctAnswerHtml.replace(
                            /\\n/g,
                            " "
                          )}</td>
                          <td style="padding: 5px;">${
                            answersChosen[index].replace(/\\n/g, " ") ||
                            "문제 건너뛰기"
                          }</td>
                          <td style="text-align: center; padding: 5px;">${resultSymbol}</td>
                      </tr>`;
                  })
                  .join("")}
            </tbody>
        </table>
    </body>
    </html>
`);

    printWindow.document.close();
  };

  buttonContainer.appendChild(printButton);

  const closeButton = document.createElement("button");
  closeButton.innerText = "닫기";
  closeButton.onclick = () => document.body.removeChild(answerSheetContainer);
  buttonContainer.appendChild(closeButton);

  answerSheetContainer.appendChild(buttonContainer);

  document.body.appendChild(answerSheetContainer);

  const updateAnswerSheetHighlight = () => {
    const highlightMistakes =
      document.getElementById("highlightMistakes").checked;
    const highlightColor = document.getElementById("highlightColor").value;

    const rows = answerSheetContainer.querySelectorAll("table tbody tr");
    rows.forEach((row) => {
      if (
        highlightMistakes &&
        row.querySelector("td:last-child").innerText === "X"
      ) {
        row.style.backgroundColor = highlightColor;
      } else {
        row.style.backgroundColor = "";
      }
    });
  };

  document
    .getElementById("highlightMistakes")
    .addEventListener("change", updateAnswerSheetHighlight);
  document
    .getElementById("highlightColor")
    .addEventListener("input", updateAnswerSheetHighlight);

  // 페이지에 표시될 때 즉시 스타일 적용
  updateAnswerSheetHighlight();

  setTimeout(() => {
    answerSheetContainer.classList.add("show");
  }, 10);
}

// 최종 결과 화면에서 처음으로 돌아가기 버튼 클릭 시 팝업 창 표시 함수
function showExitConfirmation() {
  console.log("");
  console.log(
    "[SYSTEM] 최종 결과 화면에서 처음으로 돌아가기 버튼 클릭 시 팝업 창 표시"
  );
  document.getElementById("resultContainer").style.display = "none";
  const exitConfirmationContainer = document.getElementById(
    "exitConfirmationContainer"
  );
  exitConfirmationContainer.style.display = "block";
  setTimeout(() => {
    exitConfirmationContainer.classList.add("show");
  }, 10); // 애니메이션 시작을 위해 약간의 지연 할당
}

// 최종 결과 화면 처음으로 돌아가기 팝업 창에서 예/아니오 버튼 클릭 시 처리 함수
function confirmExit(confirm) {
  const exitConfirmationContainer = document.getElementById(
    "exitConfirmationContainer"
  );
  exitConfirmationContainer.classList.remove("show");
  setTimeout(() => {
    exitConfirmationContainer.style.display = "none";
    if (confirm) {
      console.log(
        "[SYSTEM] 최종 결과 화면 처음으로 돌아가기 팝업 창에서 '예' 버튼 클릭"
      );

      document.querySelector("#loading-screen p").innerText =
        "메인 화면으로 이동 중...";
      console.log("[SYSTEM] 메인 화면으로 이동 중...");

      console.log("[SYSTEM] 로딩 화면 표시 중...");
      showLoadingScreen(); // 로딩 화면 표시

      // 로딩 화면 표시된 후 대기 시간 설정
      setTimeout(() => {
        hideLoadingScreen(); // 로딩 화면 숨김
        console.log("[SYSTEM] 로딩 화면 숨김");

        restartQuiz(); // 메인 화면으로 이동
      }, 100); // 로딩 화면이 표시된 후 0.1초 대기
    } else {
      console.log(
        "[SYSTEM] 최종 결과 화면 처음으로 돌아가기 팝업 창에서 '아니요' 버튼 클릭"
      );
      document.getElementById("resultContainer").style.display = "block"; // 결과 창 다시 보이기
    }
  }, 120); // 애니메이션 시간에 맞춰서 딜레이
}

// 처음으로 돌아가기 버튼 클릭 시 메뉴로 돌아가는 함수
function restartQuiz() {
  document.querySelector("#loading-screen p").innerText =
    "메인 화면으로 이동 중...";
  console.log("[SYSTEM] 메인 화면으로 이동 중...");

  console.log("[SYSTEM] 로딩 화면 표시 중...");
  showLoadingScreen(); // 로딩 화면 표시

  // 로딩 화면 표시된 후 대기 시간 설정
  setTimeout(() => {
    document.getElementById("resultContainer").style.display = "none";
    document.getElementById("quizContainer").style.display = "none";
    document.getElementById("menu").style.display = "flex";
    document.getElementById("progressContainer").style.display = "none"; // 진행 상태 막대 숨기기
    resetElements();
  }, 100); // 로딩 화면이 표시된 후 0.1초 대기

  console.log("[SYSTEM] 메인 화면으로 이동");
}
