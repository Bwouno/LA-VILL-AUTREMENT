async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.error) ||
      response.statusText ||
      'Erreur API';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function getPublicArticles() {
  return apiFetch('/api/public/articles');
}

export async function adminLogin({ username, password }) {
  return apiFetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

export async function adminLogout() {
  return apiFetch('/api/admin/auth/logout', { method: 'POST' });
}

export async function adminMe() {
  return apiFetch('/api/admin/auth/me');
}

export async function adminListArticles() {
  return apiFetch('/api/admin/articles');
}

export async function adminCreateArticle(article) {
  return apiFetch('/api/admin/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
}

export async function adminUpdateArticle(id, article) {
  return apiFetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
}

export async function adminDeleteArticle(id) {
  return apiFetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function adminUploadDataUrl({ fileName, dataUrl }) {
  return apiFetch('/api/admin/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, dataUrl })
  });
}

export async function adminListUsers() {
  return apiFetch('/api/admin/users');
}

export async function adminCreateUser({ username, password, role }) {
  return apiFetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
}

export async function adminDeleteUser(id) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

