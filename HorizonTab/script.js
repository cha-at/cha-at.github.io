        function updateTime() {
            const now = new Date();
            
            // 格式化时间
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`;
            
            // 格式化日期
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekday = weekdays[now.getDay()];
            document.getElementById('date').textContent = `${year}年${month}月${day}日 ${weekday}`;
        }
        
        // 初始化时间并每秒更新
        updateTime();
        setInterval(updateTime, 1000);
        
        // 欢迎语
        const welcomeMessages = [
            "Hell-low world.",
            "欢迎回来，准备好开始工作了吗？",
            "继续前进。",
            "Where do you want to go today?",
            "已深度思考 0 秒。",
            "服务器繁忙，请稍后再试。",
            "ERROR 404"
        ];
        
        let currentWelcomeIndex = 0;
        
        function setWelcomeMessage() {
            const welcomeElement = document.getElementById('welcome-message');
            welcomeElement.textContent = welcomeMessages[currentWelcomeIndex];
            
            // 触发动画
            welcomeElement.style.animation = 'none';
            void welcomeElement.offsetWidth; // 触发重绘
            welcomeElement.style.animation = 'fadeIn 0.5s ease-out';
        }
        
        function nextWelcomeMessage() {
            currentWelcomeIndex = (currentWelcomeIndex + 1) % welcomeMessages.length;
            setWelcomeMessage();
        }
        
        // 初始化欢迎语
        currentWelcomeIndex = Math.floor(Math.random() * welcomeMessages.length);
        setWelcomeMessage();
        
        // 搜索功能
        function performSearch() {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
        }
        
        document.getElementById('search-btn').addEventListener('click', performSearch);
        
        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 快速链接功能
        const quickLinks = [
            { url: "https://github.com", icon: "https://github.githubassets.com/favicons/favicon-dark.png" },
            { url: "https://youtube.com", icon: "https://www.youtube.com/favicon.ico" },
            { url: "https://x.com", icon: "https://abs.twimg.com/favicons/twitter.3.ico" },
        ];
        
        document.querySelectorAll('.quick-link').forEach((link, index) => {
            link.addEventListener('click', () => {
                window.open(quickLinks[index].url, '_blank');
            });
        });
        
        // 主题切换功能
        const themeToggle = document.getElementById('theme-toggle-checkbox');
        const body = document.body;
        
        // 检查本地存储中的主题偏好
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
            themeToggle.checked = true;
        }
        
        themeToggle.addEventListener('change', () => {
            body.classList.toggle('light-theme');
            
            // 保存主题偏好到本地存储
            const isLight = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
        
        // 欢迎语切换功能
        document.getElementById('change-welcome-btn').addEventListener('click', nextWelcomeMessage);
        
        // 背景图功能
        const bgInput = document.getElementById('bg-input');
        const setBgBtn = document.getElementById('set-bg-btn');
        const resetBgBtn = document.getElementById('reset-bg-btn');
        
        // 检查本地存储中的背景图
        const savedBg = localStorage.getItem('background');
        if (savedBg) {
            body.style.setProperty('--custom-bg', `url('${savedBg}')`);
            body.classList.add('custom-bg');
            bgInput.value = savedBg;
        }
        
        setBgBtn.addEventListener('click', () => {
            const bgUrl = bgInput.value.trim();
            if (bgUrl) {
                body.style.setProperty('--custom-bg', `url('${bgUrl}')`);
                body.classList.add('custom-bg');
                localStorage.setItem('background', bgUrl);
            }
        });
        
        resetBgBtn.addEventListener('click', () => {
            body.style.removeProperty('--custom-bg');
            body.classList.remove('custom-bg');
            localStorage.removeItem('background');
            bgInput.value = '';
        });
        
        // 标签页名称功能
        const pageTitleInput = document.getElementById('page-title-input');
        const setTitleBtn = document.getElementById('set-title-btn');
        const pageTitle = document.getElementById('page-title');
        
        // 检查本地存储中的标签页名称
        const savedTitle = localStorage.getItem('pageTitle');
        if (savedTitle) {
            document.title = savedTitle;
            pageTitleInput.value = savedTitle;
        }
        
        setTitleBtn.addEventListener('click', () => {
            const newTitle = pageTitleInput.value.trim();
            if (newTitle) {
                document.title = newTitle;
                localStorage.setItem('pageTitle', newTitle);
            }
        });
        
        // 设置面板功能
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsTabs = document.querySelectorAll('.settings-tab');
        const settingsContents = document.querySelectorAll('.settings-content');
        
        settingsToggle.addEventListener('click', () => {
            settingsToggle.classList.toggle('active');
            settingsPanel.classList.toggle('active');
        });
        
        settingsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有active类
                settingsTabs.forEach(t => t.classList.remove('active'));
                settingsContents.forEach(c => c.classList.remove('active'));
                
                // 添加active类到当前tab
                tab.classList.add('active');
                const tabName = tab.getAttribute('data-tab');
                document.querySelector(`.settings-content[data-content="${tabName}"]`).classList.add('active');
            });
        });