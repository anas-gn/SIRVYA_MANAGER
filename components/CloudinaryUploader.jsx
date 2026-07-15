"use client";

import { useState } from "react";

export default function CloudinaryUploader({ folder, target, advisorId, onUploaded, label }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const sigRes = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder })
      });
      const sig = await sigRes.json();
      if (!sigRes.ok) throw new Error(sig.error || "Erreur signature Cloudinary");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", sig.timestamp);
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Erreur upload Cloudinary");

      const saveRes = await fetch("/api/upload/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, url: uploadData.secure_url, advisorId })
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Erreur sauvegarde photo");

      onUploaded?.(uploadData.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="btn-secondary cursor-pointer inline-block text-sm">
        {uploading ? "Envoi en cours..." : label || "Choisir une photo"}
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploading} />
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
