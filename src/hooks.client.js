import '$lib/supabase';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const registration = await navigator.serviceWorker.register('/service-worker.js', {
				type: 'module'
			});

			// Check for updates periodically
			setInterval(() => {
				registration.update();
			}, 60 * 60 * 1000); // Check every hour

			// Handle updates
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New content is available, show update notification if needed
							console.log('New version available! Refresh to update.');
						}
					});
				}
			});
		} catch (error) {
			console.error('Service worker registration failed:', error);
		}
	});
}
