console.log("🟢 main.js 文件已加载并开始执行。");

// --- 1. 检查DOM元素是否被正确获取 ---
console.log("🔍 正在检查DOM元素...");
const channelsContainer = document.getElementById('channelsContainer');
const searchInput = document.getElementById('searchInput');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const modal = document.getElementById('videoModal');
const modalCloseBtn = document.getElementById('modalClose');

if (!channelsContainer) console.error("❌ 找不到 #channelsContainer");
if (!searchInput) console.error("❌ 找不到 #searchInput");
if (!gridViewBtn) console.error("❌ 找不到 #gridViewBtn");
if (!listViewBtn) console.error("❌ 找不到 #listViewBtn");
if (!modal) console.error("❌ 找不到 #videoModal");
if (!modalCloseBtn) console.error("❌ 找不到 #modalCloseBtn");

console.log("✅ DOM元素检查完成。");

let channelsData = [];
let currentView = 'grid';

// --- 2. 检查核心函数是否存在 ---
function setupEventListeners() {
    console.log("🛠️ setupEventListeners 函数被调用。");
    if (!gridViewBtn || !listViewBtn) {
        console.error("❌ 切换按钮未找到，无法设置监听器。");
        return;
    }

    // 清除旧的监听器，防止重复绑定
    gridViewBtn.replaceWith(gridViewBtn.cloneNode(true));
    listViewBtn.replaceWith(listViewBtn.cloneNode(true));
    
    // 重新获取元素
    const newGridBtn = document.getElementById('gridViewBtn');
    const newListBtn = document.getElementById('listViewBtn');

    newGridBtn.addEventListener('click', () => {
        console.log("🟢 网格视图按钮被点击！");
        switchView('grid');
    });
    newListBtn.addEventListener('click', () => {
        console.log("🟢 列表视图按钮被点击！");
        switchView('list');
    });
    console.log("✅ 事件监听器已设置。");
}

function switchView(view) {
    console.log(`🔄 switchView 函数被调用，参数为: ${view}`);
    if (!channelsContainer) {
        console.error("❌ channelsContainer 不存在，无法切换视图。");
        return;
    }
    currentView = view;
    if (view === 'grid') {
        channelsContainer.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        console.log("✅ 已切换到网格视图。");
    } else {
        channelsContainer.classList.add('list-view');
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
        console.log("✅ 已切换到列表视图。");
    }
}

// --- 3. 检查初始化流程 ---
async function init() {
    console.log("🚀 init() 函数被调用。");
    try {
        const response = await fetch('/channels.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        channelsData = await response.json();
        console.log("✅ Channel data loaded successfully:", channelsData);

        // 数据加载成功后，渲染页面
        // renderChannels(channelsData); // 暂时注释掉，只关注按钮
        setupEventListeners();
        console.log("🎉 初始化完成。");

    } catch (error) {
        console.error("❌ 初始化失败:", error);
        if (channelsContainer) {
            channelsContainer.innerHTML = `<p style="color: red; text-align: center;">加载数据失败: ${error.message}</p>`;
        }
    }
}

// --- 4. 检查DOMContentLoaded事件 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM内容已完全加载和解析。");
    init();
});

console.log("🟢 main.js 文件执行完毕。");
