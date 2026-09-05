import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  Star,
  Plus,
  Video,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const COMMON_AMENITIES = [
  '24x7 Security',
  'Gated Community',
  'Parks & Green Belts',
  'Power Backup',
  'Water Supply',
  'Underground Utilities',
  'Modular Kitchen',
  'Lift / Elevator',
  'Swimming Pool',
  'Clubhouse',
  'Wide Roads',
  'Near Metro Station',
  'CCTV Surveillance',
  'EV Charging Station',
  'Visitor Parking',
  'Freehold Title'
];

export default function AdminPropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    title: '',
    property_type: 'Plot',
    listing_type: 'Sale',
    price: '',
    price_display: '',
    location_name: 'Faridabad',
    city: 'Faridabad',
    state: 'Haryana',
    address: '',
    area: '',
    area_unit: 'sq ft',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    facing: 'North',
    road_width: '30 ft',
    parking: '',
    furnished_status: 'Unfurnished',
    construction_status: 'Plot / Land',
    possession_date: 'Immediate',
    description: '',
    amenities: ['24x7 Security', 'Wide Roads', 'Gated Community'],
    nearby_landmarks_text: '',
    featured: 0,
    status: 'Available'
  });

  // Media state
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  useEffect(() => {
    if (isEdit) {
      async function loadExisting() {
        setFetching(true);
        try {
          const res = await api.properties.adminGetById(id);
          if (res.success && res.data) {
            const p = res.data;
            setFormData({
              title: p.title || '',
              property_type: p.property_type || 'Plot',
              listing_type: p.listing_type || 'Sale',
              price: p.price || '',
              price_display: p.price_display || '',
              location_name: p.location_name || '',
              city: p.city || '',
              state: p.state || 'Haryana',
              address: p.address || '',
              area: p.area || '',
              area_unit: p.area_unit || 'sq ft',
              bedrooms: p.bedrooms !== null ? p.bedrooms : '',
              bathrooms: p.bathrooms !== null ? p.bathrooms : '',
              floors: p.floors !== null ? p.floors : '',
              facing: p.facing || '',
              road_width: p.road_width || '',
              parking: p.parking || '',
              furnished_status: p.furnished_status || '',
              construction_status: p.construction_status || '',
              possession_date: p.possession_date || '',
              description: p.description || '',
              amenities: Array.isArray(p.amenities) ? p.amenities : [],
              nearby_landmarks_text: Array.isArray(p.nearby_landmarks) ? p.nearby_landmarks.join(', ') : '',
              featured: p.featured ? 1 : 0,
              status: p.status || 'Available'
            });
            setImages(p.images || []);
            setVideos(p.videos || []);
          }
        } catch (err) {
          setError(err.message || 'Failed to load property details.');
        } finally {
          setFetching(false);
        }
      }
      loadExisting();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  // Image Upload Handler
  const handleImageFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isEdit) {
      alert('Please save the basic property details first before uploading images.');
      return;
    }

    setUploadingImage(true);
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append('images', files[i]);
    }

    try {
      const res = await api.media.uploadImages(id, form);
      if (res.success && res.data) {
        setImages(prev => [...prev, ...res.data]);
        setSuccess('Images uploaded successfully.');
      }
    } catch (err) {
      setError(err.message || 'Image upload failed. Allowed formats: JPG, PNG, WEBP (Max 5MB)');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  // Set Primary Image
  const handleSetPrimary = async (imageId) => {
    try {
      const res = await api.media.setPrimaryImage(imageId);
      if (res.success) {
        setImages(prev =>
          prev.map(img => ({
            ...img,
            is_primary: img.id === imageId ? 1 : 0
          }))
        );
      }
    } catch (err) {
      alert('Failed to set primary image');
    }
  };

  // Delete Image
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const res = await api.media.deleteImage(imageId);
      if (res.success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  // Reorder Image
  const handleMoveImage = async (index, direction) => {
    const newImages = [...images];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);

    const reorderPayload = newImages.map((img, idx) => ({ id: img.id, order: idx }));
    try {
      await api.media.reorderImages(reorderPayload);
    } catch (e) {
      console.error('Failed to sync image order to server');
    }
  };

  // Add Video Tour URL
  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return;
    if (!isEdit) {
      alert('Please save the property before adding video links.');
      return;
    }

    try {
      const res = await api.media.addVideo(id, {
        video_url: newVideoUrl.trim(),
        title: newVideoTitle.trim() || 'Property Video Walkthrough',
        video_type: 'youtube'
      });
      if (res.success && res.data) {
        setVideos(prev => [...prev, res.data]);
        setNewVideoUrl('');
        setNewVideoTitle('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add video');
    }
  };

  // Delete Video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Remove this video?')) return;
    try {
      await api.media.deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err) {
      alert('Failed to remove video');
    }
  };

  // Main Save Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const landmarks = formData.nearby_landmarks_text
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      price: Number(formData.price),
      area: Number(formData.area),
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      floors: formData.floors ? Number(formData.floors) : null,
      nearby_landmarks: landmarks
    };

    try {
      if (isEdit) {
        const res = await api.properties.adminUpdate(id, payload);
        if (res.success) {
          setSuccess('Property updated successfully.');
        }
      } else {
        const res = await api.properties.adminCreate(payload);
        if (res.success && res.data) {
          navigate(`/admin/properties/edit/${res.data.id}`);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save property. Please review required fields.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
        Loading property information...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/properties" className="action-icon-btn">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              {isEdit ? 'Edit Property Listing' : 'Create New Property'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              {isEdit ? `Editing: ${formData.title}` : 'Fill in the specifications below to publish or save as draft.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/properties" className="btn btn-outline btn-sm">
            Cancel
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="btn btn-gold btn-sm"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create & Upload Media')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ padding: '1rem', background: '#ecfdf5', color: '#059669', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">1. Basic Property Information</h2>

          <div className="form-group">
            <label className="form-label">Property Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Faridabad Sector 14 Luxury 4BHK Independent Villa"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Property Type *</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Plot">Plot (General)</option>
                <option value="Residential Plot">Residential Plot</option>
                <option value="Commercial Plot">Commercial Plot</option>
                <option value="Villa">Luxury Villa</option>
                <option value="House">Independent House</option>
                <option value="Apartment">Apartment</option>
                <option value="Builder Floor">Builder Floor</option>
                <option value="Land">Land / Agricultural</option>
                <option value="Commercial">Commercial Shop / Office</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Listing Type</label>
              <select
                name="listing_type"
                value={formData.listing_type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
                <option value="Lease">Commercial Lease</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Price (INR) *</label>
              <input
                type="number"
                name="price"
                required
                placeholder="e.g. 7500000"
                value={formData.price}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Custom Display Price (Optional)</label>
              <input
                type="text"
                name="price_display"
                placeholder="Auto-calculated if empty (e.g. ₹ 75 Lakh)"
                value={formData.price_display}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / City *</label>
              <input
                type="text"
                name="location_name"
                required
                placeholder="e.g. Faridabad, Gurgaon, Noida"
                value={formData.location_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Address / Landmark</label>
            <input
              type="text"
              name="address"
              placeholder="e.g. Sector 14, Main Commercial Boulevard, Near Bata Chowk"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* SECTION 2: SPECIFICATIONS */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">2. Technical Specifications & Dimensions</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Plot / Carpet Area *</label>
              <input
                type="number"
                name="area"
                required
                placeholder="e.g. 1800"
                value={formData.area}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Area Unit</label>
              <select
                name="area_unit"
                value={formData.area_unit}
                onChange={handleChange}
                className="form-select"
              >
                <option value="sq ft">sq ft (Square Feet)</option>
                <option value="sq yd">sq yd (Square Yards)</option>
                <option value="gaj">Gaj</option>
                <option value="acre">Acre</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Facing Direction</label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="form-select"
              >
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="South">South</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Front Access Road</label>
              <input
                type="text"
                name="road_width"
                placeholder="e.g. 30 ft, 60 ft, 18 mtr"
                value={formData.road_width}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Construction Status</label>
              <select
                name="construction_status"
                value={formData.construction_status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Plot / Land">Plot / Land</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="New Launch">New Launch</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Possession Date</label>
              <input
                type="text"
                name="possession_date"
                placeholder="Immediate / Immediate Registry / Dec 2026"
                value={formData.possession_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Conditional Specs for Houses / Flats */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bedrooms (If applicable)</label>
              <input
                type="number"
                name="bedrooms"
                placeholder="e.g. 3 or 4"
                value={formData.bedrooms}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bathrooms (If applicable)</label>
              <input
                type="number"
                name="bathrooms"
                placeholder="e.g. 3"
                value={formData.bathrooms}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Floors</label>
              <input
                type="number"
                name="floors"
                placeholder="e.g. 3"
                value={formData.floors}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Parking Details</label>
              <input
                type="text"
                name="parking"
                placeholder="e.g. 2 Covered Car Parks, Stilt Parking"
                value={formData.parking}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Furnishing Status</label>
              <select
                name="furnished_status"
                value={formData.furnished_status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully-Furnished">Fully-Furnished</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: DESCRIPTION & AMENITIES */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">3. Description & Amenities</h2>

          <div className="form-group">
            <label className="form-label">Property Description *</label>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Highlight property title clearance, access roads, amenities, nearby metro, and unique selling points..."
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>
              Select Amenities & Infrastructure
            </label>
            <div className="amenities-checkbox-grid">
              {COMMON_AMENITIES.map((amenity) => (
                <label key={amenity} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nearby Landmarks (Comma-separated)</label>
            <input
              type="text"
              name="nearby_landmarks_text"
              placeholder="e.g. Bata Chowk Metro (1.2 km), Apeejay School (800 m), Fortis Hospital (2 km)"
              value={formData.nearby_landmarks_text}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* SECTION 4: MEDIA MANAGEMENT */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">4. Media Management (Photos & Videos)</h2>

          {!isEdit ? (
            <div style={{ padding: '1.5rem', background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '10px', color: '#b45309' }}>
              <p style={{ fontWeight: 600 }}>Save the property first to upload images and videos.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Click <strong>"Create & Upload Media"</strong> below, and you will immediately be able to drag-and-drop property photos.
              </p>
            </div>
          ) : (
            <div>
              {/* Image Upload Box */}
              <div className="media-manager-box" onClick={() => document.getElementById('imageFileInput').click()}>
                <Upload size={32} color="#b87d28" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {uploadingImage ? 'Uploading Photos...' : 'Click to Upload Property Photos'}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Supports JPG, PNG, WEBP (Max 5MB each). Select multiple images at once.
                </p>
                <input
                  type="file"
                  id="imageFileInput"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageFiles}
                  disabled={uploadingImage}
                />
              </div>

              {/* Uploaded Images List */}
              {images.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
                    Uploaded Images ({images.length}) — Click Star to set as Primary Photo
                  </h4>
                  <div className="media-grid">
                    {images.map((img, idx) => (
                      <div key={img.id} className="media-item-card">
                        <img src={img.url} alt={img.caption || 'Photo'} className="media-item-thumb" />
                        <div className="media-item-actions">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(img.id)}
                            className={`btn-star-primary ${img.is_primary ? 'active' : ''}`}
                            title={img.is_primary ? 'Primary Thumbnail' : 'Set as Primary'}
                          >
                            <Star size={18} fill={img.is_primary ? '#f59e0b' : 'none'} />
                          </button>

                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, -1)}
                              className="action-icon-btn"
                              style={{ width: '28px', height: '28px' }}
                              title="Move Left"
                            >
                              <ArrowLeft size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => handleMoveImage(idx, 1)}
                              className="action-icon-btn"
                              style={{ width: '28px', height: '28px' }}
                              title="Move Right"
                            >
                              <ArrowRight size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="action-icon-btn delete"
                              style={{ width: '28px', height: '28px' }}
                              title="Delete Image"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Tour Section */}
              <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={18} color="#b87d28" />
                  <span>Property Video Tour</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                  <div>
                    <label className="form-label">Video URL (YouTube or Vimeo)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Video Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Architectural Walkthrough"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    className="btn btn-dark btn-sm"
                    style={{ height: '44px' }}
                  >
                    <Plus size={16} />
                    <span>Add Video</span>
                  </button>
                </div>

                {videos.length > 0 && (
                  <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                    {videos.map((vid) => (
                      <li key={vid.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <div>
                          <strong>{vid.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.75rem' }}>{vid.video_url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="action-icon-btn delete"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: PUBLISHING CONTROLS */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">5. Publication Status</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Property Availability Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Available">Available (Active Public Listing)</option>
                <option value="Reserved">Reserved (Under Token Agreement)</option>
                <option value="Sold">Sold (Mark as Sold)</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Draft">Draft (Admin Only - Hidden from Public)</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.75rem' }}>
              <label className="checkbox-label" style={{ fontWeight: 700 }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured === 1}
                  onChange={handleChange}
                />
                <span>Feature on Homepage Showcase</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '4rem' }}>
          <Link to="/admin/properties" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold btn-lg"
          >
            <Save size={18} />
            <span>{loading ? 'Saving Listing...' : (isEdit ? 'Save Changes' : 'Create & Upload Media')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
