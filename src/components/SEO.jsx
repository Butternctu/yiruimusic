import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image }) => {
  const siteTitle = 'Dr. Yirui Li, Harpist & Educator | Houston, Texas';
  const defaultDescription = 'Houston harpist for weddings, corporate events & concerts. Dr. Yirui Li — award-winning performer, educator & Adjunct Professor at SHSU. Book harp performances or lessons across Houston, Texas.';
  const siteUrl = 'https://yiruimusic.com';
  const defaultImage = `${siteUrl}/yirui_cover.jpg`;

  const fullTitle = title === siteTitle ? title : `${title} | Yirui Li`;
  const metaDescription = description || defaultDescription;
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;
  const metaImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;
