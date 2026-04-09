const submitBtn = document.getElementById('submit-btn');
        submitBtn.onmouseover = () => {
            submitBtn.textContent = '取消并删除所有内容';
            submitBtn.classList.replace('bg-black', 'bg-red-600');
        };
        submitBtn.onmouseout = () => {
            submitBtn.textContent = '发送';
            submitBtn.classList.replace('bg-red-600', 'bg-black');
        };
        submitBtn.onclick = () => {
            const input = submitBtn.previousElementSibling;
            input.value = '';
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '已成功销毁信息';
            setTimeout(() => {
                submitBtn.textContent = originalText;
            }, 2000);
        };