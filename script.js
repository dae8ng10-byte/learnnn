// --- 1. 프로젝트 데이터 및 변수 설정 (미션 설명 추가) ---
const missions = [
    { 
        id: 'seed', 
        name: '창조의 씨앗', 
        location: '설문대여성문화센터', 
        isCollected: false, 
        imagePath: './seed_creation.png',
        description: "할망이 섬을 창조할 때 사용했던 생명의 씨앗입니다. 이 씨앗은 여성들의 지혜와 역사가 응축된 이 공간에서 다시 깨어납니다." // 예시 텍스트
    },
    { 
        id: 'guard', 
        name: '수호의 조각', 
        location: '제주돌문화공원', 
        isCollected: false, 
        imagePath: './seed_wish.png',
        description: "수많은 돌 속에는 할망의 눈물이 스며들어 있습니다. 이 조각은 돌에 깃든 땅의 정령을 깨우고, 우리 가족을 수호하는 힘을 가졌습니다." // 예시 텍스트
    },
    { 
        id: 'peace', 
        name: '평화의 바람개비', 
        location: '제주4.3평화공원', 
        isCollected: false, 
        imagePath: './seed_peace.png',
        description: "분노와 슬픔을 잠재우고 평화를 기원하는 바람개비입니다. 비극의 역사가 서린 이곳에서, 희망의 바람을 불어넣어 평화를 완성하세요." // 예시 텍스트
    }
];

const dialogues = [
    "사랑하는 나의 아이들아, 드디어 이 할망이 만든 섬에 발을 디뎠구나. 나는 설문대, 이 땅의 모든 산과 오름, 그리고 숨 쉬는 너희의 어머니이니라.",
    "나의 창조의 흔적은 돌이 되었고, 백록담의 물이 되었으며, 너희가 딛고 선 역사 속에 스며들어 있단다. 이제 너희가 이 섬의 역사를 나의 눈으로 보며, 그 지혜를 깨우칠 차례이다.",
    "이 할망이 보낸 첫 번째 '창조의 씨앗'을 가지고, 설문대여성문화센터로 향해라. 너희의 탐험은 그곳의 돌에서부터 시작될지니." 
];

let dialogueIndex = 0;
let currentMissionIndex = 0;
let cameraStream = null;

// --- 2. DOM 요소 선택 ---
const introScreen = document.getElementById('intro-screen');
const mainScreen = document.getElementById('main-mission-screen');
const dialogueText = document.getElementById('dialogue-text');
const nextDialogueBtn = document.getElementById('next-dialogue-btn');
const startNextMissionBtn = document.getElementById('start-next-mission-btn');

const modal = document.getElementById('mission-modal');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const missionLocationText = document.getElementById('mission-location');
const missionItemImage = document.getElementById('mission-item-image');
const missionDescriptionText = document.getElementById('mission-description'); // 새로운 DOM 요소 선택
const startAuthBtn = document.getElementById('start-auth-btn'); 
const collectItemBtn = document.getElementById('collect-item-btn');
const cameraPreview = document.getElementById('camera-preview');


// --- 3. 인트로 화면 로직 ---
function showNextDialogue() {
    if (dialogueIndex < dialogues.length) {
        dialogueText.textContent = dialogues[dialogueIndex];
        dialogueIndex++;
    } else {
        introScreen.style.display = 'none';
        mainScreen.style.display = 'block';
        renderMissionStatus();
    }
}
nextDialogueBtn.addEventListener('click', showNextDialogue);
document.addEventListener('DOMContentLoaded', showNextDialogue);


// --- 4. 메인 미션 화면 로직 (미수집 미션 시작 시 Step 1 표시) ---
function renderMissionStatus() {
    const missionStatusList = document.getElementById('mission-status-list');
    const rewardSection = document.getElementById('reward-section');
    
    missionStatusList.innerHTML = '';
    missions.forEach(mission => {
        const status = mission.isCollected ? '✅ 수집 완료' : '❌ 미수집';
        const itemHtml = `<p><b>${mission.name}</b> (${mission.location}): ${status}</p>`;
        missionStatusList.innerHTML += itemHtml;
    });

    const allCollected = missions.every(m => m.isCollected);
    if (allCollected) {
        rewardSection.style.display = 'block';
        startNextMissionBtn.style.display = 'none';
    } else {
        rewardSection.style.display = 'none';
        startNextMissionBtn.style.display = 'block';
    }
}

// '다음 미수집 미션 시작' 버튼 클릭 -> Step 1 (미션 내용 팝업) 표시
startNextMissionBtn.addEventListener('click', () => {
    const nextMission = missions.find(m => !m.isCollected);
    if (!nextMission) return; 

    currentMissionIndex = missions.findIndex(m => m.id === nextMission.id);
    
    // Step 1: 미션 내용 업데이트 (장소, 아이템 이미지, 미션 설명)
    missionLocationText.textContent = nextMission.location;
    missionItemImage.src = nextMission.imagePath;
    missionDescriptionText.textContent = nextMission.description; // 미션 설명 업데이트
    
    // 모달 열기 및 Step 1 초기화
    modal.style.display = 'flex';
    step1.style.display = 'block'; 
    step2.style.display = 'none';
});


// --- 5. 미션 모달 로직 (Step 1 -> Step 2 전환 및 완료) ---
// Step 1의 '미션 완료' 버튼 클릭 -> Step 2 (카메라 화면) 전환
startAuthBtn.addEventListener('click', async () => {
    step1.style.display = 'none';
    step2.style.display = 'block'; // 현장 인증 모드 표시

    // Step 2 진입 시 카메라 활성화
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraPreview.srcObject = cameraStream;
    } catch (err) {
        console.error("카메라 접근 오류: ", err);
    }
});

// 아이템 수집 완료 버튼 클릭 (핵심)
collectItemBtn.addEventListener('click', () => {
    // 1. 아이템 상태 업데이트
    missions[currentMissionIndex].isCollected = true;
    
    // 2. 카메라 스트림 중지 및 리소스 해제
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // 3. 모달 닫기 및 메인 화면 상태 업데이트
    modal.style.display = 'none';
    renderMissionStatus();
});

// 사진 찍기 버튼 (선택 사항)
document.getElementById('take-photo-btn').addEventListener('click', () => {
    console.log("기념 사진 촬영 버튼 클릭됨 - 사진 저장 로직 추가 필요");
});