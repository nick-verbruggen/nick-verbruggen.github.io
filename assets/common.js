function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/';
    }
}

function goHome() {
    window.location.href = '/';
}

function setupDiscordCopy() {
    const discordElements = document.querySelectorAll('#discord-icon, #discord-link, #discord-widget');

    discordElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const discordUsername = '@DaintyDust';
            const message = `Discord username: ${discordUsername}`;

            navigator.clipboard.writeText(discordUsername)
                .then(() => {
                    console.log('Copied to clipboard:', discordUsername);
                    alert(`${message}\n\nCopied to clipboard!`);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert(`${message}\n\n(Could not copy to clipboard)`);
                });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupDiscordCopy();

    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.imageRendering = 'pixelated';
        img.style.imageRendering = '-moz-crisp-edges';
        img.style.imageRendering = 'crisp-edges';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.pixel-button, .game-button, .back-button, .linktree-link');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-2px)';
        });
    });
});
