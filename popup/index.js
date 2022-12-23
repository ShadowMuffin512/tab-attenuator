const tabAttenuationButtonModes = {
	on: {
		text: 'Stop Attenuating',
		clickFunction: stopAttenuatingTab,
	},
	off: {
		text: 'Attenuate This Tab',
		clickFunction: startAttenuatingTab,
	},
};

async function getLastTabAttenuated() {
	const res = await chrome.storage.local.get('lastTabAttenuated');
	return res.lastTabAttenuated;
}

async function getCurrentTab() {
	const queryOptions = { active: true, lastFocusedWindow: true };
	const res = await chrome.tabs.query(queryOptions);
	return res[0];
}

async function setAttenuateButton(tabAttenuationButtonMode = null) {
	if (!tabAttenuationButtonMode) {
		const lastTabAttenuated = await getLastTabAttenuated();
		console.log('Last tab attenuated:', lastTabAttenuated);
		const currentTab = await getCurrentTab();
		console.log('Current tab:', currentTab.id);
		tabAttenuationButtonMode =
			lastTabAttenuated == currentTab.id
				? tabAttenuationButtonModes.on
				: tabAttenuationButtonModes.off;
	}

    console.log("Setting attenuation button to: ", tabAttenuationButtonMode)

	$('#attenuateButton')
		.text(tabAttenuationButtonMode.text)
		.on('click', tabAttenuationButtonMode.clickFunction);
}


async function startAttenuatingTab() {
	getCurrentTab().then((currentTab) => {
		console.log('Started attenuating: ', currentTab.id);
		chrome.storage.local.set({ lastTabAttenuated: currentTab.id }).then(async () => {
			console.log("storage set.")
			await setAttenuateButton(tabAttenuationButtonModes.on);
		});
	});
}

async function stopAttenuatingTab() {
	console.log('Cleared attenuation');
	chrome.storage.local.set({ lastTabAttenuated: null }).then(async () => {
		console.log("storage set.")
		await setAttenuateButton(tabAttenuationButtonModes.off);

	});
}

async function changeVolume(newValue) {
	console.log('Volume changed to: ', newValue);
	await chrome.storage.local.set({ volume: newValue });
}

async function setVolumeSliderInfo(newValue = null) {
	if (!newValue) {
		const res = await chrome.storage.local.get('volume');
		const storedVolume = res.volume;
		if (!storedVolume) {
			newValue = 100;
			await chrome.storage.local.set({ volume: newValue });
		} else newValue = storedVolume;
		console.log('Volume initialized to: ', newValue);
		$('#volumeSlider').val(newValue);
	}
	$('#volumeValue').text(`${newValue}%`);
}

async function setVolumeSliderListener() {
	$('#volumeSlider').on('input', async () => {
		await setVolumeSliderInfo($('#volumeSlider').val());
	});
	$('#volumeSlider').on('change', async () => {
		await changeVolume($('#volumeSlider').val());
	})
}

$(async function () {
	console.log('EXTENSION LOADED');
	await setAttenuateButton();
	await setVolumeSliderListener();
	await setVolumeSliderInfo();
});
