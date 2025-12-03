// 在文件最开头添加
console.log("main.js loaded and executing.");

// DOM元素
const channelsContainer = document.getElementById('channelsContainer');
const searchInput = document.getElementById('searchInput');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

// 模态框DOM元素
const modal = document.getElementById('videoModal');
const modalTitle = document.getElementById('modalTitle');
const modalThumbnail = document.getElementById('modalThumbnail');
const modalMeta = document.getElementById('modalMeta');
const modalDescription = document.getElementById('modalDescription');
const modalWatchLink = document.getElementById('modalWatchLink');
const modalCloseBtn = document.getElementById('modalClose');

// 从全局变量获取数据 (由模板注入)
const channelsData = window.channelsData;

// 当前视图模式
let currentView = 'grid';

// 初始化页面
function init() {
        console.log("init() function called.");
    if (!channelsData) {
        console.error("Channel data not found!");
        return;
    }
    console.log("Channel data found:", channelsData);
    renderChannels(channelsData);
    setupEventListeners();
    console.log("Initialization complete.");
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', handleSearch);

    // 视图切换
        gridViewBtn.addEventListener('click', () => {
        console.log("Grid view button clicked.");
        switchView('grid');
    });
    listViewBtn.addEventListener('click', () => {
        console.log("List view button clicked.");
        switchView('list');
    });
    // gridViewBtn.addEventListener('click', () => switchView('grid'));
    // listViewBtn.addEventListener('click', () => switchView('list'));

    // 模态框关闭事件
    modalCloseBtn.onclick = () => closeModal();
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
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

    const videosContainer = document.createElement('div');
    videosContainer.className = 'videos-container';

    const leftBtn = document.createElement('button');
    leftBtn.className = 'scroll-btn left';
    leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftBtn.addEventListener('click', () => scrollVideos(channel.id, 'left'));

    const videosScroll = document.createElement('div');
    videosScroll.className = 'videos-scroll';
    videosScroll.id = `videos-${channel.id}`;

    channel.videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videosScroll.appendChild(videoCard);
    });

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
    
    card.addEventListener('click', () => openModal(video));

    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';

    const img = document.createElement('img');
    img.src = video.thumbnail;
    img.alt = video.title;
    img.loading = 'lazy';

    const duration = document.createElement('div');
    duration.className = 'video-duration';
    duration.textContent = video.duration;

    thumbnail.appendChild(img);
    thumbnail.appendChild(duration);

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

    return card;
}
        
// 打开模态框的函数
function openModal(video) {
    modalTitle.textContent = video.title;
    modalThumbnail.src = video.thumbnail;
    modalThumbnail.alt = video.title;
    modalMeta.textContent = `${video.published} | ${video.duration || 'N/A'}`;
    modalDescription.textContent = `视频简介：${video.title}`;
    modalWatchLink.href = video.link;
    modal.style.display = 'block';
}

// 关闭模态框的函数
function closeModal() {
    modal.style.display = 'none';
}

// 滚动视频列表
function scrollVideos(channelId, direction) {
    const videosScroll = document.getElementById(`videos-${channelId}`);
    const scrollAmount = 210;
    if (direction === 'left') {
        videosScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        videosScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// 切换视图
function switchView(view) {
        console.log(`Switching view to: ${view}`);
    currentView = view;
    if (view === 'grid') {
        channelsContainer.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        channelsContainer.classList.add('list-view');
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
    }
}

// 搜索处理
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderChannels(channelsData);
        return;
    }
    const filteredChannels = channelsData.filter(channel => {
        if (channel.title.toLowerCase().includes(query)) return true;
        return channel.videos.some(video => video.title.toLowerCase().includes(query));
    });
    renderChannels(filteredChannels);
}

// // 页面加载完成后初始化
// document.addEventListener('DOMContentLoaded', init);
// 在文件最末尾添加
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");
    init();
});
