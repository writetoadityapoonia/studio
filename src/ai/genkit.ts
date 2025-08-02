/**
 * @fileoverview This file initializes and configures the Genkit AI instance.
 * It is the central point for setting up plugins and other Genkit-related
 * configurations for the entire application.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

// Initialize Genkit with the Google AI plugin.
// This makes Google's models (like Gemini) available for use in flows.
export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the API version. It's recommended to use a specific version.
      apiVersion: 'v1beta',
    }),
    firebase(),
  ],
  // Log events to the Firebase backend.
  // This is useful for monitoring and debugging flows.
  // Set `logStore` to 'firebase' to enable this.
  logStore: 'firebase',

  // Store traces in the Firebase backend.
  // This allows you to visualize the execution of your flows.
  // Set `traceStore` to 'firebase' to enable this.
  traceStore: 'firebase',

  // Enable flow state management.
  // This is required for flows that have resumable steps.
  // Set `flowStateStore` to 'firebase' to enable this.
  flowStateStore: 'firebase',

  // Configure caching to use Firebase.
  // This can help improve performance by caching the results of expensive operations.
  // Set `cache` to 'firebase' to enable this.
  cache: 'firebase',
});
