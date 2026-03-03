import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image }) => {
  const siteTitle = 'Dr. Yirui Li, Harpist & Educator | Houston, Texas';
  const defaultDescription = 'Official portfolio of Dr. Yirui Li — professional harpist and educator in Houston, Texas. Explore biography, performances, masterclasses, and booking contact.';
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
