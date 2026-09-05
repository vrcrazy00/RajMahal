import React from 'react';

export default function VideoPlayer({ videoUrl, videoType = 'youtube', title = 'Property Video Tour' }) {
  if (!videoUrl) return null;

  // Convert regular YouTube link to embed link
  const getEmbedUrl = (url, type) => {
    if (type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        return url;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
    }

    if (type === 'vimeo' || url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }

    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl, videoType);
  const isDirectVideo = videoType === 'upload' || /\.(mp4|webm|ogg)$/i.test(videoUrl);

  return (
    <div className="video-section">
      <div className="video-container">
        {isDirectVideo ? (
          <video controls preload="metadata" title={title}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
