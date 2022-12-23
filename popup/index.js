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

	$('#attenuateButton')
		.text(tabAttenuationButtonMode.text)
		.on('click', tabAttenuationButtonMode.clickFunction);
}

function startAttenuatingTab() {
	getCurrentTab().then((currentTab) => {
		console.log('Started attenuating: ', currentTab.id);
		chrome.storage.local.set({ lastTabAttenuated: currentTab.id }).then(() => {
			setAttenuateButton('on');
		});
	});
}

function stopAttenuatingTab() {
	console.log('Cleared attenuation');
	chrome.storage.local.set({ lastTabAttenuated: null }).then(() => {
		setAttenuateButton('off');
	});
}

function changeVolume(newValue) {
	console.log('Volume changed to: ', newValue);
	chrome.storage.local.set({ volume: newValue });
}

async function setVolumeSliderInfo(newValue = null) {
	if (!newValue) {
		const res = await chrome.storage.local.get('volume');
		const storedVolume = res.volume;
		if (!storedVolume) newValue = 100;
		else newValue = storedVolume;
		console.log('Volume initialized to: ', newValue);
		$('#volumeSlider').val(newValue);
	}
	$('#volumeValue').text(`${newValue}%`);
}

function setVolumeSliderListener() {
	$('#volumeSlider').on('change', () => {
		changeVolume($(this).val());
		setVolumeSliderInfo($(this).val());
	});
}

$(function () {
	console.log('EXTENSION LOADED');
	setAttenuateButton();
	setVolumeSliderListener();
	setVolumeSliderInfo();
});
