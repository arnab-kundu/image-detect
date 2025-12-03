"use client";
import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { Loader2, RefreshCw } from "lucide-react";
import "@tensorflow/tfjs-backend-webgl"; // <-- IMPORTANT

interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

const ImageDetector: React.FC = () => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load the model once on mount
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        if (isMounted) {
          setModel(loadedModel);
        }
      } catch (error) {
        console.error("Failed to load COCO-SSD model:", error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    import("@tensorflow/tfjs-backend-webgl").then(() => {
      tf.setBackend("webgl").then(() => tf.ready());
    });
  }, []);

  const fetchRandomImage = () => {
    // picsum provides random images with CORS enabled
    const randomUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
    setImageUrl(randomUrl);
    setInputUrl("");
    setDetections([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setImageUrl(inputUrl.trim());
      setDetections([]);
    }
  };

  const runDetection = async () => {
    if (!model || !imgRef.current) return;
    // Ensure image is fully loaded
    if (!imgRef.current.complete) {
      await new Promise<void>((resolve) => {
        imgRef.current!.onload = () => resolve();
      });
    }
    setLoading(true);
    const preds = await model.detect(imgRef.current);
    console.log("Predictions: ", preds);
    const formatted = preds.map((p) => ({
      class: p.class,
      score: p.score,
      bbox: p.bbox as [number, number, number, number],
    }));
    setDetections(formatted);
    setLoading(false);
  };

  // Detection is now triggered manually via the "Detect Image" button.
  // The automatic detection on image load has been disabled.

  return (
    <div className="max-w-2xl w-full space-y-6 p-6 bg-white/30 backdrop-blur-lg rounded-xl shadow-lg dark:bg-gray-800/30">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
        Image Detection
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="button"
          onClick={fetchRandomImage}
          className="flex items-center gap-1 rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700"
        >
          <RefreshCw size={18} /> Random
        </button>
        <button
          type="button"
          onClick={runDetection}
          className="flex items-center gap-1 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
        >
          Detect Image
        </button>
      </form>

      {imageUrl && (
        <div className="relative flex justify-center">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Selected"
            className="max-h-96 rounded shadow"
            crossOrigin="anonymous"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          )}
        </div>
      )}

      {detections.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Detections:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {detections.map((d, idx) => (
              <li key={idx}>
                {d.class} – {(d.score * 100).toFixed(1)}% confidence
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageDetector;
