// OneSignal App ID (valor público — seguro no frontend).
// Pegue no dashboard do OneSignal: Settings > Keys & IDs.
export const ONESIGNAL_APP_ID = "34d3260d-fa10-46e8-b9c9-b0cf8413e6c7";

function pushDeferred(fn) {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(fn);
}

export function initOneSignal() {
  pushDeferred((OneSignal) => {
    try {
      OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: "OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/" },
        notifyButton: { enable: true },
      });
    } catch (e) {
      // ignora se o SDK não carregou
    }
  });
}

// Marca o navegador atual como seguidor da loja (tag por dispositivo)
export function setFollowTag(lojaId) {
  pushDeferred((OneSignal) => {
    try {
      OneSignal.User.addTag(`follows_${lojaId}`, "1");
    } catch (e) {}
  });
}

// Remove a tag de seguidor da loja
export function removeFollowTag(lojaId) {
  pushDeferred((OneSignal) => {
    try {
      OneSignal.User.removeTag(`follows_${lojaId}`);
    } catch (e) {}
  });
}
// Liga este navegador à conta da pessoa, para os avisos pessoais
// (pergunta nova, resposta) chegarem só para ela.
export function loginOneSignal(userId) {
  if (!userId) return;
  pushDeferred((OneSignal) => {
    try {
      OneSignal.login(String(userId));
    } catch (e) {}
  });
}

export function logoutOneSignal() {
  pushDeferred((OneSignal) => {
    try {
      OneSignal.logout();
    } catch (e) {}
  });
}

// Pede permissão de notificação (só se ainda não foi decidido).
export function pedirPermissaoNotificacao() {
  pushDeferred(async (OneSignal) => {
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await OneSignal.Notifications.requestPermission();
      }
    } catch (e) {}
  });
}
