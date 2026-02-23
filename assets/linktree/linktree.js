document.addEventListener('DOMContentLoaded', function () {
    const discordLink = document.querySelector('.discord-link');
    const discordPopup = document.querySelector('.discord-popup');
    const closePopupBtn = document.querySelector('.close-popup');
    const copyBtn = document.querySelector('.copy-btn');

    if (discordLink) {
        discordLink.addEventListener('click', function (e) {
            e.preventDefault();
            discordPopup.style.display = 'flex';
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', function () {
            discordPopup.style.display = 'none';
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const username = 'DaintyDust';
            navigator.clipboard.writeText(username).then(function () {
                copyBtn.textContent = 'Copied!';
                setTimeout(function () {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }).catch(function () {
                alert('Failed to copy to clipboard. Username: ' + username);
            });
        });
    }

    if (discordPopup) {
        discordPopup.addEventListener('click', function (e) {
            if (e.target === discordPopup) {
                discordPopup.style.display = 'none';
            }
        });
    }
});