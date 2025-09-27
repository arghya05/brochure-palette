import React from 'react';
import { ImageGenerationLayout } from './ImageGenerationLayout';

export const ImageGenerationAgent: React.FC = () => {
  return <ImageGenerationLayout />;
};

// Endpoint Schema for Image Generation Agent
export const ImageGenerationEndpointSchema = {
  endpoint: 'POST /generate-image-agent',
  description: 'Generate marketing images using AI based on brochure data',
  requestBody: {
    brochure_data: 'BrochureData[] - Array of product data to include',
    style_prompt: 'string - Style description for the generated image',
    image_type: '"flyer" | "poster" | "banner" | "social_media" - Type of marketing material',
    dimensions: '{ width: number, height: number } - Image dimensions in pixels',
    additional_prompt: 'string? - Additional instructions for generation',
    brand_colors: 'string[]? - Array of brand colors (hex codes or color names)',
  },
  response: {
    success: 'boolean - Whether generation was successful',
    image_url: 'string? - URL to the generated image (if successful)',
    error: 'string? - Error message (if failed)',
    generation_id: 'string - Unique identifier for this generation',
  },
  example: {
    request: {
      brochure_data: [
        {
          sku: 'SKU001',
          arabic_description: 'وصف المنتج',
          english_description: 'Product description',
          regular_price: '10.99',
          promo_price: '8.99',
          icon_name: 'product-icon'
        }
      ],
      style_prompt: 'Modern minimalist flyer with vibrant colors and clean typography',
      image_type: 'flyer',
      dimensions: { width: 1024, height: 1536 },
      additional_prompt: 'Include company logo in corner',
      brand_colors: ['#FF5733', '#3498DB']
    },
    response: {
      success: true,
      image_url: 'https://example.com/generated-image.jpg',
      generation_id: 'gen_12345678'
    }
  }
};