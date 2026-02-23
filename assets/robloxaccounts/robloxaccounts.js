const robloxUserIDs = [
    544088422,   //daintydust05191
    455544701,   //nickverbruggen592
    524657251,   //aardbei919
    5073139088,  //NickStudiosUploader
    342197330,   //nickverbrugg
    547057686,   //nickverbruggen59
    543343227,   //nickverbruggen595
    523574085,   //banaan919
    2420401490,  //nickverbruggen5353
    2717491346,  //NanoBloxDev
    383005337,   //nicknnnnick
    3538200700,  //DaNickBuilder
    3538209403,  //NickBrickGuy
    7691568131,  //Nick_Test535
    260990972,   //nickverbruggen
    546138446,   //nickverbruggen53
];
const groupId = 8193767;

// Rate limiting settings
const RATE_LIMIT_CONFIG = {
    initialDelay: 1000,      // Start with 1 second delay
    maxDelay: 30000,         // Max 30 seconds delay
    maxRetries: 10,          // Max 10 retry attempts
    backoffMultiplier: 2     // Double delay each retry
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeApiCall(url, options = {}, retryCount = 0) {
    try {
        if (retryCount > 0) {
            console.log(`Making API call to: ${url} (attempt ${retryCount + 1})`);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (data.errors && data.errors.some(error => error.code === 4 || error.message.includes("Too many requests"))) {
            throw new Error("RATE_LIMITED");
        }

        if (data.errors && data.errors.length > 0) {
            console.warn(`API returned errors:`, data.errors);
        }

        return data;
    } catch (error) {
        if (error.message === "RATE_LIMITED" || error.name === "TypeError") {
            if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
                const delay = Math.min(
                    RATE_LIMIT_CONFIG.initialDelay * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, retryCount),
                    RATE_LIMIT_CONFIG.maxDelay
                );

                console.log(`Rate limited or network error. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${RATE_LIMIT_CONFIG.maxRetries})`);
                await sleep(delay);
                return safeApiCall(url, options, retryCount + 1);
            } else {
                console.error(`Max retries exceeded for ${url}`);
                throw new Error(`Failed after ${RATE_LIMIT_CONFIG.maxRetries} attempts`);
            }
        }
        throw error;
    }
}

async function fetchRobloxUserData(userId) {
    const data = await safeApiCall(`https://users.roproxy.com/v1/users/${userId}`);
    return data;
}

async function fetchRobloxUserThumbnail(userId) {
    const data = await safeApiCall(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
    return data.data[0].imageUrl;
}

async function fetchGroupIcon(groupId) {
    const data = await safeApiCall(`https://thumbnails.roproxy.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=Png`);
    return data.data[0].imageUrl;
}

async function fetchGroupData(groupId) {
    const data = await safeApiCall(`https://groups.roproxy.com/v1/groups/${groupId}`);
    console.log(data);
    return data;
}

async function fetchUserGroupRole(userId, groupId) {
    try {
        const data = await safeApiCall(`https://groups.roproxy.com/v1/users/${userId}/groups/roles`);
        const groupRole = data.data.find(group => group.group.id === groupId);
        return groupRole ? groupRole.role.name : 'No Role';
    } catch (error) {
        console.error('Error fetching user group role:', error);
        return 'Unknown Role';
    }
}

async function fetchGroupVisits(groupId) {
    try {
        let allData = [];
        let nextPageCursor = null;

        do {
            const data = await safeApiCall(`https://games.roproxy.com/v2/groups/${groupId}/gamesv2?accessFilter=2&sortOrder=Asc&limit=10&cursor=${nextPageCursor || ''}`);
            allData = allData.concat(data.data);
            nextPageCursor = data.nextPageCursor;

            if (nextPageCursor) {
                await sleep(500);
            }
        } while (nextPageCursor);

        console.log(allData);

        let totalVisits = 0;
        for (const game of allData) {
            totalVisits += game.placeVisits;
        }
        console.log(`Total Visits: ${totalVisits}`);

        return totalVisits.toLocaleString();
    } catch (error) {
        console.error('Error fetching group visits:', error);
        return 'Unknown';
    }
}

async function createGroupWidget() {
    try {
        const groupData = await fetchGroupData(groupId);
        const groupVisitsData = await fetchGroupVisits(groupId);
        const groupIconUrl = await fetchGroupIcon(groupId);

        const groupWidget = document.createElement('div');
        groupWidget.classList.add('group-widget');
        groupWidget.addEventListener('click', () => {
            window.open(`https://www.roblox.com/groups/${groupId}`, '_blank');
        });

        const groupIcon = document.createElement('img');
        groupIcon.src = groupIconUrl;
        groupIcon.alt = `${groupData.name} Icon`;

        const groupInfoDiv = document.createElement('div');
        groupInfoDiv.classList.add('group-widget-info');

        const groupName = document.createElement('span');
        groupName.textContent = groupData.name;
        groupName.classList.add('group-name');

        const groupMembers = document.createElement('span');
        groupMembers.textContent = `${groupData.memberCount.toLocaleString()} Members`;

        const groupVisits = document.createElement('span');
        groupVisits.textContent = `${groupVisitsData} Total Visits`;

        groupInfoDiv.appendChild(groupName);
        groupInfoDiv.appendChild(groupMembers);
        groupInfoDiv.appendChild(groupVisits);

        groupWidget.appendChild(groupIcon);
        groupWidget.appendChild(groupInfoDiv);

        return groupWidget;
    } catch (error) {
        console.error('Error creating group widget:', error);
        return null;
    }
}

function createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #ffffff;">
            <div style="font-size: 1.5rem; margin-bottom: 1rem;">Loading Roblox Data...</div>
            <div style="border: 2px solid #ffffff33; border-top: 2px solid #ffffff; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    return loading;
}

function createProgressIndicator() {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'loadingProgress';
    progressDiv.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
        z-index: 10;
        background: rgba(29, 34, 39, 0.9);
        padding: 8px 12px;
        border: 1px solid #ffffff33;
        border-radius: 0;
        letter-spacing: 0.5px;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff33;
        border-top: 2px solid #00594f;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

    const text = document.createElement('span');
    text.id = 'progressText';
    text.textContent = '0/' + robloxUserIDs.length;

    progressDiv.appendChild(spinner);
    progressDiv.appendChild(text);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    return progressDiv;
}

function updateProgress(loaded, total) {
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `${loaded}/${total}`;
    }
}

function removeProgressIndicator() {
    const progressDiv = document.getElementById('loadingProgress');
    if (progressDiv) {
        progressDiv.remove();
    }
}

async function displayRobloxAccounts() {
    const container = document.getElementById('robloxAccountsContainer');
    const groupContainer = document.getElementById('groupWidgetContainer');
    const pageContent = document.querySelector('.page-content');

    const progressIndicator = createProgressIndicator();
    pageContent.appendChild(progressIndicator);

    const loadingIndicator = createLoadingIndicator();
    container.appendChild(loadingIndicator);

    try {
        const groupWidget = await createGroupWidget();
        if (groupWidget) {
            groupContainer.appendChild(groupWidget);
        }

        container.removeChild(loadingIndicator);

        let loadedCount = 0;

        for (let i = 0; i < robloxUserIDs.length; i++) {
            const userId = robloxUserIDs[i];

            try {
                console.log(`Processing user ${i + 1}/${robloxUserIDs.length}: ${userId}`);

                const accountDiv = document.createElement('div');
                accountDiv.classList.add('roblox-account');
                accountDiv.style.opacity = '0.5';
                accountDiv.innerHTML = `
                    <div style="text-align: center; color: #ffffff88;">
                        <div style="font-size: 14px;">Loading user ${userId}...</div>
                        <div style="border: 1px solid #ffffff33; border-top: 1px solid #ffffff; border-radius: 50%; width: 20px; height: 20px; animation: spin 2s linear infinite; margin: 10px auto;"></div>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `;
                container.appendChild(accountDiv);

                const userData = await fetchRobloxUserData(userId);
                const userThumbnail = await fetchRobloxUserThumbnail(userId);

                accountDiv.style.opacity = '1';
                accountDiv.innerHTML = '';
                accountDiv.addEventListener('click', () => {
                    window.open(`https://www.roblox.com/users/${userId}/profile`, '_blank');
                });

                const img = document.createElement('img');
                img.src = userThumbnail;
                img.alt = `${userData.displayName}'s Profile Picture`;

                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.display = 'flex';
                userInfoDiv.style.flexDirection = 'column';
                userInfoDiv.style.flex = '1';

                const displayName = document.createElement('span');
                displayName.textContent = userData.displayName;
                displayName.style.fontSize = '18px';
                displayName.style.marginBottom = "5px";
                displayName.style.fontWeight = 'bold';

                const userName = document.createElement('span');
                userName.textContent = `@${userData.name}`;
                userName.style.textAlign = "left";
                userName.style.opacity = '0.8';

                userInfoDiv.appendChild(displayName);
                userInfoDiv.appendChild(userName);

                accountDiv.appendChild(img);
                accountDiv.appendChild(userInfoDiv);

                loadedCount++;
                updateProgress(loadedCount, robloxUserIDs.length);

                // if (i < robloxUserIDs.length - 1) {
                //     await sleep(750);
                // }

            } catch (error) {
                console.error(`Error loading data for user ${userId}:`, error);

                const accountDiv = container.children[container.children.length - 1];
                accountDiv.style.opacity = '1';
                accountDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #ff6b6b; border: 1px solid #ff6b6b;">
                        <div style="font-size: 14px;">Failed to load user ${userId}</div>
                        <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">Click to view profile</div>
                    </div>
                `;
                accountDiv.addEventListener('click', () => {
                    window.open(`https://www.roblox.com/users/${userId}/profile`, '_blank');
                });

                loadedCount++;
                updateProgress(loadedCount, robloxUserIDs.length);
            }
        }

        console.log('All users processed successfully!');

        setTimeout(() => {
            removeProgressIndicator();
        }, 2000);

    } catch (error) {
        console.error('Error loading group data:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ffffff;">
                <h3>Error Loading Data</h3>
                <p>Unable to load Roblox account information. Please try again later.</p>
            </div>
        `;
        removeProgressIndicator();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayRobloxAccounts();
});
