export function generateSubscribeButton() {
  return `
    <li class="push-notification-item">
      <button id="subscribe-button" class="push-notification-button" aria-label="Subscribe to push notifications">
        <i class="bi bi-bell"></i>
        <span>Enable Notifications</span>
      </button>
    </li>
  `;
}

export function generateUnsubscribeButton() {
  return `
    <li class="push-notification-item">
      <button id="unsubscribe-button" class="push-notification-button" aria-label="Unsubscribe from push notifications">
        <i class="bi bi-bell-slash"></i>
        <span>Disable Notifications</span>
      </button>
    </li>
  `;
}