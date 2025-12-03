"use client";
import React, { useState, useEffect, useRef } from "react";
import '@tensorflow/tfjs-backend-cpu';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { Loader2, RefreshCw } from "lucide-react";
import "@tensorflow/tfjs-backend-webgl"; // <-- IMPORTANT

interface DetectionResult {
    class: string;
    score: number;
    bbox: [number, number, number, number];
}

const FullScreenDetector: React.FC = () => {
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [inputUrl, setInputUrl] = useState("");
    const [detections, setDetections] = useState<DetectionResult[]>([]);
    const [loading, setLoading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Load model once
    useEffect(() => {
        cocoSsd.load().then(setModel);
    }, []);

    const fetchRandom = () => {
        const url = `https://picsum.photos/1200/800?random=${Date.now()}`;
        setImageUrl(url);
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
        // Make sure the image is fully loaded
        if (!imgRef.current.complete) {
            await new Promise<void>((resolve) => {
                imgRef.current!.onload = () => resolve();
            });
        }
        setLoading(true);
        const preds = await model.detect(imgRef.current);
        if (preds.length === 0) {
            console.error("No predictions found");
            const formatted = [{
                class: "Unknown",
                score: 0.0,
                bbox: [0, 0, 0, 0] as [number, number, number, number],
            }];
            setDetections(formatted);
            setLoading(false);
            return;
        }
        console.info("Predictions: ", preds);
        const formatted = preds.map((p) => ({
            class: p.class,
            score: p.score,
            bbox: p.bbox as [number, number, number, number],
        }));
        setDetections(formatted);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
            {/* Top navigation */}
            <nav className="fixed inset-x-0 top-0 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/30">
                <h1 className="text-2xl font-semibold font-inter">Image Detector</h1>
                <a
                    href="https://github.com/your-repo"
                    className="text-gray-300 hover:text-white"
                >
                    GitHub
                </a>
            </nav>

            {/* Main content */}
            <main className="flex pt-20 min-h-[calc(100vh-4rem)]">
                {/* Left panel – image */}
                <section className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6">
                        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                            <input
                                type="url"
                                placeholder="Enter image URL"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                className="flex-1 rounded border border-gray-600 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="flex items-center gap-1 rounded bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-700"
                            >
                                Load
                            </button>
                            <button
                                type="button"
                                onClick={fetchRandom}
                                className="flex items-center gap-1 rounded bg-gray-600 px-3 py-2 hover:bg-gray-700"
                            >
                                <RefreshCw size={18} /> Random
                            </button>
                            <button
                                type="button"
                                onClick={runDetection}
                                className="flex items-center gap-1 rounded bg-green-600 px-3 py-2 hover:bg-green-700"
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
                                    className="max-w-full rounded shadow-lg"
                                    crossOrigin="anonymous"
                                />
                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <Loader2 className="animate-spin text-indigo-400" size={48} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Right panel – detections */}
                <aside className="w-80 bg-white/10 backdrop-blur-lg rounded-l-xl p-6 overflow-y-auto hidden lg:block">
                    <h2 className="mb-4 text-xl font-semibold">Detections</h2>
                    {detections.length > 0 ? (
                        <ul className="space-y-2">
                            {detections.map((d, i) => (
                                <li key={i} className="text-sm">
                                    <span className="font-medium">{d.class}</span> –{" "}
                                    {(d.score * 100).toFixed(1)}% confidence
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No detections yet.</p>
                    )}
                </aside>
            </main>
        </div>
    );
};

export default FullScreenDetector;