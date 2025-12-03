# Image Detection Web App Implementation Plan

## Goal
Create a single-page web application that allows users to input an image URL or fetch a random image, displays the image, and performs object detection using a client-side TensorFlow.js model (COCO-SSD).

## User Review Required
- **Model Choice**: Using `@tensorflow-models/coco-ssd` for client-side detection. This requires downloading the model (~megabytes) on first load.
- **CORS**: Fetching random images or user-provided URLs might face CORS issues if the server doesn't support it. I will use a proxy or a service that supports CORS (like `picsum.photos` or similar) for the random image. For user inputs, if CORS fails, I might need a server-side proxy route, but for now, I'll assume direct access or use a standard CORS proxy if needed. *Update: I will implement a simple API route in Next.js to proxy images if needed to avoid CORS issues.*

## Proposed Changes

### Project Structure
- `app/page.tsx`: Main application page.
- `components/ImageDetector.tsx`: Core component handling image loading and detection.
- `app/api/proxy/route.ts`: (Optional) API route to proxy images to avoid CORS.

### Dependencies
- `next`
- `react`, `react-dom`
- `@tensorflow/tfjs`
- `@tensorflow-models/coco-ssd`
- `lucide-react` (for icons)

### UI Design
- Modern, clean interface with Tailwind CSS.
- "Glassmorphism" or dark mode aesthetic.
- Responsive layout.

## Verification Plan

### Automated Tests
- None planned for this prototype (visual heavy).

### Manual Verification
1.  **Project Setup**: Verify `npm run dev` starts the server.
2.  **UI Rendering**: Check if the page loads with input, buttons, and placeholder.
3.  **Random Image**: Click "Random" button -> Verify image loads.
4.  **Detection**: Verify bounding boxes appear on the image and labels are correct (e.g., "person", "cat").
5.  **User Input**: Paste a valid image URL -> Verify image loads and detection runs.
