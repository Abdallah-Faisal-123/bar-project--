// Small cookie helper (no external deps)
export function setCookie(name, value, days = 30){
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + ";" + expires + ";path=/";
}

export function getCookie(name){
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? JSON.parse(decodeURIComponent(v.pop())) : null;
}

export function deleteCookie(name){
  document.cookie = name + '=; Max-Age=0; path=/';
}
