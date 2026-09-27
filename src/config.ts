/**
 * Bank Sampah Kenanga 9 - Configuration
 *
 * Silakan ganti URL_APPS_SCRIPT_ANDA dengan URL Web App hasil deploy Google Apps Script Anda.
 * Format URL biasanya seperti:
 * https://script.google.com/macros/s/AKfycb.../exec
 */

export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGVUV-cInKdA9PQZAtmch2ika3npP7b6PRpAAoMO4XLUgDB6Pmu2Dc1wV_sHEt_Nc/exec";

// Kunci local storage untuk menyimpan custom URL yang diinput langsung via UI
export const STORAGE_KEYS = {
  CUSTOM_SCRIPT_URL: "bsk9_custom_script_url",
  AUTH_USER: "bsk9_auth_user",
  FONT_SIZE: "bsk9_large_font",
  DEMO_DATA: "bsk9_local_database_v1",
};

/**
 * Mendapatkan URL Google Apps Script yang aktif.
 * Mengutamakan URL yang dimasukkan admin lewat antarmuka web,
 * lalu fallback ke SCRIPT_URL di file ini.
 */
export function getActiveScriptUrl(): string {
  const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCRIPT_URL);
  if (custom && custom.trim() !== "") {
    return custom.trim();
  }
  return SCRIPT_URL;
}

/**
 * Cek apakah aplikasi saat ini terhubung ke Google Apps Script asli atau mode demo
 */
export function isUsingLiveScript(): boolean {
  const url = getActiveScriptUrl();
  return (
    url !== "URL_APPS_SCRIPT_ANDA" &&
    url.startsWith("https://script.google.com/macros/s/")
  );
}
