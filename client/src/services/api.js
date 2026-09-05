const BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('apex_admin_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('apex_admin_token', token);
  } else {
    localStorage.removeItem('apex_admin_token');
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    ...(options.headers || {})
  };

  // Add authorization header if token exists and not already provided
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    me: () => request('/auth/me'),
    logout: () => {
      setAuthToken(null);
      return request('/auth/logout', { method: 'POST' });
    }
  },

  // Properties
  properties: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'All') {
          query.append(key, val);
        }
      });
      return request(`/properties?${query.toString()}`);
    },
    getFeatured: () => request('/properties/featured'),
    getBySlug: (slug) => request(`/properties/${slug}`),

    // Admin
    adminGetAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'All') {
          query.append(key, val);
        }
      });
      return request(`/admin/properties?${query.toString()}`);
    },
    adminGetById: (id) => request(`/admin/properties/${id}`),
    adminCreate: (data) => request('/admin/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    adminUpdate: (id, data) => request(`/admin/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    adminUpdateStatus: (id, status) => request(`/admin/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
    adminDelete: (id) => request(`/admin/properties/${id}`, {
      method: 'DELETE'
    })
  },

  // Media Management
  media: {
    uploadImages: (propertyId, formData) => request(`/admin/properties/${propertyId}/images`, {
      method: 'POST',
      body: formData
    }),
    deleteImage: (imageId) => request(`/admin/images/${imageId}`, {
      method: 'DELETE'
    }),
    setPrimaryImage: (imageId) => request(`/admin/images/${imageId}/primary`, {
      method: 'PATCH'
    }),
    reorderImages: (orderArray) => request('/admin/images/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ order: orderArray })
    }),
    addVideo: (propertyId, videoData) => request(`/admin/properties/${propertyId}/videos`, {
      method: 'POST',
      body: JSON.stringify(videoData)
    }),
    deleteVideo: (videoId) => request(`/admin/videos/${videoId}`, {
      method: 'DELETE'
    })
  },

  // Enquiries
  enquiries: {
    submit: (data) => request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    adminGetAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'All') {
          query.append(key, val);
        }
      });
      return request(`/admin/enquiries?${query.toString()}`);
    },
    adminUpdateStatus: (id, data) => request(`/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    adminDelete: (id) => request(`/admin/enquiries/${id}`, {
      method: 'DELETE'
    })
  },

  // Appointments
  appointments: {
    book: (data) => request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    adminGetAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'All') {
          query.append(key, val);
        }
      });
      return request(`/admin/appointments?${query.toString()}`);
    },
    adminUpdateStatus: (id, data) => request(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    adminDelete: (id) => request(`/admin/appointments/${id}`, {
      method: 'DELETE'
    })
  },

  // Locations
  locations: {
    getAll: () => request('/locations'),
    adminCreate: (data) => request('/locations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Settings
  settings: {
    get: () => request('/settings'),
    adminUpdate: (data) => request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // Dashboard
  dashboard: {
    getStats: () => request('/admin/dashboard')
  }
};
