
const channelsContainer = document.getElementById('channelsContainer');
const searchInput = document.getElementById('searchInput');
const gridViewBtn = document.getElementById('gridViewBtn');
const compactViewBtn = document.getElementById('compactViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

const videoModal = document.getElementById('videoModal');
const videoModalIframe = document.getElementById('videoModalIframe');
const videoModalClose = document.getElementById('videoModalClose');

let channelsData = [];

let currentView = 'grid';

async function loadChannelsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        channelsData = await response.json();
        console.log("频道数据加载成功:", channelsData);
        init();
    } catch (error) {
        console.error("无法加载频道数据:", error);
        channelsContainer.innerHTML = `<p style="color: red; text-align: center;">加载频道数据失败，请检查网络连接或稍后重试。</p>`;
    }
}

function init() {
    renderChannels(channelsData);
    setupEventListeners();
}

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    gridViewBtn.addEventListener('click', () => switchView('grid'));
    compactViewBtn.addEventListener('click', () => switchView('compact'));
    listViewBtn.addEventListener('click', () => switchView('list'));
    videoModalClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
}

function renderChannels(channels) {
    channelsContainer.innerHTML = '';
    channels.forEach(channel => {
        const channelCard = createChannelCard(channel);
        channelsContainer.appendChild(channelCard);
    });
}

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
    if (channel.category) {
        const categoryBadge = document.createElement('div');
        categoryBadge.className = 'category-badge category-badge-top-right';
        categoryBadge.textContent = channel.category;
        header.appendChild(categoryBadge);
    }
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

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';
    const img = document.createElement('img');
    img.src = video.thumbnail;
    img.alt = video.title;
    img.loading = 'lazy';
    const duration = document.createElement('div');
    duration.className = 'video-duration';
    duration.textContent = video.duration;
    const playButton = document.createElement('div');
    playButton.className = 'play-button';
    playButton.innerHTML = '<i class="fas fa-play"></i>';
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
    if (video.is_today) {
        const todayBadge = document.createElement('div');
        todayBadge.className = 'today-badge';
        todayBadge.textContent = '今日更新';
        thumbnail.appendChild(todayBadge);
    }
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
    card.addEventListener('click', () => {
        window.open(video.link, '_blank');
    });
    return card;
}

function openVideoModal(embedUrl) {
    videoModalIframe.src = embedUrl;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    videoModal.style.display = 'none';
    videoModalIframe.src = '';
    document.body.style.overflow = 'auto';
}

function scrollVideos(channelId, direction) {
    if (currentView === 'list' || currentView === 'compact') {
        return;
    }
    const videosScroll = document.getElementById(`videos-${channelId}`);
    const scrollAmount = 210;
    if (direction === 'left') {
        videosScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        videosScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

function switchView(view) {
    currentView = view;
    gridViewBtn.classList.remove('active');
    compactViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');
    if (view === 'grid') {
        gridViewBtn.classList.add('active');
        channelsContainer.className = 'channels-container';
    } else if (view === 'compact') {
        compactViewBtn.classList.add('active');
        channelsContainer.className = 'channels-container channels-grid';
    } else if (view === 'list') {
        listViewBtn.classList.add('active');
        channelsContainer.className = 'channels-container list-view';
    }
}

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderChannels(channelsData);
        return;
    }
    const filteredChannels = channelsData.filter(channel => {
        if (channel.title.toLowerCase().includes(query)) {
            return true;
        }
        return channel.videos.some(video =>
            video.title.toLowerCase().includes(query)
        );
    });
    renderChannels(filteredChannels);
}

const backTopContainer = document.getElementById('back-top-container');
const backTopMain = document.getElementById('back-top-main');
const progressCircle = document.getElementById('progress-ring-circle');
if (backTopContainer && backTopMain && progressCircle) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;
    const scrollToTop = () => window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    function throttle(fn, delay = 50) {
        let timer = null;
        return function (...args) {
            if (!timer) {
                timer = setTimeout(() => {
                    fn.apply(this, args);
                    timer = null;
                }, delay);
            }
        };
    }
    const updateScrollProgress = () => {
        const {
            scrollY,
            innerHeight
        } = window;
        const {
            scrollHeight
        } = document.documentElement;
        const totalScrollableHeight = scrollHeight - innerHeight;
        if (totalScrollableHeight <= 0) {
            progressCircle.style.strokeDashoffset = circumference;
            return;
        }
        const scrollProgress = Math.min(scrollY / totalScrollableHeight, 1);
        const offset = circumference - (scrollProgress * circumference);
        progressCircle.style.strokeDashoffset = offset;
    };
    const handleScroll = throttle(() => {
        const shouldShow = window.scrollY > 100;
        if (shouldShow) {
            backTopContainer.classList.add('show');
        } else {
            backTopContainer.classList.remove('show');
        }
        updateScrollProgress();
    });
    backTopMain.addEventListener('click', scrollToTop);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
}

document.addEventListener('DOMContentLoaded', loadChannelsData);
