// 전역 변수 선언
var canvas, ctx, W, H; // 캔버스와 그리기 컨텍스트, 폭과 높이
var mp = 150; // 생성할 입자의 수
var particles = [], // 입자 배열
  angle = 0, // 입자의 각도
  tiltAngle = 0; // 입자의 기울기 각도
var confettiActive = true, // 색종이 애니메이션 활성 상태
  animationComplete = true; // 애니메이션 완료 여부
var animationHandler; // 타이머 핸들러

// 색상 설정 객체
var particleColors = {
  colorOptions: [
    "DodgerBlue",
    "OliveDrab",
    "Gold",
    "pink",
    "SlateBlue",
    "lightblue",
    "Violet",
    "PaleGreen",
    "SteelBlue",
    "SandyBrown",
    "Chocolate",
    "Crimson",
  ],
  colorIndex: 0,
  colorIncrementer: 0,
  colorThreshold: 10,
  getColor: function () {
    if (this.colorIncrementer >= this.colorThreshold) {
      this.colorIncrementer = 0;
      this.colorIndex++;
      if (this.colorIndex >= this.colorOptions.length) {
        this.colorIndex = 0;
      }
    }
    this.colorIncrementer++;
    return this.colorOptions[this.colorIndex];
  },
};

// 입자 생성자 함수
function confettiParticle(color) {
  this.x = Math.random() * W; // 랜덤 x 좌표
  this.y = Math.random() * H - H; // 랜덤 y 좌표 (위에서 시작)
  this.r = RandomFromTo(10, 15); // 랜덤 반지름
  this.d = Math.random() * mp + 10; // 입자의 깊이
  this.color = color; // 입자의 색상
  this.tilt = Math.floor(Math.random() * 10) - 10; // 랜덤 기울기
  this.tiltAngleIncremental = Math.random() * 0.07 + 0.05; // 기울기 변화량
  this.tiltAngle = 0; // 초기 기울기 각도

  // 입자를 그리는 함수
  this.draw = function () {
    ctx.beginPath();
    ctx.lineWidth = this.r / 2; // 선의 두께
    ctx.strokeStyle = this.color; // 선 색상
    ctx.moveTo(this.x + this.tilt + this.r / 4, this.y);
    ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 4);
    return ctx.stroke(); // 입자 그리기
  };
}

// 글로벌 변수 설정 함수
function SetGlobals() {
  canvas = document.getElementById("Confetti_Canvas");
  ctx = canvas.getContext("2d");
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W; // 캔버스 폭 설정
  canvas.height = H; // 캔버스 높이 설정
}

// 색종이 효과 초기화 함수
function InitializeConfetti() {
  StopConfetti(); // 이전 애니메이션 종료
  particles = []; // 입자 배열 초기화
  animationComplete = false; // 애니메이션 비활성화
  for (var i = 0; i < mp; i++) {
    var particleColor = particleColors.getColor(); // 색상 가져오기
    particles.push(new confettiParticle(particleColor)); // 입자 생성
  }
  StartConfetti(); // 애니메이션 시작
}

// 그리기 함수
function Draw() {
  ctx.clearRect(0, 0, W, H); // 캔버스 지우기
  for (var i = 0; i < mp; i++) {
    particles[i].draw(); // 각 입자 그리기
  }
  Update(); // 입자 업데이트
}

// 랜덤 수 생성 함수
function RandomFromTo(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

// 입자 업데이트 함수
function Update() {
  var remainingFlakes = 0; // 남은 입자 수
  var particle;

  for (var i = 0; i < mp; i++) {
    particle = particles[i];

    if (animationComplete) return; // 애니메이션이 완료되면 종료

    if (!confettiActive && particle.y < -15) {
      particle.y = H + 100; // 화면 밖으로 나가면 재위치
      continue;
    }

    stepParticle(particle); // 입자 움직임 처리

    if (particle.y <= H) {
      remainingFlakes++; // 화면에 남은 입자 수 체크
    }
    CheckForReposition(particle, i); // 입자 재위치 확인
  }

  if (remainingFlakes === 0) {
    StopConfetti(); // 모든 입자가 화면에서 사라지면 애니메이션 종료
  }
}

// 입자 재위치 확인 함수
function CheckForReposition(particle) {
  if (
    (particle.x > W + 20 || particle.x < -20 || particle.y > H) &&
    confettiActive
  ) {
    repositionParticle(
      particle,
      Math.random() * W, // 랜덤 x 좌표
      -10, // 랜덤 y 좌표
      Math.floor(Math.random() * 10) - 20 // 랜덤 기울기
    );
  }
}

// 입자 움직임 처리 함수
function stepParticle(particle) {
  particle.tiltAngle += particle.tiltAngleIncremental; // 기울기 각도 업데이트
  particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 3; // y 위치 업데이트
  particle.x += Math.sin(angle); // x 위치 업데이트
  particle.tilt = Math.sin(particle.tiltAngle) * 15; // 기울기 업데이트
}

// 입자 재위치 함수
function repositionParticle(particle, xCoordinate, yCoordinate, tilt) {
  particle.x = xCoordinate; // 새로운 x 좌표
  particle.y = yCoordinate; // 새로운 y 좌표
  particle.tilt = tilt; // 새로운 기울기
}

// 애니메이션 시작 함수
function StartConfetti() {
  (function animloop() {
    if (animationComplete) return null; // 애니메이션이 완료되면 종료
    animationHandler = requestAnimFrame(animloop); // 애니메이션 루프 요청
    return Draw(); // 그리기
  })();
}

// 애니메이션 종료 함수
function StopConfetti() {
  animationComplete = true; // 애니메이션 완료 상태로 설정
  if (ctx === undefined) return; // 컨텍스트가 정의되지 않았으면 종료
  ctx.clearRect(0, 0, W, H); // 캔버스 지우기
  cancelAnimationFrame(animationHandler); // 현재 애니메이션 프레임 취소
}

// 요청 애니메이션 프레임 함수
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 1000 / 60); // 60fps
    }
  );
})();

// DOM이 준비되면 실행
$(document).ready(function () {
  SetGlobals(); // 글로벌 변수 설정
});
