importScripts('./ngsw-worker.js')

// https://stackoverflow.com/questions/39418545/chrome-push-notification-how-to-open-url-adress-after-click

self.addEventListener('notificationclick', function(event) {
    const action = event.action
    const notificationData = event.notification.data
    // let url = 'https://example.com/some-path/';
    const url = handleUrl(notificationData)

    event.notification.close() // Android needs explicit close.
    event.waitUntil(
        clients
            .matchAll({ includeUncontrolled: true, type: 'window' })
            .then(windowClients => {
                // Check if there is already a window/tab open with the target URL
                for (let i = 0; i < windowClients.length; i++) {
                    let client = windowClients[i]
                    // If so, just focus it.
                    if (client.url === url && 'focus' in client) {
                        return client.focus()
                    }
                }
                // If not, then open the target URL in a new window/tab.
                if (clients.openWindow) {
                    return clients.openWindow(url)
                }
            }),
    )
})

function handleUrl(notificationData) {
    const {
        organization: organizationUrl,
        url: slug,
        originUrl,
    } = notificationData
    // const { hostname } = window.location
    // const [currentUrl, ...rest] = hostname.split('.')
    let url = `https://${organizationUrl}`
    let urlEnd = '.newvote.org/'

    if (originUrl === 'staging') {
        url += '.staging'
    }
    // const newHostName = organizationUrl + '.' + rest.join('.')
    let hostName = url + urlEnd
    let notificationUrlPath = `issues/${slug}`

    return `${hostName}${notificationUrlPath}`
}
