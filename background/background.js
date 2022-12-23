const storageCache = { volume: 100, lastTabAttenuated: null };

chrome.storage.local.get().then((items) => {
	console.log('init', items);
	Object.assign(storageCache, items);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
		storageCache[key] = newValue;
		console.log(
			`Storage key "${key}" in namespace "${namespace}" changed.`,
			`Old value was "${oldValue}", new value is "${newValue}".`
		);
	}
	console.log(storageCache);
	if (!storageCache.lastTabAttenuated) lowerVolumesInOtherTabs(true);
	else lowerVolumesInOtherTabs(false);
});

async function getAllTabs() {
	return await chrome.tabs.query({});
}

async function lowerVolumesInOtherTabs(reset = false) {
	const tabs = await getAllTabs();
	await chrome.scripting.executeScript({
		target: { tabId: storageCache.lastTabAttenuated },
		func: changeVolumeInTab,
		args: [true, storageCache.volume],
	});
	for (const tab of tabs) {
		if (tab.id != storageCache.lastTabAttenuated) {
			console.log(`Lowering volume in ${tab.id} to ${storageCache.volume}`);
			try {
				await chrome.scripting.executeScript({
					target: { tabId: tab.id },
					func: changeVolumeInTab,
					args: [reset, storageCache.volume],
				});
			} catch {
				console.log('Skipped tab: ', tab.id);
			}
		}
	}
}

function changeVolumeInTab(reset, newVolume) {
	const elements = Array.from(document.getElementsByTagName('audio')).concat(
		Array.from(document.getElementsByTagName('video'))
	);
	for (const elem of elements) {
		console.log('Found element: ', elem);
		elem.volume = reset ? 1 : newVolume / 100;
	}
}
