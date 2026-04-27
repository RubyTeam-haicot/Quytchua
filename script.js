// ========== CẤU HÌNH ==========
const CONFIG = {
    // Danh sách link Shopee affiliate (sẽ random hoặc theo thứ tự)
    affiliateLinks: [
        "[shope.ee](https://shope.ee/your-affiliate-link-1)",
        "[shope.ee](https://shope.ee/your-affiliate-link-2)",
        "[shope.ee](https://shope.ee/your-affiliate-link-3)",
        // Thêm nhiều link tùy ý
    ],
    
    // Thời gian chờ sau khi bấm link (giây)
    waitTime: 5,
    
    // Số chương miễn phí (không cần bấm link)
    freeChapters: 2,
    
    // Lưu tiến độ vào localStorage
    saveProgress: true
};

// ========== DỮ LIỆU TRUYỆN ==========
// Có thể load từ file JSON hoặc định nghĩa trực tiếp
const STORY_DATA = {
    title: "Tôi Để Con Gái Mình Thế Cho Thiên Kim Thật Nhà Giàu Nhất",
    chapters: [
        {
            id: 1,
            title: "Chương 1: Khởi đầu",
            content: `
                <p>Đây là nội dung chương 1 của truyện.</p>
                <p>Bạn có thể thêm nhiều đoạn văn ở đây.</p>
                <p>Định dạng HTML được hỗ trợ đầy đủ.</p>
            `
        },
        {
            id: 2,
            title: "Chương 2: Bước ngoặt",
            content: `
                <p>Nội dung chương 2...</p>
                <p>Tiếp tục câu chuyện...</p>
            `
        },
        {
            id: 3,
            title: "Chương 3: Hé lộ",
            content: `
                <p>Nội dung chương 3...</p>
                <p>Bí mật dần được hé lộ...</p>
            `
        },
        {
            id: 4,
            title: "Chương 4: Cao trào",
            content: `
                <p>Nội dung chương 4...</p>
            `
        },
        {
            id: 5,
            title: "Chương 5: Kết thúc",
            content: `
                <p>Nội dung chương cuối...</p>
            `
        }
    ]
};

// ========== BIẾN TOÀN CỤC ==========
let currentChapter = 0;
let unlockedChapters = new Set();
let pendingChapter = null;
let countdownInterval = null;

// ========== KHỞI TẠO ==========
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    renderStory();
    setupEventListeners();
});

// ========== RENDER ==========
function renderStory() {
    // Tiêu đề truyện
    document.getElementById('story-title').textContent = STORY_DATA.title;
    
    // Danh sách chương
    renderChapterList();
    
    // Hiển thị chương đầu tiên
    showChapter(currentChapter);
}

function renderChapterList() {
    const nav = document.getElementById('chapter-list');
    nav.innerHTML = '';
    
    STORY_DATA.chapters.forEach((chapter, index) => {
        const btn = document.createElement('button');
        btn.textContent = `Chương ${chapter.id}`;
        btn.dataset.index = index;
        
        // Kiểm tra xem chương có được mở khóa không
        const isUnlocked = index < CONFIG.freeChapters || unlockedChapters.has(index);
        
        if (!isUnlocked) {
            btn.classList.add('locked');
        }
        
        if (index === currentChapter) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => handleChapterClick(index));
        nav.appendChild(btn);
    });
}

function showChapter(index) {
    const chapter = STORY_DATA.chapters[index];
    
    document.getElementById('chapter-title').textContent = chapter.title;
    document.getElementById('chapter-content').innerHTML = chapter.content;
    
    currentChapter = index;
    
    // Cập nhật điều hướng
    updateNavigation();
    
    // Cập nhật danh sách chương
    renderChapterList();
    
    // Lưu tiến độ
    if (CONFIG.saveProgress) {
        saveProgress();
    }
    
    // Scroll lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('chapter-indicator');
    
    prevBtn.disabled = currentChapter === 0;
    nextBtn.disabled = currentChapter === STORY_DATA.chapters.length - 1;
    
    indicator.textContent = `${currentChapter + 1}/${STORY_DATA.chapters.length}`;
}

// ========== XỬ LÝ SỰ KIỆN ==========
function setupEventListeners() {
    // Nút chương trước
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentChapter > 0) {
            navigateToChapter(currentChapter - 1);
        }
    });
    
    // Nút chương sau
    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentChapter < STORY_DATA.chapters.length - 1) {
            navigateToChapter(currentChapter + 1);
        }
    });
    
    // Link affiliate
    document.getElementById('affiliate-link').addEventListener('click', handleAffiliateClick);
    
    // Nút tiếp tục
    document.getElementById('continue-btn').addEventListener('click', handleContinue);
}

function handleChapterClick(index) {
    if (index === currentChapter) return;
    navigateToChapter(index);
}

function navigateToChapter(index) {
    // Kiểm tra xem chương có cần mở khóa không
    const needsUnlock = index >= CONFIG.freeChapters && !unlockedChapters.has(index);
    
    if (needsUnlock) {
        // Hiện popup yêu cầu bấm link
        showAffiliatePopup(index);
    } else {
        // Chuyển chương trực tiếp
        showChapter(index);
    }
}

function showAffiliatePopup(targetChapter) {
    pendingChapter = targetChapter;
    
    // Chọn link affiliate (random hoặc theo thứ tự)
    const linkIndex = targetChapter % CONFIG.affiliateLinks.length;
    const affiliateLink = CONFIG.affiliateLinks[linkIndex];
    
    document.getElementById('affiliate-link').href = affiliateLink;
    document.getElementById('countdown').textContent = CONFIG.waitTime;
    document.getElementById('continue-btn').disabled = true;
    
    // Hiện overlay
    document.getElementById('affiliate-overlay').classList.remove('hidden');
}

function handleAffiliateClick() {
    // Bắt đầu đếm ngược
    let remaining = CONFIG.waitTime;
    const countdownEl = document.getElementById('countdown');
    const continueBtn = document.getElementById('continue-btn');
    
    // Clear interval cũ nếu có
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        remaining--;
        countdownEl.textContent = remaining;
        
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            continueBtn.disabled = false;
        }
    }, 1000);
}

function handleContinue() {
    // Ẩn overlay
    document.getElementById('affiliate-overlay').classList.add('hidden');
    
    // Mở khóa chương
    if (pendingChapter !== null) {
        unlockedChapters.add(pendingChapter);
        showChapter(pendingChapter);
        pendingChapter = null;
    }
    
    // Reset countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

// ========== LƯU TRỮ ==========
function saveProgress() {
    const data = {
        currentChapter,
        unlockedChapters: Array.from(unlockedChapters)
    };
    localStorage.setItem('truyen_progress', JSON.stringify(data));
}

function loadProgress() {
    const saved = localStorage.getItem('truyen_progress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            currentChapter = data.currentChapter || 0;
            unlockedChapters = new Set(data.unlockedChapters || []);
        } catch (e) {
            console.error('Lỗi khi load tiến độ:', e);
        }
    }
}

// ========== LOAD TỪ JSON (TÙY CHỌN) ==========
async function loadStoryFromJSON(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        Object.assign(STORY_DATA, data);
        renderStory();
    } catch (e) {
        console.error('Lỗi khi load truyện:', e);
    }
}
