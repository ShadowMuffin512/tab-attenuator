let currentlyAttenuatedTab;
let volume;


// TODO: Make more generic  (for any key).
chrome.storage.onChanged.addListener((changes, _) => {
    if (changes.hasOwnProperty('lastTabAttenuated')) {
        currentlyAttenuatedTab = changes.lastTabAttenuated.newValue;
    }
    if (changes.hasOwnProperty('volume')) {
        volume = changes.volume.newValue;
    }
	if (!currentlyAttenuatedTab) return;
    lowerVolumesInOtherTabs();
});

async function getAllTabs() {
	return await chrome.tabs.query({});
}

async function lowerVolumesInOtherTabs() {
	const tabs = await getAllTabs();
	for (const tab of tabs) {
		if (tab.id != currentlyAttenuatedTab) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: lowerVolumeInTab,
			});
		}
	}
}

function lowerVolumeInTab() {
	const elements = document
		.getElementsByTagName('audio')
		.concat(document.getElementsByTagName('video'));
	for (const elem of elements) {
        elem.volume = volume / 100;
    }
}
