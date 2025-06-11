"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DebugAuthPage() {
  const { user, loading, isSignedIn, isDraAnaFelicidad } = useAuth();
  const [debugData, setDebugData] = useState(null);
  const [clientCookies, setClientCookies] = useState("");

  useEffect(() => {
    // Check debug endpoint
    fetch("/api/auth/debug")
      .then(res => res.json())
      .then(data => setDebugData(data))
      .catch(err => console.error("Debug error:", err));
    
    // Set client cookies only on client side
    setClientCookies(document.cookie);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug de Autenticación</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Hook useAuth:</h2>
          <p><strong>Loading:</strong> {loading ? "Sí" : "No"}</p>
          <p><strong>Signed In:</strong> {isSignedIn ? "Sí" : "No"}</p>
          <p><strong>Es Dra Ana:</strong> {isDraAnaFelicidad ? "Sí" : "No"}</p>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "null"}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">API Debug:</h2>
          <pre className="text-sm">
            {debugData ? JSON.stringify(debugData, null, 2) : "Cargando..."}
          </pre>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Cookies del navegador:</h2>
          <p><strong>document.cookie:</strong> {clientCookies || "Cargando..."}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Test directo a /api/auth/me:</h2>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/auth/me", { credentials: "include" });
                const data = await response.json();
                console.log("Response /api/auth/me:", response.status, data);
                alert(`Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
              } catch (error) {
                console.error("Error calling /api/auth/me:", error);
                alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Test /api/auth/me
          </button>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => window.location.href = "/admin/servicios"}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ir a Servicios
          </button>
          <button
            onClick={() => window.location.href = "/admin/reportes"}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Ir a Reportes
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Recargar Página
          </button>
        </div>
      </div>
    </div>
  );
} 