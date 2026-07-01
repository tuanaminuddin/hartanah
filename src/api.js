async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`/api${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Unable to connect to the server.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Unable to reach the API. Make sure the server is running.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function login(credentials) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getProperties(token = '', query = {}) {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) parameters.set(key, String(value));
  });
  const queryString = parameters.toString();
  return request(`/properties${queryString ? `?${queryString}` : ''}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function getProperty(token, propertyId) {
  return request(`/properties/${propertyId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function createProperty(token, property) {
  return request('/properties', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(property),
  });
}

export function updateProperty(token, propertyId, property) {
  return request(`/properties/${propertyId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(property),
  });
}

export function updatePropertyArchive(token, propertyId, archived) {
  return request(`/properties/${propertyId}/archive`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ archived }),
  });
}

export function permanentlyDeleteProperty(token, propertyId) {
  return request(`/properties/${propertyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getUsers(token) {
  return request('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createUser(token, user) {
  return request('/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(user),
  });
}

export function deleteUser(token, userId) {
  return request(`/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
