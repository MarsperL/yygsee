// DOM元素
const channelsContainer = document.getElementById('channelsContainer');
const searchInput = document.getElementById('searchInput');
const gridViewBtn = document.getElementById('gridViewBtn');
const compactViewBtn = document.getElementById('compactViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

// 视频模态框元素
const videoModal = document.getElementById('videoModal');
const videoModalIframe = document.getElementById('videoModalIframe');
const videoModalClose = document.getElementById('videoModalClose');

// 全局变量，用于存储从 data.json 加载的数据
let channelsData = [];
// 当前视图模式
let currentView = 'grid';

// --- 新增：异步加载频道数据 ---
async function loadChannelsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        channelsData = await response.json();
        console.log("频道数据加载成功:", channelsData);
        
        // 数据加载成功后，初始化页面
        init();
    } catch (error) {
        console.error("无法加载频道数据:", error);
        // 可以在这里向用户显示一个错误提示
        channelsContainer.innerHTML = `<p style="color: red; text-align: center;">加载频道数据失败，请检查网络连接或稍后重试。</p>`;
    }
}

// 初始化页面
function init() {
    renderChannels(channelsData);
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', handleSearch);

    // 视图切换
    gridViewBtn.addEventListener('click', () => switchView('grid'));
    compactViewBtn.addEventListener('click', () => switchView('compact'));
    listViewBtn.addEventListener('click', () => switchView('list'));

    // 视频模态框关闭事件
    videoModalClose.addEventListener('click', closeVideoModal);

    // 点击模态框外部关闭
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
}

// 渲染频道
function renderChannels(channels) {
    channelsContainer.innerHTML = '';

    channels.forEach(channel => {
        const channelCard = createChannelCard(channel);
        channelsContainer.appendChild(channelCard);
    });
}

// 创建频道卡片
function createChannelCard(channel) {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.dataset.channelId = channel.id;

    // 频道头部
    const header = document.createElement('div');
    header.className = 'channel-header';

    const avatar = document.createElement('div');
    avatar.className = 'channel-avatar';
    avatar.innerHTML = `<i class="fas fa-play"></i>`;

    const info = document.createElement('div');
    info.className = 'channel-info';

    const title = document.createElement('div');
    title.className = 'channel-title';
    title.innerHTML = `<a href="${channel.url}" target="_blank">${channel.title}</a>`;

    const stats = document.createElement('div');
    stats.className = 'channel-stats';
    stats.textContent = `${channel.videos.length} 个视频`;

    info.appendChild(title);
    info.appendChild(stats);
    header.appendChild(avatar);
    header.appendChild(info);

    // 视频容器
    const videosContainer = document.createElement('div');
    videosContainer.className = 'videos-container';

    // 左滚动按钮
    const leftBtn = document.createElement('button');
    leftBtn.className = 'scroll-btn left';
    leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftBtn.addEventListener('click', () => scrollVideos(channel.id, 'left'));

    // 视频列表
    const videosScroll = document.createElement('div');
    videosScroll.className = 'videos-scroll';
    videosScroll.id = `videos-${channel.id}`;

    channel.videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videosScroll.appendChild(videoCard);
    });

    // 右滚动按钮
    const rightBtn = document.createElement('button');
    rightBtn.className = 'scroll-btn right';
    rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightBtn.addEventListener('click', () => scrollVideos(channel.id, 'right'));

    videosContainer.appendChild(leftBtn);
    videosContainer.appendChild(videosScroll);
    videosContainer.appendChild(rightBtn);

    card.appendChild(header);
    card.appendChild(videosContainer);

    return card;
}

// 创建视频卡片
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';

    // 缩略图容器
    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';

    const img = document.createElement('img');
    img.src = video.thumbnail;
    img.alt = video.title;
    img.loading = 'lazy';

    const duration = document.createElement('div');
    duration.className = 'video-duration';
    duration.textContent = video.duration;

    // 播放按钮
    const playButton = document.createElement('div');
    playButton.className = 'play-button';
    playButton.innerHTML = '<i class="fas fa-play"></i>';

    // 播放按钮点击事件
    playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.embed_url) {
            openVideoModal(video.embed_url);
        } else {
            window.open(video.link, '_blank');
        }
    });

    thumbnail.appendChild(img);
    thumbnail.appendChild(duration);
    thumbnail.appendChild(playButton);

    // --- 新增：判断并添加“今日更新”徽章 ---
    if (video.is_today) {
        const todayBadge = document.createElement('div');
        todayBadge.className = 'today-badge';
        todayBadge.textContent = '今日更新';
        thumbnail.appendChild(todayBadge);
    }
    // --- 新增结束 ---

    // 视频信息
    const info = document.createElement('div');
    info.className = 'video-info';

    const title = document.createElement('div');
    title.className = 'video-title';
    title.textContent = video.title;

    const meta = document.createElement('div');
    meta.className = 'video-meta';
    meta.textContent = video.published;

    info.appendChild(title);
    info.appendChild(meta);

    card.appendChild(thumbnail);
    card.appendChild(info);

    // 视频卡片点击事件（在新窗口打开原链接）
    card.addEventListener('click', () => {
        window.open(video.link, '_blank');
    });

    return card;
}

// 打开视频模态框
function openVideoModal(embedUrl) {
    videoModalIframe.src = embedUrl;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
}

// 关闭视频模态框
function closeVideoModal() {
    videoModal.style.display = 'none';
    videoModalIframe.src = ''; // 清空iframe内容，停止视频播放
    document.body.style.overflow = 'auto'; // 恢复背景滚动
}

// 滚动视频列表
function scrollVideos(channelId, direction) {
    // 在列表视图和紧凑视图下，不执行滚动操作
    if (currentView === 'list' || currentView === 'compact') { // 新增 'compact'
        return;
    }

    const videosScroll = document.getElementById(`videos-${channelId}`);
    const scrollAmount = 210; // 视频卡片宽度 + 间距

    if (direction === 'left') {
        videosScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        videosScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// 切换视图
function switchView(view) {
    currentView = view;

    // 移除所有按钮的 active 类
    gridViewBtn.classList.remove('active');
    compactViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');

    if (view === 'grid') {
        gridViewBtn.classList.add('active');
        // --- 关键：直接设置类名为默认值 ---
        channelsContainer.className = 'channels-container';
    } else if (view === 'compact') {
        compactViewBtn.classList.add('active');
        // --- 关键：直接设置类名为新的网格类 ---
        channelsContainer.className = 'channels-container channels-grid';
    } else if (view === 'list') {
        listViewBtn.classList.add('active');
        // --- 关键：直接设置类名为列表视图类 ---
        channelsContainer.className = 'channels-container list-view';
    }
}
// 搜索处理
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        renderChannels(channelsData); // 使用全局变量
        return;
    }

    const filteredChannels = channelsData.filter(channel => {
        // 检查频道名称
        if (channel.title.toLowerCase().includes(query)) {
            return true;
        }

        // 检查视频标题
        return channel.videos.some(video =>
            video.title.toLowerCase().includes(query)
        );
    });

    renderChannels(filteredChannels);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', loadChannelsData);
