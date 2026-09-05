export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }
  next();
}

export function validateProperty(req, res, next) {
  const {
    title,
    property_type,
    price,
    area,
    location_name
  } = req.body || {};

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Property title must be at least 3 characters long.');
  }

  const validTypes = [
    'Plot',
    'Residential Plot',
    'Commercial Plot',
    'House',
    'Villa',
    'Apartment',
    'Builder Floor',
    'Land',
    'Commercial',
    'Other'
  ];

  if (!property_type || !validTypes.includes(property_type)) {
    errors.push(`Invalid property type. Must be one of: ${validTypes.join(', ')}`);
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    errors.push('Price must be a positive number.');
  }

  const numArea = Number(area);
  if (isNaN(numArea) || numArea <= 0) {
    errors.push('Area must be a positive number.');
  }

  if (!location_name || typeof location_name !== 'string' || !location_name.trim()) {
    errors.push('Location name / city is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}

export function validatePropertyUpdate(req, res, next) {
  const {
    title,
    property_type,
    price,
    area,
    location_name
  } = req.body || {};

  const errors = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3)) {
    errors.push('Property title must be at least 3 characters long.');
  }

  const validTypes = [
    'Plot',
    'Residential Plot',
    'Commercial Plot',
    'House',
    'Villa',
    'Apartment',
    'Builder Floor',
    'Land',
    'Commercial',
    'Other'
  ];

  if (property_type !== undefined && !validTypes.includes(property_type)) {
    errors.push(`Invalid property type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push('Price must be a positive number.');
    }
  }

  if (area !== undefined) {
    const numArea = Number(area);
    if (isNaN(numArea) || numArea <= 0) {
      errors.push('Area must be a positive number.');
    }
  }

  if (location_name !== undefined && (typeof location_name !== 'string' || !location_name.trim())) {
    errors.push('Location name / city cannot be empty.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}

export function validateEnquiry(req, res, next) {
  const { name, phone, email, message } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const cleanPhone = (phone || '').toString().trim().replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 8 || !/^[+]?[0-9]{8,15}$/.test(cleanPhone)) {
    errors.push('A valid phone number with 8-15 digits is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    errors.push('Message must be at least 5 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}

export function validateAppointment(req, res, next) {
  const { name, phone, email, preferred_date, preferred_time } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const cleanPhone = (phone || '').toString().trim().replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 8 || !/^[+]?[0-9]{8,15}$/.test(cleanPhone)) {
    errors.push('A valid phone number is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!preferred_date || typeof preferred_date !== 'string') {
    errors.push('Preferred appointment date is required.');
  } else {
    const selectedDate = new Date(preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      errors.push('Preferred date is not a valid date format.');
    } else if (selectedDate < today) {
      errors.push('Appointment date cannot be in the past.');
    }
  }

  if (!preferred_time || typeof preferred_time !== 'string' || !preferred_time.trim()) {
    errors.push('Preferred time slot is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}
